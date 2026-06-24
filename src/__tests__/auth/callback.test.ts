/**
 * Tests for GET /auth/callback — open-redirect prevention.
 *
 * Strategy: mock next/server so we can use real NextRequest/NextResponse-like
 * objects without the full Next.js runtime, and mock @/lib/supabase/server so
 * exchangeCodeForSession never hits the network.
 */

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn().mockResolvedValue({
    auth: {
      exchangeCodeForSession: jest
        .fn()
        .mockResolvedValue({ error: null }),
    },
  }),
}));

// We mock next/server with real-enough implementations so the route module
// can call `new URL(request.url)` and `NextResponse.redirect(new URL(...))`.
jest.mock("next/server", () => {
  class MockNextRequest {
    url: string;
    constructor(url: string) {
      this.url = url;
    }
  }

  class MockNextResponse {
    redirectUrl: string;
    constructor(redirectUrl: string) {
      this.redirectUrl = redirectUrl;
    }
    static redirect(url: URL | string) {
      return new MockNextResponse(url instanceof URL ? url.toString() : url);
    }
  }

  return { NextRequest: MockNextRequest, NextResponse: MockNextResponse };
});

// ── Import AFTER mocks ────────────────────────────────────────────────────────

import { NextRequest } from "next/server";
import { GET } from "@/app/auth/callback/route";

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeRequest(params: Record<string, string>) {
  const qs = new URLSearchParams(params).toString();
  return new NextRequest(`http://localhost:3000/auth/callback?${qs}`);
}

function redirectedTo(response: unknown): string {
  return (response as { redirectUrl: string }).redirectUrl;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("GET /auth/callback — open-redirect prevention", () => {
  it("redirects to /profile when next=//evil.com (protocol-relative)", async () => {
    const res = await GET(makeRequest({ code: "abc", next: "//evil.com" }));
    const url = redirectedTo(res);
    expect(url).not.toContain("//evil.com");
    expect(url).toMatch(/\/profile$/);
  });

  it("redirects to /profile when next=/\\/evil.com (backslash trick)", async () => {
    const res = await GET(makeRequest({ code: "abc", next: "/\\/evil.com" }));
    const url = redirectedTo(res);
    expect(url).not.toContain("evil.com");
    expect(url).toMatch(/\/profile$/);
  });

  it("redirects to /profile when next is a full URL (https://evil.com)", async () => {
    const res = await GET(
      makeRequest({ code: "abc", next: "https://evil.com" })
    );
    const url = redirectedTo(res);
    expect(url).not.toContain("evil.com");
    expect(url).toMatch(/\/profile$/);
  });

  it("redirects to /profile when next=/profile", async () => {
    const res = await GET(makeRequest({ code: "abc", next: "/profile" }));
    const url = redirectedTo(res);
    expect(url).toMatch(/\/profile$/);
  });

  it("follows a safe deep path like /admin/sermons", async () => {
    const res = await GET(
      makeRequest({ code: "abc", next: "/admin/sermons" })
    );
    const url = redirectedTo(res);
    expect(url).toMatch(/\/admin\/sermons$/);
  });

  it("redirects to /login?error=missing_code when code param is absent", async () => {
    const res = await GET(makeRequest({}));
    const url = redirectedTo(res);
    expect(url).toMatch(/\/login\?error=missing_code$/);
  });
});
