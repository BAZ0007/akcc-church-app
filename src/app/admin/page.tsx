import Link from "next/link";
import { getDictionary } from "@/i18n/getDictionary";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";

interface GivingSummary {
  allTimeCents: number;
  thisMonthCents: number;
  byFund: Record<string, number>;
  totalGifts: number;
}

async function fetchGivingSummary(): Promise<GivingSummary | null> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  try {
    const res = await fetch(`${baseUrl}/api/admin/giving/summary`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function formatAUD(cents: number): string {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

export default async function AdminDashboardPage() {
  const t = await getDictionary("en");
  const summary = await fetchGivingSummary();

  const fundLabels: Record<string, string> = {
    general: t.give.general,
    building: t.give.building,
    missions: t.give.missions,
  };

  const quickLinks = [
    { href: "/admin/sermons/new", label: t.admin.postSermon },
    { href: "/admin/events/new", label: t.admin.createEvent },
    { href: "/admin/announcements/new", label: t.admin.sendAnnouncement },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-8">
      <PageHeader title={t.admin.dashboard} />

      {/* Giving summary */}
      <section aria-labelledby="giving-heading">
        <h2 id="giving-heading" className="text-lg font-bold text-[var(--ink)] mb-3">
          {t.admin.givingSummary}
        </h2>

        {summary ? (
          <div className="space-y-4">
            {/* Top stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardBody>
                  <p className="text-xs text-[var(--muted)] uppercase tracking-wide">{t.admin.allTime}</p>
                  <p className="text-2xl font-bold text-[var(--ink)] mt-1">{formatAUD(summary.allTimeCents)}</p>
                  <p className="text-xs text-[var(--muted)] mt-0.5">{summary.totalGifts} gifts</p>
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <p className="text-xs text-[var(--muted)] uppercase tracking-wide">{t.admin.thisMonth}</p>
                  <p className="text-2xl font-bold text-[var(--ink)] mt-1">{formatAUD(summary.thisMonthCents)}</p>
                </CardBody>
              </Card>
            </div>

            {/* By fund */}
            <Card>
              <CardBody>
                <p className="text-sm font-semibold text-[var(--ink)] mb-3">{t.admin.fund} breakdown</p>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[var(--muted)]">
                      <th className="pb-2 font-medium">{t.admin.fund}</th>
                      <th className="pb-2 font-medium text-right">{t.admin.amount}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {["general", "building", "missions"].map((fund) => (
                      <tr key={fund}>
                        <td className="py-2 text-[var(--body)]">{fundLabels[fund] ?? fund}</td>
                        <td className="py-2 text-right font-medium text-[var(--ink)]">
                          {formatAUD(summary.byFund[fund] ?? 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardBody>
            </Card>
          </div>
        ) : (
          <Card>
            <CardBody>
              <p className="text-[var(--muted)] text-sm">{t.common.error}</p>
            </CardBody>
          </Card>
        )}
      </section>

      {/* Quick links */}
      <section aria-labelledby="quick-heading">
        <h2 id="quick-heading" className="text-lg font-bold text-[var(--ink)] mb-3">
          Quick actions
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {quickLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center justify-center gap-2 min-h-[52px] px-4 py-3 rounded-[var(--r-lg)] bg-[var(--primary)] text-white text-sm font-semibold hover:bg-[var(--primary-deep)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
            >
              {label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
