import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDictionary } from "@/i18n/getDictionary";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { StatementForm } from "./_components/StatementForm";

export default async function GivingStatementsPage() {
  const t = await getDictionary("en");
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/");

  const { data: members } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .order("full_name", { ascending: true });

  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear - 2, currentYear - 3].filter(
    (y) => y >= 2024
  );
  if (!years.length) years.push(currentYear - 1);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <PageHeader
        title={t.admin.givingStatements}
        subtitle={t.admin.givingStatementsSubtitle}
      />

      <Card>
        <CardBody>
          <StatementForm
            members={members ?? []}
            years={years}
            labels={{
              selectMember: t.admin.selectMember,
              statementYear: t.admin.statementYear,
              sendStatement: t.admin.sendStatement,
              confirmPrompt: t.admin.confirmStatement,
              confirm: t.common.confirm ?? "Confirm",
              cancel: t.admin.cancel,
              successMsg: t.admin.statementSent,
              errorMsg: t.common.error,
            }}
          />
        </CardBody>
      </Card>
    </div>
  );
}
