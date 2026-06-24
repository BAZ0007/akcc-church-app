import { createClient } from "@/lib/supabase/server";
import { createRsvpSchema } from "@/lib/validation/events";
import { isValidUUID } from "@/lib/validation/uuid";
import { NextRequest, NextResponse } from "next/server";

type RouteParams = { params: Promise<{ id: string }> };

// ── POST /api/events/[id]/rsvp ────────────────────────────────────────────────
// Authenticated members. Upserts an RSVP for the given event.
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id: eventId } = await params;
  if (!isValidUUID(eventId)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify the event exists and is published (members cannot RSVP to hidden events)
  const { data: event } = await supabase
    .from("events")
    .select("id, published, capacity, starts_at")
    .eq("id", eventId)
    .single();

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  if (!event.published) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = createRsvpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const input = parsed.data;

  // Capacity check — only enforce when marking attending
  if (input.status === "attending" && event.capacity !== null) {
    // Sum all attending guest_count EXCLUDING this user's existing RSVP
    const { data: attendees } = await supabase
      .from("rsvps")
      .select("guest_count")
      .eq("event_id", eventId)
      .eq("status", "attending")
      .neq("user_id", user.id);

    const currentTotal = attendees?.reduce((sum, r) => sum + (r.guest_count ?? 1), 0) ?? 0;

    if (currentTotal + input.guest_count > event.capacity) {
      return NextResponse.json(
        {
          error: "Event is at or over capacity",
          available: Math.max(0, event.capacity - currentTotal),
        },
        { status: 409 }
      );
    }
  }

  // Upsert — update on (event_id, user_id) conflict
  const { data, error } = await supabase
    .from("rsvps")
    .upsert(
      {
        event_id: eventId,
        user_id: user.id,
        status: input.status,
        guest_count: input.guest_count,
        note: input.note ?? null,
      },
      { onConflict: "event_id,user_id" }
    )
    .select()
    .single();

  if (error) {
    console.error("[POST /api/events/[id]/rsvp]", error.message);
    return NextResponse.json({ error: "Failed to save RSVP" }, { status: 500 });
  }

  return NextResponse.json(data, { status: 200 });
}

// ── DELETE /api/events/[id]/rsvp ──────────────────────────────────────────────
// Authenticated member. Removes their RSVP for this event.
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id: eventId } = await params;
  if (!isValidUUID(eventId)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check a row actually exists before attempting delete
  const { data: existing } = await supabase
    .from("rsvps")
    .select("id")
    .eq("event_id", eventId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json({ error: "RSVP not found" }, { status: 404 });
  }

  const { error } = await supabase
    .from("rsvps")
    .delete()
    .eq("event_id", eventId)
    .eq("user_id", user.id);

  if (error) {
    console.error("[DELETE /api/events/[id]/rsvp]", error.message);
    return NextResponse.json({ error: "Failed to delete RSVP" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
