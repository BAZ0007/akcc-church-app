import { createClient } from "@/lib/supabase/server";
import { createAnnouncementSchema } from "@/lib/validation/announcements";
import { NextRequest, NextResponse } from "next/server";

// ── GET /api/announcements ────────────────────────────────────────────────────
// Public. Returns published non-expired announcements (pinned first).
export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(20, Math.max(1, parseInt(searchParams.get("limit") ?? "10", 10)));
  const offset = (page - 1) * limit;

  const { data: { user } } = await supabase.auth.getUser();
  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles").select("role").eq("id", user.id).single();
    isAdmin = profile?.role === "admin";
  }

  let query = supabase
    .from("announcements")
    .select("id, title, body, pinned, published, expires_at, created_at", { count: "exact" })
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (!isAdmin) {
    query = query
      .eq("published", true)
      .or("expires_at.is.null,expires_at.gt." + new Date().toISOString());
  }

  const { data, count, error } = await query;
  if (error) {
    console.error("[GET /api/announcements]", error.message);
    return NextResponse.json({ error: "Failed to fetch announcements" }, { status: 500 });
  }

  return NextResponse.json({
    data,
    pagination: { page, limit, total: count ?? 0, totalPages: Math.ceil((count ?? 0) / limit) },
  });
}

// ── POST /api/announcements ───────────────────────────────────────────────────
// Admin only.
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }); }

  const parsed = createAnnouncementSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("announcements")
    .insert({ ...parsed.data, created_by: user.id })
    .select().single();

  if (error) {
    console.error("[POST /api/announcements]", error.message);
    return NextResponse.json({ error: "Failed to create announcement" }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
