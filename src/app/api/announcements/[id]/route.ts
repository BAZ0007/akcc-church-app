import { createClient } from "@/lib/supabase/server";
import { updateAnnouncementSchema } from "@/lib/validation/announcements";
import { isValidUUID } from "@/lib/validation/uuid";
import { NextRequest, NextResponse } from "next/server";

type RouteParams = { params: Promise<{ id: string }> };

async function requireAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return { user: null, error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  return { user, error: null };
}

// ── PATCH /api/announcements/[id] ────────────────────────────────────────────
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  if (!isValidUUID(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const supabase = await createClient();
  const { error: authError } = await requireAdmin(supabase);
  if (authError) return authError;

  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }); }

  const parsed = updateAnnouncementSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("announcements")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select().single();

  if (error) {
    console.error("[PATCH /api/announcements/[id]]", error.message);
    return NextResponse.json({ error: "Failed to update announcement" }, { status: 500 });
  }
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(data);
}

// ── DELETE /api/announcements/[id] ───────────────────────────────────────────
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  if (!isValidUUID(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const supabase = await createClient();
  const { error: authError } = await requireAdmin(supabase);
  if (authError) return authError;

  const { error } = await supabase.from("announcements").delete().eq("id", id);
  if (error) {
    console.error("[DELETE /api/announcements/[id]]", error.message);
    return NextResponse.json({ error: "Failed to delete announcement" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
