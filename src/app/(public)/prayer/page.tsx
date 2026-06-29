import { getDictionary } from "@/i18n/getDictionary";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/server";
import { PrayerForm } from "./_components/PrayerForm";

type PrayerRequest = {
  id: string;
  name: string | null;
  request: string;
  created_at: string;
};

async function fetchPublicWall(): Promise<PrayerRequest[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("prayer_requests")
    .select("id, name, request, created_at")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(20);
  return (data ?? []) as PrayerRequest[];
}

export default async function PrayerPage() {
  const t = await getDictionary("en");
  const wall = await fetchPublicWall();

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-8">
      <PageHeader title={t.prayer.title} subtitle={t.prayer.subtitle} />

      {/* Submit form */}
      <section aria-labelledby="submit-heading">
        <h2
          id="submit-heading"
          className="text-lg font-bold text-[var(--ink)] mb-3"
        >
          {t.prayer.submitRequest}
        </h2>
        <Card>
          <CardBody>
            <PrayerForm
              labels={{
                submitRequest: t.prayer.submitRequest,
                yourRequest: t.prayer.yourRequest,
                requestPlaceholder: t.prayer.requestPlaceholder,
                nameOptional: t.prayer.nameOptional,
                sharePublicly: t.prayer.sharePublicly,
                sharePrivately: t.prayer.sharePrivately,
                submit: t.prayer.submit,
                thankYou: t.prayer.thankYou,
                error: t.common.error,
              }}
            />
          </CardBody>
        </Card>
      </section>

      {/* Prayer wall */}
      <section aria-labelledby="wall-heading">
        <h2
          id="wall-heading"
          className="text-lg font-bold text-[var(--ink)] mb-3"
        >
          {t.prayer.prayerWall}
        </h2>

        {wall.length === 0 ? (
          <Card>
            <CardBody>
              <p className="text-[var(--muted)] text-sm">{t.prayer.noPrayers}</p>
            </CardBody>
          </Card>
        ) : (
          <ul className="space-y-3 list-none p-0 m-0">
            {wall.map((p) => (
              <li key={p.id}>
                <Card>
                  <CardBody>
                    <p className="text-sm text-[var(--body)] leading-relaxed whitespace-pre-wrap">
                      {p.request}
                    </p>
                    <p className="mt-2 text-xs text-[var(--muted)]">
                      {p.name ?? "Anonymous"} ·{" "}
                      {new Date(p.created_at).toLocaleDateString("en-AU", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </CardBody>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
