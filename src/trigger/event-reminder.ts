import { schedules } from "@trigger.dev/sdk/v3";
import { createClient } from "@supabase/supabase-js";
import { resend, FROM_ADDRESS } from "@/lib/email";

type ProfileFields = { email: string; full_name: string };

// Supabase returns the joined side as an array for fk-joined selects.
type RsvpRow = {
  profiles: ProfileFields[] | ProfileFields | null;
};

type EventRow = {
  id: string;
  title: string;
  starts_at: string;
  location: string;
};

function escHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildReminderHtml(event: EventRow, recipientName: string): string {
  const date = new Date(event.starts_at).toLocaleString("en-AU", {
    timeZone: "Australia/Melbourne",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const safeTitle = escHtml(event.title);
  const safeName = escHtml(recipientName);
  const safeLocation = escHtml(event.location);
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /></head>
<body style="font-family:sans-serif;color:#173A5E;max-width:560px;margin:auto;padding:24px">
  <h2 style="color:#2479C2">Reminder: ${safeTitle}</h2>
  <p>Hi ${safeName},</p>
  <p>This is a friendly reminder that you are registered for <strong>${safeTitle}</strong>, happening <strong>tomorrow</strong>.</p>
  <table style="width:100%;border-collapse:collapse;margin:16px 0">
    <tr><td style="padding:6px 0;color:#8194A6;width:80px">When</td><td style="padding:6px 0"><strong>${date}</strong></td></tr>
    <tr><td style="padding:6px 0;color:#8194A6">Where</td><td style="padding:6px 0"><strong>${safeLocation}</strong></td></tr>
  </table>
  <p>We look forward to seeing you there. God bless!</p>
  <hr style="border:none;border-top:1px solid #DCE7F0;margin:24px 0" />
  <p style="font-size:12px;color:#8194A6">Australian Kachin Christian Church · You received this because you RSVP&apos;d to this event.</p>
</body>
</html>`;
}

export const eventReminder = schedules.task({
  id: "event-reminder",
  cron: {
    pattern: "0 * * * *",
    timezone: "Australia/Melbourne",
  },
  maxDuration: 120,
  retry: {
    maxAttempts: 3,
    minTimeoutInMs: 5000,
    maxTimeoutInMs: 30000,
    factor: 2,
  },
  run: async () => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    const now = new Date();
    const windowStart = new Date(now.getTime() + 23 * 60 * 60 * 1000);
    const windowEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000);

    const { data: events, error: eventsError } = await supabase
      .from("events")
      .select("id, title, starts_at, location")
      .gte("starts_at", windowStart.toISOString())
      .lte("starts_at", windowEnd.toISOString())
      .is("reminder_sent_at", null)
      .eq("published", true);

    if (eventsError) throw eventsError;
    if (!events?.length) {
      console.log("[event-reminder] No events in 24 h window — nothing to do.");
      return { reminders: 0, emails: 0 };
    }

    let totalEmails = 0;

    for (const event of events as EventRow[]) {
      // Mark before sending — idempotency guard (at-most-once delivery).
      // If the email API call fails the job retries, but this event is already
      // marked so it won't be re-attempted. Log any send errors instead.
      const { error: markError } = await supabase
        .from("events")
        .update({ reminder_sent_at: now.toISOString() })
        .eq("id", event.id);

      if (markError) {
        console.error(`[event-reminder] Could not mark event ${event.id}:`, markError.message);
        continue;
      }

      const { data: rsvps, error: rsvpError } = await supabase
        .from("rsvps")
        .select("profiles(email, full_name)")
        .eq("event_id", event.id)
        .eq("status", "attending");

      if (rsvpError) {
        console.error(`[event-reminder] RSVP fetch failed for event ${event.id}:`, rsvpError.message);
        continue;
      }

      const recipients = (rsvps as unknown as RsvpRow[]).flatMap((r) => {
        if (!r.profiles) return [];
        return Array.isArray(r.profiles) ? r.profiles : [r.profiles];
      });

      if (!recipients.length) {
        console.log(`[event-reminder] Event ${event.id} has no attending RSVPs — skipped.`);
        continue;
      }

      const emails = recipients.map((r) => ({
        from: FROM_ADDRESS,
        to: r.email,
        subject: `Reminder: ${event.title} is tomorrow`,
        html: buildReminderHtml(event, r.full_name),
      }));

      const { error: sendError } = await resend.batch.send(emails);

      if (sendError) {
        console.error(`[event-reminder] Resend batch failed for event ${event.id}:`, sendError);
      } else {
        totalEmails += recipients.length;
        console.log(`[event-reminder] Sent ${recipients.length} reminder(s) for "${event.title}".`);
      }
    }

    return { reminders: events.length, emails: totalEmails };
  },
});
