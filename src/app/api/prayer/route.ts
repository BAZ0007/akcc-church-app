import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { tasks } from "@trigger.dev/sdk/v3";
import type { PrayerNotifyPayload } from "@/trigger/prayer-notify";
import { z } from "zod";

const schema = z.object({
  request: z.string().min(10, "Please write at least 10 characters.").max(1000, "Request must be under 1000 characters."),
  name: z.string().max(100).optional().nullable(),
  is_public: z.boolean().optional().default(false),
});

// ── POST /api/prayer ──────────────────────────────────────────────────────────
// Open to all (anon + authenticated). Creates a prayer request and fires the
// prayer-notify Trigger.dev task to alert the admin.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 422 }
    );
  }

  const { request, name, is_public } = parsed.data;

  // Use the server Supabase client so RLS applies with the current auth context.
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: row, error } = await supabase
    .from("prayer_requests")
    .insert({
      user_id: user?.id ?? null,
      name: name ?? null,
      request,
      is_public,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[POST /api/prayer]", error.message);
    return NextResponse.json({ error: "Failed to submit prayer request." }, { status: 500 });
  }

  // Fire-and-forget: trigger admin notification (don't block the response).
  const notifyPayload: PrayerNotifyPayload = {
    prayerRequestId: row.id,
    name: name ?? null,
    request,
    isPublic: is_public ?? false,
  };

  tasks.trigger("prayer-notify", notifyPayload).catch((err: unknown) => {
    console.error("[POST /api/prayer] prayer-notify trigger failed:", err);
  });

  return NextResponse.json({ ok: true, id: row.id }, { status: 201 });
}

// ── GET /api/prayer ───────────────────────────────────────────────────────────
// Returns paginated public prayer requests (RLS enforces is_public = TRUE).
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = 20;
  const offset = (page - 1) * limit;

  const supabase = await createClient();

  const { data, error, count } = await supabase
    .from("prayer_requests")
    .select("id, name, request, created_at", { count: "exact" })
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: "Failed to fetch prayer requests." }, { status: 500 });
  }

  return NextResponse.json({
    data: data ?? [],
    pagination: { page, limit, total: count ?? 0 },
  });
}
