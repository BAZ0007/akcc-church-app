import type { Metadata } from "next";
import { getDictionary } from "@/i18n/getDictionary";
import { PageHeader } from "@/components/ui/PageHeader";
import { LegalDoc } from "@/components/ui/LegalDoc";

export const metadata: Metadata = { title: "Terms of Use" };

export default async function TermsPage() {
  const t = await getDictionary("en");

  return (
    <div className="max-w-2xl mx-auto pb-10">
      <PageHeader title={t.terms.title} subtitle={t.terms.subtitle} />
      <div className="px-4">
        <LegalDoc
          lastUpdated={t.terms.lastUpdated}
          intro={t.terms.intro}
          sections={t.terms.sections}
          templateNotice={t.legal.templateNotice}
          backLabel={t.legal.backToAbout}
        />
      </div>
    </div>
  );
}
