import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

type RouteParams = { params: Promise<{ id: string }> };

// ── GET /api/events/[id]/rsvps ────────────────────────────────────────────────
// Admin only. Returns the full RSVP list for an event with member names.
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id: eventId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data, error } = await supabase
    .from("rsvps")
    .select("id, status, guest_count, note, created_at, profiles(id, full_name, email)")
    .eq("event_id", eventId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[GET /api/events/[id]/rsvps]", error.message);
    return NextResponse.json({ error: "Failed to fetch RSVPs" }, { status: 500 });
  }

  const attending = data?.filter(r => r.status === "attending")
    .reduce((sum, r) => sum + (r.guest_count ?? 1), 0) ?? 0;

  return NextResponse.json({ data, summary: { attending, total: data?.length ?? 0 } });
}
