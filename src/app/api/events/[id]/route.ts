import { createClient } from "@/lib/supabase/server";
import { updateEventSchema } from "@/lib/validation/events";
import { isValidUUID } from "@/lib/validation/uuid";
import { NextRequest, NextResponse } from "next/server";

type RouteParams = { params: Promise<{ id: string }> };

// ── GET /api/events/[id] ──────────────────────────────────────────────────────
// Public. Returns a single event. If the caller is authenticated, also returns
// their RSVP for this event (if any).
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

  const { data: event, error } = await supabase
    .from("events")
    .select(
      "id, title, description, location, starts_at, ends_at, capacity, published, created_by, created_at, updated_at"
    )
    .eq("id", id)
    .single();

  if (error || !event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  // Non-admins cannot see unpublished events
  if (!event.published && !isAdmin) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  // Fetch the caller's RSVP if they are authenticated
  let myRsvp = null;
  if (user) {
    const { data: rsvp } = await supabase
      .from("rsvps")
      .select("id, status, guest_count, note, created_at, updated_at")
      .eq("event_id", id)
      .eq("user_id", user.id)
      .maybeSingle();
    myRsvp = rsvp ?? null;
  }

  // Fetch total attending count (sum of guest_count for attending RSVPs)
  const { data: attendanceSums } = await supabase
    .from("rsvps")
    .select("guest_count")
    .eq("event_id", id)
    .eq("status", "attending");

  const totalAttending =
    attendanceSums?.reduce((sum, r) => sum + (r.guest_count ?? 1), 0) ?? 0;

  return NextResponse.json({
    ...event,
    total_attending: totalAttending,
    my_rsvp: myRsvp,
  });
}

// ── PATCH /api/events/[id] ────────────────────────────────────────────────────
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

  const parsed = updateEventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  // Fetch current event so we can validate starts_at / ends_at when only one is updated
  const { data: existing } = await supabase
    .from("events")
    .select("starts_at, ends_at")
    .eq("id", id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const input = parsed.data;

  // Cross-field validation: if only one of starts_at / ends_at changes, check
  // the combined result against the persisted value.
  const effectiveStartsAt = input.starts_at ?? existing.starts_at;
  const effectiveEndsAt =
    "ends_at" in input ? input.ends_at : existing.ends_at;

  if (effectiveEndsAt && new Date(effectiveEndsAt) <= new Date(effectiveStartsAt)) {
    return NextResponse.json(
      { error: "Validation failed", details: { ends_at: ["ends_at must be after starts_at"] } },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("events")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
    console.error("[PATCH /api/events/[id]]", error.message);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }

  return NextResponse.json(data);
}

// ── DELETE /api/events/[id] ───────────────────────────────────────────────────
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

  const { data: existing } = await supabase
    .from("events")
    .select("id")
    .eq("id", id)
    .single();
  if (!existing) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const { error } = await supabase.from("events").delete().eq("id", id);

  if (error) {
    console.error("[DELETE /api/events/[id]]", error.message);
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
