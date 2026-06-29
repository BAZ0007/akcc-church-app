import { createHmac } from "crypto";

if (typeof window !== "undefined") {
  throw new Error("src/lib/n8n.ts must only be imported server-side.");
}

export type N8nEventPayload = {
  event: string;
  timestamp: string;
  data: Record<string, unknown>;
};

/**
 * Signs `body` with HMAC-SHA256 using N8N_WEBHOOK_SECRET.
 * Throws if the secret is missing — sending unsigned to a configured endpoint
 * is a security misconfiguration, not a graceful skip.
 */
function sign(body: string): string {
  const secret = process.env.N8N_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error(
      "N8N_WEBHOOK_SECRET is not set. Cannot send signed webhook."
    );
  }
  return createHmac("sha256", secret).update(body).digest("hex");
}

/**
 * Emits a signed event to the configured n8n webhook URL.
 *
 * If N8N_WEBHOOK_URL is not set the call is a no-op (n8n may not be running
 * in dev). If N8N_WEBHOOK_URL IS set, N8N_WEBHOOK_SECRET must also be set or
 * this throws — unsigned payloads to a live endpoint are rejected.
 *
 * n8n workflows verify the X-AKCC-Signature header before processing.
 */
export async function emitToN8n(
  event: string,
  data: Record<string, unknown>
): Promise<void> {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn(`[n8n] N8N_WEBHOOK_URL not set — skipping event: ${event}`);
    return;
  }

  const envelope: N8nEventPayload = {
    event,
    timestamp: new Date().toISOString(),
    data,
  };

  const body = JSON.stringify(envelope);
  const signature = sign(body);

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-AKCC-Signature": `sha256=${signature}`,
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "(no body)");
    throw new Error(`[n8n] Webhook returned ${res.status}: ${text}`);
  }

  console.log(`[n8n] Event emitted: ${event}`);
}
