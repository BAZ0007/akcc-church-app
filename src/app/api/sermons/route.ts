import { createClient } from "@/lib/supabase/server";
import { extractYouTubeId } from "@/lib/youtube";
import { createSermonSchema } from "@/lib/validation/sermons";
import { NextRequest, NextResponse } from "next/server";

// ── GET /api/sermons ──────────────────────────────────────────────────────────
// Public. Returns published sermons, paginated. Admins also see unpublished.
export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "12", 10)));
  const offset = (page - 1) * limit;
  const series = searchParams.get("series");

  // Determine if the caller is an admin (admins see unpublished too)
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

  let query = supabase
    .from("sermons")
    .select(
      "id, title, speaker, youtube_url, youtube_id, series, sermon_date, description, published, created_by, created_at, updated_at",
      { count: "exact" }
    )
    .order("sermon_date", { ascending: false })
    .range(offset, offset + limit - 1);

  if (!isAdmin) {
    query = query.eq("published", true);
  }

  if (series) {
    query = query.eq("series", series);
  }

  const { data, count, error } = await query;

  if (error) {
    console.error("[GET /api/sermons]", error.message);
    return NextResponse.json({ error: "Failed to fetch sermons" }, { status: 500 });
  }

  return NextResponse.json({
    data,
    pagination: {
      page,
      limit,
      total: count ?? 0,
      totalPages: Math.ceil((count ?? 0) / limit),
    },
  });
}

// ── POST /api/sermons ─────────────────────────────────────────────────────────
// Admin only. Creates a sermon record.
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Admin check
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

  const parsed = createSermonSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const input = parsed.data;

  // Extract and validate YouTube ID from the provided URL
  const youtubeId = extractYouTubeId(input.youtube_url);
  if (!youtubeId) {
    return NextResponse.json(
      { error: "Validation failed", details: { youtube_url: ["Could not extract a valid YouTube video ID from this URL"] } },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("sermons")
    .insert({
      title: input.title,
      speaker: input.speaker,
      youtube_url: input.youtube_url,
      youtube_id: youtubeId,
      series: input.series ?? null,
      sermon_date: input.sermon_date,
      description: input.description ?? null,
      published: input.published,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error("[POST /api/sermons]", error.message);
    return NextResponse.json({ error: "Failed to create sermon" }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
