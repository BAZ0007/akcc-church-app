import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// ── GET /api/giving/presets ───────────────────────────────────────────────────
// Public. Returns active giving preset amounts, ordered by sort_order.
export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("giving_presets")
    .select("id, amount_cents, label, sort_order")
    .eq("active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("[GET /api/giving/presets]", error.message);
    return NextResponse.json({ error: "Failed to fetch giving presets" }, { status: 500 });
  }

  return NextResponse.json({ data });
}
