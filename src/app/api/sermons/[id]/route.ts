import { createClient } from "@/lib/supabase/server";
import { extractYouTubeId } from "@/lib/youtube";
import { updateSermonSchema } from "@/lib/validation/sermons";
import { isValidUUID } from "@/lib/validation/uuid";
import { NextRequest, NextResponse } from "next/server";

type RouteParams = { params: Promise<{ id: string }> };

// ── GET /api/sermons/[id] ─────────────────────────────────────────────────────
// Public. Returns a single sermon. Unpublished sermons only visible to admins.
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  if (!isValidUUID(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    isAdmin = profile?.role === "admin";
  }

  const { data, error } = await supabase
    .from("sermons")
    .select(
      "id, title, speaker, youtube_url, youtube_id, series, sermon_date, description, published, created_by, created_at, updated_at"
    )
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Sermon not found" }, { status: 404 });
  }

  // Non-admins cannot view unpublished sermons
  if (!data.published && !isAdmin) {
    return NextResponse.json({ error: "Sermon not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}

// ── PATCH /api/sermons/[id] ───────────────────────────────────────────────────
// Admin only. Partial update.
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = updateSermonSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const input = parsed.data;
  const updates: Record<string, unknown> = { ...input };

  // If youtube_url is being updated, re-derive youtube_id
  if (input.youtube_url) {
    const youtubeId = extractYouTubeId(input.youtube_url);
    if (!youtubeId) {
      return NextResponse.json(
        { error: "Validation failed", details: { youtube_url: ["Could not extract a valid YouTube video ID"] } },
        { status: 400 }
      );
    }
    updates.youtube_id = youtubeId;
  }

  const { data, error } = await supabase
    .from("sermons")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json({ error: "Sermon not found" }, { status: 404 });
    }
    console.error("[PATCH /api/sermons/[id]]", error.message);
    return NextResponse.json({ error: "Failed to update sermon" }, { status: 500 });
  }

  return NextResponse.json(data);
}

// ── DELETE /api/sermons/[id] ──────────────────────────────────────────────────
// Admin only.
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Verify it exists first
  const { data: existing } = await supabase
    .from("sermons")
    .select("id")
    .eq("id", id)
    .single();
  if (!existing) {
    return NextResponse.json({ error: "Sermon not found" }, { status: 404 });
  }

  const { error } = await supabase.from("sermons").delete().eq("id", id);

  if (error) {
    console.error("[DELETE /api/sermons/[id]]", error.message);
    return NextResponse.json({ error: "Failed to delete sermon" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
