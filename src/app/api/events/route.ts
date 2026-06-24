import { createClient } from "@/lib/supabase/server";
import { createEventSchema } from "@/lib/validation/events";
import { NextRequest, NextResponse } from "next/server";

// ── GET /api/events ───────────────────────────────────────────────────────────
// Public. Returns upcoming published events.
// Admins can also see past and unpublished events by passing ?all=true.
export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));
  const offset = (page - 1) * limit;
  const showAll = searchParams.get("all") === "true";

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
    .from("events")
    .select(
      "id, title, description, location, starts_at, ends_at, capacity, published, created_by, created_at, updated_at",
      { count: "exact" }
    )
    .order("starts_at", { ascending: true })
    .range(offset, offset + limit - 1);

  if (!isAdmin) {
    // Public: only published, upcoming events
    query = query
      .eq("published", true)
      .gte("starts_at", new Date().toISOString());
  } else if (!showAll) {
    // Admin default: upcoming (published or not)
    query = query.gte("starts_at", new Date().toISOString());
  }
  // Admin + showAll: no filters — everything

  const { data, count, error } = await query;

  if (error) {
    console.error("[GET /api/events]", error.message);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
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

// ── POST /api/events ──────────────────────────────────────────────────────────
// Admin only. Creates an event.
export async function POST(request: NextRequest) {
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

  const parsed = createEventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const input = parsed.data;

  const { data, error } = await supabase
    .from("events")
    .insert({
      title: input.title,
      description: input.description ?? null,
      location: input.location,
      starts_at: input.starts_at,
      ends_at: input.ends_at ?? null,
      capacity: input.capacity ?? null,
      published: input.published,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error("[POST /api/events]", error.message);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
