import Image from "next/image";
import Link from "next/link";
import { getDictionary } from "@/i18n/getDictionary";
import { Card, CardBody } from "@/components/ui/Card";

interface SermonRecord {
  id: string;
  title: string;
  speaker: string;
  youtube_id: string | null;
  sermon_date: string;
}

interface EventRecord {
  id: string;
  title: string;
  location: string | null;
  starts_at: string;
}

interface AnnouncementRecord {
  id: string;
  title: string;
  body: string;
  pinned: boolean;
}

async function fetchHomeData() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const [sermonsRes, eventsRes, announcementsRes] = await Promise.all([
    fetch(`${baseUrl}/api/sermons?limit=1`, { cache: "no-store" }).catch(() => null),
    fetch(`${baseUrl}/api/events?limit=3`, { cache: "no-store" }).catch(() => null),
    fetch(`${baseUrl}/api/announcements?limit=3`, { cache: "no-store" }).catch(() => null),
  ]);

  const sermons: SermonRecord[] = sermonsRes?.ok
    ? ((await sermonsRes.json()).data ?? [])
    : [];
  const events: EventRecord[] = eventsRes?.ok
    ? ((await eventsRes.json()).data ?? [])
    : [];
  const announcements: AnnouncementRecord[] = announcementsRes?.ok
    ? ((await announcementsRes.json()).data ?? [])
    : [];

  return { sermon: sermons[0] ?? null, events, announcements };
}

function formatShortDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatEventDate(startsAt: string) {
  const d = new Date(startsAt);
  return (
    d.toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" }) +
    " · " +
    d.toLocaleTimeString("en-AU", { hour: "numeric", minute: "2-digit", hour12: true }).toUpperCase()
  );
}

function truncate(str: string, max: number) {
  return str.length > max ? str.slice(0, max).trimEnd() + "…" : str;
}

export default async function HomePage() {
  const t = await getDictionary("en");
  const { sermon, events, announcements } = await fetchHomeData();

  return (
    <main className="max-w-2xl mx-auto px-4 py-6 space-y-10">
      {/* Hero */}
      <section aria-labelledby="hero-heading" className="text-center py-4">
        <h1 id="hero-heading" className="text-3xl md:text-4xl font-bold text-[var(--ink)]">
          {t.home.heroTitle}
        </h1>
        <p className="mt-2 text-lg text-[var(--muted)]">{t.home.heroSubtitle}</p>
      </section>

      {/* Latest Sermon */}
      <section aria-labelledby="sermon-heading">
        <div className="flex items-center justify-between mb-3">
          <h2 id="sermon-heading" className="text-xl font-bold text-[var(--ink)]">
            {t.home.latestSermon}
          </h2>
          <Link
            href="/sermons"
            className="text-sm font-medium text-[var(--primary)] hover:text-[var(--primary-deep)]"
          >
            {t.home.viewAll}
          </Link>
        </div>

        {sermon ? (
          <Link
            href={`/sermons/${sermon.id}`}
            className="group block rounded-[var(--r-lg)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
          >
            <Card className="overflow-hidden transition-shadow group-hover:shadow-md">
              {sermon.youtube_id ? (
                <div className="relative w-full aspect-video">
                  <Image
                    src={`https://img.youtube.com/vi/${sermon.youtube_id}/mqdefault.jpg`}
                    alt={sermon.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 672px) 100vw, 672px"
                  />
                  {/* Play overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                    <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="var(--primary)" aria-hidden="true">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    </div>
                  </div>
                </div>
              ) : null}
              <CardBody className="space-y-1">
                <p className="text-lg font-semibold text-[var(--ink)] group-hover:text-[var(--primary)] transition-colors">
                  {sermon.title}
                </p>
                <p className="text-sm text-[var(--muted)]">
                  {sermon.speaker} · {formatShortDate(sermon.sermon_date)}
                </p>
              </CardBody>
            </Card>
          </Link>
        ) : (
          <Card>
            <CardBody>
              <p className="text-[var(--muted)] text-sm">{t.sermons.noSermons}</p>
            </CardBody>
          </Card>
        )}
      </section>

      {/* Upcoming Events */}
      <section aria-labelledby="events-heading">
        <div className="flex items-center justify-between mb-3">
          <h2 id="events-heading" className="text-xl font-bold text-[var(--ink)]">
            {t.home.upcomingEvents}
          </h2>
          <Link
            href="/events"
            className="text-sm font-medium text-[var(--primary)] hover:text-[var(--primary-deep)]"
          >
            {t.home.viewAll}
          </Link>
        </div>

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
                  className="group block rounded-[var(--r-lg)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
                >
                  <Card className="transition-shadow group-hover:shadow-md">
                    <CardBody className="space-y-1">
                      <p className="font-semibold text-[var(--ink)] group-hover:text-[var(--primary)] transition-colors">
                        {event.title}
                      </p>
                      <p className="text-sm text-[var(--body)]">{formatEventDate(event.starts_at)}</p>
                      {event.location && (
                        <p className="text-xs text-[var(--muted)]">{event.location}</p>
                      )}
                    </CardBody>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Announcements */}
      <section aria-labelledby="announce-heading">
        <h2 id="announce-heading" className="text-xl font-bold text-[var(--ink)] mb-3">
          {t.home.announcements}
        </h2>

        {announcements.length === 0 ? (
          <Card>
            <CardBody>
              <p className="text-[var(--muted)] text-sm">{t.home.noAnnouncements}</p>
            </CardBody>
          </Card>
        ) : (
          <ul className="space-y-3 list-none p-0 m-0">
            {announcements.map((a) => (
              <li key={a.id}>
                <Card>
                  <CardBody className="space-y-1">
                    <div className="flex items-start gap-2">
                      {a.pinned && (
                        <span className="mt-0.5 inline-block text-xs font-semibold text-[var(--accent-deep)] bg-amber-100 rounded-[var(--r-pill)] px-2 py-0.5 shrink-0">
                          Pinned
                        </span>
                      )}
                      <p className="font-semibold text-[var(--ink)]">{a.title}</p>
                    </div>
                    <p className="text-sm text-[var(--body)]">{truncate(a.body, 150)}</p>
                  </CardBody>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
