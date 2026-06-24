import { getDictionary } from "@/i18n/getDictionary";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";

export default async function PrayerPage() {
  const t = await getDictionary("en");
  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title={t.prayer.title} subtitle={t.prayer.subtitle} />
      <div className="px-4 pb-6">
        <Card>
          <CardBody>
            <p className="text-[var(--muted)] text-sm">{t.prayer.noPrayers}</p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
