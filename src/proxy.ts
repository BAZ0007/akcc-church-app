import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

// Routes that require the user to be logged in (but not necessarily admin)
const PROTECTED_ROUTES = ["/profile", "/giving/success", "/giving/cancel"];

// Route prefixes that require admin role
const ADMIN_PREFIX = "/admin";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Build the initial response — we pass this into createServerClient so that
  // cookie refreshes are written back on every request.
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Write cookies onto the request so downstream server components can
          // read the freshly-refreshed session tokens.
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          // Rebuild the response with the mutated request so the new cookies
          // are sent back to the browser.
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Always call getUser() to refresh the session. The return value drives all
  // auth decisions below. Never trust client-passed headers.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ── Redirect loop prevention ──────────────────────────────────────────────
  // If the user is already authenticated and navigates to /login, send them
  // to /profile so they don't get stuck.
  if (pathname === "/login" && user) {
    return NextResponse.redirect(new URL("/profile", request.url));
  }

  // ── Admin routes ──────────────────────────────────────────────────────────
  if (pathname.startsWith(ADMIN_PREFIX)) {
    // Not logged in at all — redirect to login
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirectedFrom", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Logged in — verify admin role by querying the DB.
    // We use the anon client here; the RLS policy on profiles allows any
    // authenticated user to read profiles, so this is fine.
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      // Authenticated but not an admin — redirect to home
      return NextResponse.redirect(new URL("/", request.url));
    }

    return response;
  }

  // ── Protected member routes ───────────────────────────────────────────────
  const isProtected = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  if (isProtected && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Public routes — just pass through with refreshed cookies ─────────────
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
