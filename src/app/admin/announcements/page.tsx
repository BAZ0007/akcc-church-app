import Link from "next/link";
import { getDictionary } from "@/i18n/getDictionary";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface AnnouncementRecord {
  id: string;
  title: string;
  body: string;
  pinned: boolean;
  published: boolean;
  expires_at: string | null;
  created_at: string;
}

async function fetchAllAnnouncements(): Promise<AnnouncementRecord[]> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  try {
    const res = await fetch(`${baseUrl}/api/announcements?limit=20`, { cache: "no-store" });
    if (!res.ok) return [];
    return (await res.json()).data ?? [];
  } catch {
    return [];
  }
}

function formatDate(s: string) {
  return new Date(s).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
}

function truncate(s: string, max: number) {
  return s.length > max ? s.slice(0, max).trimEnd() + "…" : s;
}

export default async function AdminAnnouncementsPage() {
  const t = await getDictionary("en");
  const announcements = await fetchAllAnnouncements();

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <PageHeader title={t.admin.sendAnnouncement}>
        <div className="mt-3">
          <Link href="/admin/announcements/new">
            <Button size="sm">{t.admin.sendAnnouncement}</Button>
          </Link>
        </div>
      </PageHeader>

      <Card>
        {announcements.length === 0 ? (
          <CardBody>
            <p className="text-[var(--muted)] text-sm">{t.home.noAnnouncements}</p>
          </CardBody>
        ) : (
          <ul className="divide-y divide-[var(--border)] list-none p-0 m-0">
            {announcements.map((a) => (
              <li key={a.id} className="px-4 py-4 space-y-1">
                <div className="flex items-start gap-2 flex-wrap">
                  <p className="font-semibold text-[var(--ink)] flex-1">{a.title}</p>
                  {a.pinned && (
                    <span className="text-xs font-semibold text-[var(--accent-deep)] bg-amber-100 rounded-[var(--r-pill)] px-2 py-0.5">
                      Pinned
                    </span>
                  )}
                  <span
                    className={[
                      "text-xs font-semibold rounded-[var(--r-pill)] px-2 py-0.5",
                      a.published
                        ? "bg-green-100 text-green-700"
                        : "bg-[var(--surface)] text-[var(--muted)]",
                    ].join(" ")}
                  >
                    {a.published ? "Published" : "Draft"}
                  </span>
                </div>
                <p className="text-sm text-[var(--body)]">{truncate(a.body, 120)}</p>
                <div className="flex items-center gap-3 text-xs text-[var(--muted)]">
                  <span>{formatDate(a.created_at)}</span>
                  {a.expires_at && <span>Expires {formatDate(a.expires_at)}</span>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
