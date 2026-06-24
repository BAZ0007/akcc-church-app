// SERVER-ONLY — never import this file from client components, pages with "use client",
// or any NEXT_PUBLIC_ code paths.
if (typeof window !== "undefined") {
  throw new Error(
    "src/lib/supabase/admin.ts must only be imported server-side. " +
      "Do not use it in client components."
  );
}

import { createClient } from "@supabase/supabase-js";

/**
 * Supabase admin client that uses the SERVICE_ROLE key.
 * It bypasses all Row Level Security policies.
 * Only use this for trusted server-side operations (e.g. Stripe webhooks,
 * admin background jobs).
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      // Disable the Supabase Auth listener — this client acts as the service role,
      // not as an end-user session.
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
