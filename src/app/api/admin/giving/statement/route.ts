import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { tasks } from "@trigger.dev/sdk/v3";
import type { GivingStatementPayload } from "@/trigger/giving-statement";

// ── POST /api/admin/giving/statement ──────────────────────────────────────────
// Admin only. Enqueues a giving-statement Trigger.dev task for the given member.
export async function POST(req: NextRequest) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { userId, year } = body as { userId?: string; year?: number };

  if (!userId || typeof userId !== "string") {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }
  if (!year || typeof year !== "number" || year < 2020 || year > new Date().getFullYear()) {
    return NextResponse.json({ error: "year is required and must be valid" }, { status: 400 });
  }

  // Look up the member's email and name (service role not needed — admin RLS allows this)
  const { data: member, error: memberError } = await supabase
    .from("profiles")
    .select("email, full_name")
    .eq("id", userId)
    .single();

  if (memberError || !member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  const payload: GivingStatementPayload = {
    userId,
    year,
    memberEmail: member.email,
    memberName: member.full_name,
  };

  const handle = await tasks.trigger("giving-statement", payload);

  return NextResponse.json({ ok: true, runId: handle.id });
}
