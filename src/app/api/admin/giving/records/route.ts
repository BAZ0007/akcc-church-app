import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// ── GET /api/admin/giving/records ─────────────────────────────────────────────
// Admin only. Paginated list of completed givings with donor info.
export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));
  const offset = (page - 1) * limit;
  const fund = searchParams.get("fund");

  let query = supabase
    .from("givings")
    .select("id, amount_cents, currency, fund, frequency, status, receipt_email, paid_at, created_at, profiles(full_name, email)", { count: "exact" })
    .eq("status", "completed")
    .order("paid_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (fund && ["general", "building", "missions"].includes(fund)) {
    query = query.eq("fund", fund);
  }

  const { data, count, error } = await query;
  if (error) {
    console.error("[GET /api/admin/giving/records]", error.message);
    return NextResponse.json({ error: "Failed to fetch giving records" }, { status: 500 });
  }

  return NextResponse.json({
    data,
    pagination: { page, limit, total: count ?? 0, totalPages: Math.ceil((count ?? 0) / limit) },
  });
}
