import Stripe from "stripe";

// SERVER-ONLY — never import this file from client components or pages marked "use client"
if (typeof window !== "undefined") {
  throw new Error("src/lib/stripe/server.ts must only be imported server-side");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-05-27.dahlia",
  typescript: true,
});
