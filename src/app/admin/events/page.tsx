import Link from "next/link";
import { getDictionary } from "@/i18n/getDictionary";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface EventRecord {
  id: string;
  title: string;
  location: string | null;
  starts_at: string;
  published: boolean;
}

async function fetchAllEvents(): Promise<EventRecord[]> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  try {
    const res = await fetch(`${baseUrl}/api/events?limit=50&all=true`, { cache: "no-store" });
    if (!res.ok) return [];
    return (await res.json()).data ?? [];
  } catch {
    return [];
  }
}

function formatDate(s: string) {
  return new Date(s).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default async function AdminEventsPage() {
  const t = await getDictionary("en");
  const events = await fetchAllEvents();

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <PageHeader title={t.nav.events}>
        <div className="mt-3">
          <Link href="/admin/events/new">
            <Button size="sm">{t.admin.createEvent}</Button>
          </Link>
        </div>
      </PageHeader>

      <Card>
        {events.length === 0 ? (
          <CardBody>
            <p className="text-[var(--muted)] text-sm">{t.events.noEvents}</p>
          </CardBody>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[var(--muted)] border-b border-[var(--border)]">
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium hidden sm:table-cell">{t.events.when}</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">{t.events.location}</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {events.map((event) => (
                  <tr key={event.id} className="hover:bg-[var(--surface)]">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[var(--ink)] line-clamp-1">{event.title}</p>
                    </td>
                    <td className="px-4 py-3 text-[var(--muted)] hidden sm:table-cell">
                      {formatDate(event.starts_at)}
                    </td>
                    <td className="px-4 py-3 text-[var(--body)] hidden md:table-cell">
                      {event.location ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={[
                          "inline-block text-xs font-semibold rounded-[var(--r-pill)] px-2 py-0.5",
                          event.published
                            ? "bg-green-100 text-green-700"
                            : "bg-[var(--surface)] text-[var(--muted)]",
                        ].join(" ")}
                      >
                        {event.published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/events/${event.id}`}
                        className="text-xs font-medium text-[var(--primary)] hover:text-[var(--primary-deep)] underline-offset-1 hover:underline"
                      >
                        View
                      </Link>
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
