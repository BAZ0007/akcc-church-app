import { task } from "@trigger.dev/sdk/v3";
import { resend, FROM_ADDRESS } from "@/lib/email";

export type PrayerNotifyPayload = {
  prayerRequestId: string;
  name: string | null;
  request: string;
  isPublic: boolean;
};

export const prayerNotify = task({
  id: "prayer-notify",
  maxDuration: 60,
  retry: {
    maxAttempts: 3,
    minTimeoutInMs: 3000,
    maxTimeoutInMs: 15000,
    factor: 2,
  },
  run: async (payload: PrayerNotifyPayload) => {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      console.warn("[prayer-notify] ADMIN_EMAIL is not set — skipping notification.");
      return { ok: false, reason: "ADMIN_EMAIL not configured" };
    }

    const submitter = (payload.name?.trim() || "Anonymous").replace(/[\r\n]/g, " ");
    const visibility = payload.isPublic ? "Public (will appear on prayer wall)" : "Private (pastoral team only)";

    const safeRequest = payload.request
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    const safeName = submitter
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: adminEmail,
      subject: `New Prayer Request — ${submitter}`,
      html: `
        <h2 style="color:#2479C2">New Prayer Request</h2>
        <table style="width:100%;border-collapse:collapse;margin:12px 0;font-family:sans-serif">
          <tr><td style="padding:6px 0;color:#8194A6;width:100px">From</td><td style="padding:6px 0;color:#173A5E"><strong>${safeName}</strong></td></tr>
          <tr><td style="padding:6px 0;color:#8194A6">Visibility</td><td style="padding:6px 0;color:#173A5E">${visibility}</td></tr>
          <tr><td style="padding:6px 0;color:#8194A6">ID</td><td style="padding:6px 0;font-size:12px;color:#8194A6">${payload.prayerRequestId}</td></tr>
        </table>
        <div style="background:#F2F7FB;border-radius:8px;padding:16px;margin:16px 0;font-family:sans-serif;color:#173A5E;white-space:pre-wrap">${safeRequest}</div>
        <hr style="border:none;border-top:1px solid #DCE7F0;margin:20px 0"/>
        <p style="font-size:12px;color:#8194A6">Australian Kachin Christian Church · AKCC Admin</p>
      `,
    });

    if (error) throw new Error(`Resend error: ${JSON.stringify(error)}`);

    console.log(`[prayer-notify] Admin notified of prayer request ${payload.prayerRequestId}.`);
    return { ok: true };
  },
});
