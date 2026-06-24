import Link from "next/link";
import { getDictionary } from "@/i18n/getDictionary";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";

interface EventRecord {
  id: string;
  title: string;
  location: string | null;
  starts_at: string;
  ends_at: string | null;
}

async function fetchEvents(): Promise<EventRecord[]> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  try {
    const res = await fetch(`${baseUrl}/api/events?limit=20`, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

function formatEventDate(startsAt: string): string {
  const d = new Date(startsAt);
  const date = d.toLocaleDateString("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const time = d.toLocaleTimeString("en-AU", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${date} · ${time.toUpperCase()}`;
}

export default async function EventsPage() {
  const t = await getDictionary("en");
  const events = await fetchEvents();

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title={t.events.title} subtitle={t.events.subtitle} />

      <div className="px-4 pb-8 space-y-3">
        {events.length === 0 ? (
          <Card>
            <CardBody>
              <p className="text-[var(--muted)] text-sm">{t.events.noEvents}</p>
            </CardBody>
          </Card>
        ) : (
          <ul className="space-y-3 list-none p-0 m-0">
            {events.map((event) => (
              <li key={event.id}>
                <Link
                  href={`/events/${event.id}`}
                  className="group block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] rounded-[var(--r-lg)]"
                >
                  <Card className="transition-shadow group-hover:shadow-md">
                    <CardBody className="space-y-1">
                      <h2 className="text-base font-semibold text-[var(--ink)] group-hover:text-[var(--primary)] transition-colors">
                        {event.title}
                      </h2>
                      <p className="text-sm text-[var(--body)]">
                        {formatEventDate(event.starts_at)}
                      </p>
                      {event.location && (
                        <p className="text-sm text-[var(--muted)] flex items-center gap-1.5">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                          </svg>
                          {event.location}
                        </p>
                      )}
                    </CardBody>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
