import type { Metadata } from "next";
import { getDictionary } from "@/i18n/getDictionary";
import { PageHeader } from "@/components/ui/PageHeader";
import { LegalDoc } from "@/components/ui/LegalDoc";

export const metadata: Metadata = { title: "Privacy Policy" };

export default async function PrivacyPage() {
  const t = await getDictionary("en");

  return (
    <div className="max-w-2xl mx-auto pb-10">
      <PageHeader title={t.privacy.title} subtitle={t.privacy.subtitle} />
      <div className="px-4">
        <LegalDoc
          lastUpdated={t.privacy.lastUpdated}
          intro={t.privacy.intro}
          sections={t.privacy.sections}
          templateNotice={t.legal.templateNotice}
          backLabel={t.legal.backToAbout}
        />
      </div>
    </div>
  );
}
