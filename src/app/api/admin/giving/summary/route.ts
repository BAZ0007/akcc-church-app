import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// ── GET /api/admin/giving/summary ─────────────────────────────────────────────
// Admin only. Returns aggregate giving stats.
export async function GET() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // All completed givings
  const { data: givings, error } = await supabase
    .from("givings")
    .select("amount_cents, fund, frequency, paid_at, created_at")
    .eq("status", "completed");

  if (error) {
    console.error("[GET /api/admin/giving/summary]", error.message);
    return NextResponse.json({ error: "Failed to fetch giving summary" }, { status: 500 });
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const allTime = givings?.reduce((sum, g) => sum + g.amount_cents, 0) ?? 0;
  const thisMonth = givings
    ?.filter(g => g.paid_at && g.paid_at >= startOfMonth)
    .reduce((sum, g) => sum + g.amount_cents, 0) ?? 0;

  const byFund = { general: 0, building: 0, missions: 0 } as Record<string, number>;
  givings?.forEach(g => { byFund[g.fund] = (byFund[g.fund] ?? 0) + g.amount_cents; });

  return NextResponse.json({
    allTimeCents: allTime,
    thisMonthCents: thisMonth,
    byFund,
    totalGifts: givings?.length ?? 0,
  });
}
