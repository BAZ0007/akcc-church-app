import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { emitToN8n } from "@/lib/n8n";

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

  // Detect new signups by created_at freshness (< 2 min old = first confirmation).
  // We do NOT rely on the spoofable type= query param — created_at is set
  // server-side by Supabase and cannot be manipulated via the callback URL.
  // Fire-and-forget: never block the redirect or break auth if n8n is down.
  supabase.auth.getUser().then(({ data: { user } }) => {
    if (!user) return;
    const ageMs = Date.now() - new Date(user.created_at).getTime();
    if (ageMs > 2 * 60 * 1000) return; // not a fresh signup
    emitToN8n("member.signup", {
      userId: user.id,
      email: user.email ?? "",
      fullName: (user.user_metadata?.full_name as string | undefined) ?? "",
    }).catch((err: unknown) => {
      console.error("[auth/callback] member.signup emit failed:", err);
    });
  }).catch(() => {/* non-critical */});

  // Validate `next` to prevent open-redirect:
  // Must start with exactly one "/" and not be protocol-relative ("//", "/\")
  const isSafePath = /^\/[^/\\]/.test(next) || next === "/";
  const redirectPath = isSafePath ? next : "/profile";
  return NextResponse.redirect(new URL(redirectPath, origin));
}
