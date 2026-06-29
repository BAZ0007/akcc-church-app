import { schedules } from "@trigger.dev/sdk/v3";
import { createClient } from "@supabase/supabase-js";
import { resend, FROM_ADDRESS } from "@/lib/email";

type SermonRow = {
  id: string;
  title: string;
  speaker: string;
  sermon_date: string;
  youtube_id: string;
  series: string | null;
};

type EventRow = {
  id: string;
  title: string;
  location: string;
  starts_at: string;
};

type MemberRow = {
  email: string;
  full_name: string;
};

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Australia/Melbourne",
  });
}

function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Australia/Melbourne",
  });
}

function escHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildDigestHtml(
  memberName: string,
  sermons: SermonRow[],
  events: EventRow[]
): string {
  const safeName = escHtml(memberName);

  const sermonsHtml =
    sermons.length === 0
      ? `<p style="color:#8194A6;font-size:14px">No new sermons this week.</p>`
      : sermons
          .map(
            (s) => `
          <div style="border-left:3px solid #2479C2;padding:8px 12px;margin-bottom:12px">
            <p style="margin:0;font-weight:bold;color:#173A5E">${escHtml(s.title)}</p>
            <p style="margin:4px 0 0;font-size:13px;color:#45596B">${escHtml(s.speaker)} · ${fmtDate(s.sermon_date)}${s.series ? " · " + escHtml(s.series) : ""}</p>
            <a href="https://www.youtube.com/watch?v=${encodeURIComponent(s.youtube_id)}" style="font-size:13px;color:#2479C2">Watch on YouTube →</a>
          </div>`
          )
          .join("");

  const eventsHtml =
    events.length === 0
      ? `<p style="color:#8194A6;font-size:14px">No upcoming events in the next two weeks.</p>`
      : events
          .map(
            (e) => `
          <div style="border-left:3px solid #E0A03A;padding:8px 12px;margin-bottom:12px">
            <p style="margin:0;font-weight:bold;color:#173A5E">${escHtml(e.title)}</p>
            <p style="margin:4px 0 0;font-size:13px;color:#45596B">${fmtDateTime(e.starts_at)} · ${escHtml(e.location)}</p>
          </div>`
          )
          .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/></head>
<body style="font-family:sans-serif;color:#173A5E;max-width:560px;margin:auto;padding:24px;background:#F2F7FB">
  <table width="100%" style="background:#FFFFFF;border-radius:12px;padding:24px;border-collapse:collapse">
    <tr><td>
      <h1 style="color:#2479C2;font-size:20px;margin:0 0 4px">AKCC Weekly Update</h1>
      <p style="color:#8194A6;font-size:13px;margin:0 0 20px">${new Date().toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" })}</p>

      <p style="font-size:14px;color:#45596B">Hi ${safeName},</p>
      <p style="font-size:14px;color:#45596B">Here's what's happening at AKCC this week.</p>

      <h2 style="font-size:16px;color:#173A5E;border-bottom:2px solid #E4EFF8;padding-bottom:6px">New Sermons</h2>
      ${sermonsHtml}

      <h2 style="font-size:16px;color:#173A5E;border-bottom:2px solid #E4EFF8;padding-bottom:6px;margin-top:24px">Upcoming Events</h2>
      ${eventsHtml}

      <hr style="border:none;border-top:1px solid #DCE7F0;margin:24px 0"/>
      <p style="font-size:11px;color:#8194A6;text-align:center">
        Australian Kachin Christian Church · You're receiving this because you're a member.<br/>
        To unsubscribe, contact the church admin.
      </p>
    </td></tr>
  </table>
</body>
</html>`;
}

export const weeklyDigest = schedules.task({
  id: "weekly-digest",
  cron: {
    pattern: "0 8 * * 0",
    timezone: "Australia/Melbourne",
  },
  maxDuration: 180,
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
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAhead = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    const [membersResult, sermonsResult, eventsResult] = await Promise.all([
      supabase
        .from("profiles")
        .select("email, full_name")
        .eq("digest_subscribed", true),

      supabase
        .from("sermons")
        .select("id, title, speaker, sermon_date, youtube_id, series")
        .eq("published", true)
        .gte("created_at", sevenDaysAgo.toISOString())
        .order("sermon_date", { ascending: false }),

      supabase
        .from("events")
        .select("id, title, location, starts_at")
        .eq("published", true)
        .gte("starts_at", now.toISOString())
        .lte("starts_at", fourteenDaysAhead.toISOString())
        .order("starts_at", { ascending: true }),
    ]);

    if (membersResult.error) throw membersResult.error;

    const members = (membersResult.data ?? []) as MemberRow[];
    const sermons = (sermonsResult.data ?? []) as SermonRow[];
    const events = (eventsResult.data ?? []) as EventRow[];

    if (members.length === 0) {
      console.log("[weekly-digest] No subscribed members — nothing to send.");
      return { sent: 0 };
    }

    if (sermons.length === 0 && events.length === 0) {
      console.log("[weekly-digest] No new content this week — skipping digest.");
      return { sent: 0, reason: "no-content" };
    }

    const emails = members.map((m) => ({
      from: FROM_ADDRESS,
      to: m.email,
      subject: `AKCC Weekly Update — ${now.toLocaleDateString("en-AU", { day: "numeric", month: "long" })}`,
      html: buildDigestHtml(m.full_name, sermons, events),
    }));

    const BATCH_SIZE = 50;
    let totalSent = 0;

    for (let i = 0; i < emails.length; i += BATCH_SIZE) {
      const batch = emails.slice(i, i + BATCH_SIZE);
      const { error } = await resend.batch.send(batch);
      if (error) {
        console.error(`[weekly-digest] Batch ${i / BATCH_SIZE + 1} failed:`, error);
        throw new Error(`Resend batch error: ${JSON.stringify(error)}`);
      }
      totalSent += batch.length;
      console.log(`[weekly-digest] Sent batch ${i / BATCH_SIZE + 1}: ${batch.length} emails.`);
    }

    return {
      sent: totalSent,
      sermons: sermons.length,
      events: events.length,
    };
  },
});
