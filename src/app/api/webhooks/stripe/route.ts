import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe/server";
import { emitToN8n } from "@/lib/n8n";

// Stripe requires the raw body for signature verification — do not parse JSON here.
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const sig = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !secret) {
    console.error("[webhooks/stripe] Missing stripe-signature or STRIPE_WEBHOOK_SECRET");
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, secret);
  } catch (err) {
    console.error("[webhooks/stripe] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // Fire-and-forget: n8n sends donor thank-you + admin notification
    emitToN8n("giving.received", {
      sessionId: session.id,
      amountCents: session.amount_total ?? 0,
      currency: (session.currency ?? "aud").toUpperCase(),
      donorEmail: session.customer_details?.email ?? session.customer_email ?? "",
      donorName: session.customer_details?.name ?? "",
      fund: (session.metadata?.fund as string | undefined) ?? "general",
    }).catch((err: unknown) => {
      console.error("[webhooks/stripe] giving.received emit failed:", err);
    });
  }

  // Always return 200 — Stripe retries on anything else
  return NextResponse.json({ received: true });
}
