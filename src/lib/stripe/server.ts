import Stripe from "stripe";

// SERVER-ONLY — never import this file from client components or pages marked "use client"
if (typeof window !== "undefined") {
  throw new Error("src/lib/stripe/server.ts must only be imported server-side");
}

// || fallback prevents constructor throw during `next build` when the env
// var is absent; any real API call will still fail with auth error at runtime.
export const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY || "sk_test_placeholder_build_only",
  {
    apiVersion: "2026-05-27.dahlia",
    typescript: true,
  }
);
