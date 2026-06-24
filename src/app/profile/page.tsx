import { redirect } from "next/navigation";
import { getDictionary } from "@/i18n/getDictionary";
import { createClient } from "@/lib/supabase/server";
import { Card, CardBody } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { SignOutButton } from "./_components/SignOutButton";

export default async function ProfilePage() {
  const t = await getDictionary("en");
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const displayName = profile?.full_name ?? user.email ?? "Member";
  const isAdmin = profile?.role === "admin";

  return (
    <main className="max-w-xl mx-auto px-4 py-6">
      <PageHeader title={t.nav.profile} />

      <Card>
        <CardBody className="space-y-6">
          {/* Avatar initials */}
          <div className="flex items-center gap-4">
            <div
              aria-hidden="true"
              className="w-16 h-16 rounded-full bg-[var(--primary-tint)] flex items-center justify-center text-2xl font-bold text-[var(--primary)] select-none"
            >
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-lg font-semibold text-[var(--ink)]">{displayName}</p>
              <p className="text-sm text-[var(--muted)]">{user.email}</p>
            </div>
          </div>

          {/* Role badge */}
          {isAdmin && (
            <div>
              <span className="inline-block px-3 py-1 text-xs font-semibold rounded-[var(--r-pill)] bg-[var(--primary-tint)] text-[var(--primary)]">
                {t.nav.admin}
              </span>
            </div>
          )}

          {/* Divider */}
          <hr className="border-[var(--border)]" />

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <SignOutButton label={t.nav.signOut} />
          </div>
        </CardBody>
      </Card>
    </main>
  );
}
