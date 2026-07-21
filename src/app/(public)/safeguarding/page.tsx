import type { Metadata } from "next";
import { getDictionary } from "@/i18n/getDictionary";
import { PageHeader } from "@/components/ui/PageHeader";
import { LegalDoc } from "@/components/ui/LegalDoc";

export const metadata: Metadata = { title: "Child Safeguarding" };

export default async function SafeguardingPage() {
  const t = await getDictionary("en");

  return (
    <div className="max-w-2xl mx-auto pb-10">
      <PageHeader title={t.safeguarding.title} subtitle={t.safeguarding.subtitle} />
      <div className="px-4">
        <LegalDoc
          lastUpdated={t.safeguarding.lastUpdated}
          intro={t.safeguarding.intro}
          sections={t.safeguarding.sections}
          templateNotice={t.legal.templateNotice}
          backLabel={t.legal.backToAbout}
        />
      </div>
    </div>
  );
}
