import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /auth/callback
 *
 * Supabase OAuth / magic-link callback handler.
 * After the user authenticates (Google OAuth, magic link, etc.) Supabase
 * redirects here with a one-time `code` query param.  We exchange it for a
 * session and redirect the user onward.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Allow an optional post-auth destination (e.g. a deep-link the user was
  // trying to reach before being asked to log in).
  const next = searchParams.get("next") ?? "/profile";

  if (!code) {
    // No code — the user probably hit this URL directly or the link expired.
    return NextResponse.redirect(
      new URL("/login?error=missing_code", origin)
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[auth/callback] exchangeCodeForSession error:", error.message);
    return NextResponse.redirect(
      new URL("/login?error=auth", origin)
    );
  }

  // Validate `next` to prevent open-redirect:
  // Must start with exactly one "/" and not be protocol-relative ("//", "/\")
  const isSafePath = /^\/[^/\\]/.test(next) || next === "/";
  const redirectPath = isSafePath ? next : "/profile";
  return NextResponse.redirect(new URL(redirectPath, origin));
}
