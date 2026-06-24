import Link from "next/link";
import { getDictionary } from "@/i18n/getDictionary";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface SermonRecord {
  id: string;
  title: string;
  speaker: string;
  sermon_date: string;
  published: boolean;
  series: string | null;
}

async function fetchAllSermons(): Promise<SermonRecord[]> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  try {
    const res = await fetch(`${baseUrl}/api/sermons?limit=50`, { cache: "no-store" });
    if (!res.ok) return [];
    return (await res.json()).data ?? [];
  } catch {
    return [];
  }
}

function formatDate(s: string) {
  return new Date(s).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
}

export default async function AdminSermonsPage() {
  const t = await getDictionary("en");
  const sermons = await fetchAllSermons();

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <PageHeader title={t.nav.sermons}>
        <div className="mt-3">
          <Link href="/admin/sermons/new">
            <Button size="sm">{t.admin.postSermon}</Button>
          </Link>
        </div>
      </PageHeader>

      <Card>
        {sermons.length === 0 ? (
          <CardBody>
            <p className="text-[var(--muted)] text-sm">{t.sermons.noSermons}</p>
          </CardBody>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[var(--muted)] border-b border-[var(--border)]">
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium hidden sm:table-cell">{t.sermons.speaker}</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">{t.sermons.date}</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {sermons.map((sermon) => (
                  <tr key={sermon.id} className="hover:bg-[var(--surface)]">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[var(--ink)] line-clamp-1">{sermon.title}</p>
                      {sermon.series && (
                        <p className="text-xs text-[var(--muted)]">{sermon.series}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[var(--body)] hidden sm:table-cell">{sermon.speaker}</td>
                    <td className="px-4 py-3 text-[var(--muted)] hidden md:table-cell">
                      {formatDate(sermon.sermon_date)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={[
                          "inline-block text-xs font-semibold rounded-[var(--r-pill)] px-2 py-0.5",
                          sermon.published
                            ? "bg-green-100 text-green-700"
                            : "bg-[var(--surface)] text-[var(--muted)]",
                        ].join(" ")}
                      >
                        {sermon.published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/sermons/${sermon.id}`}
                          className="text-xs font-medium text-[var(--primary)] hover:text-[var(--primary-deep)] underline-offset-1 hover:underline"
                        >
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
