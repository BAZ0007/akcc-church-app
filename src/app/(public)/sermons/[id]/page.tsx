import Link from "next/link";
import { getDictionary } from "@/i18n/getDictionary";
import { Card, CardBody } from "@/components/ui/Card";

interface SermonDetail {
  id: string;
  title: string;
  speaker: string;
  youtube_id: string | null;
  youtube_url: string;
  series: string | null;
  sermon_date: string;
  description: string | null;
}

async function fetchSermon(id: string): Promise<SermonDetail | null> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  try {
    const res = await fetch(`${baseUrl}/api/sermons/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function SermonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getDictionary("en");
  const sermon = await fetchSermon(id);

  if (!sermon) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-12 text-center">
        <p className="text-lg text-[var(--muted)]">{t.common.notFound}</p>
        <Link
          href="/sermons"
          className="mt-4 inline-block text-sm font-medium text-[var(--primary)] hover:text-[var(--primary-deep)] underline-offset-2 hover:underline"
        >
          {t.sermons.allSermons}
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb">
        <Link
          href="/sermons"
          className="text-sm text-[var(--primary)] hover:text-[var(--primary-deep)] underline-offset-2 hover:underline"
        >
          ← {t.sermons.allSermons}
        </Link>
      </nav>

      {/* Video embed */}
      {sermon.youtube_id && (
        <div className="aspect-video w-full rounded-[var(--r-lg)] overflow-hidden bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${sermon.youtube_id}?rel=0`}
            title={sermon.title}
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full border-0"
          />
        </div>
      )}

      {/* Details */}
      <Card>
        <CardBody className="space-y-3">
          {sermon.series && (
            <span className="inline-block text-xs font-semibold text-[var(--primary)] bg-[var(--primary-tint)] rounded-[var(--r-pill)] px-2 py-0.5">
              {sermon.series}
            </span>
          )}
          <h1 className="text-2xl font-bold text-[var(--ink)]">{sermon.title}</h1>
          <dl className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-[var(--body)]">
            <div>
              <dt className="sr-only">{t.sermons.speaker}</dt>
              <dd className="font-medium text-[var(--ink)]">{sermon.speaker}</dd>
            </div>
            <div>
              <dt className="sr-only">{t.sermons.date}</dt>
              <dd className="text-[var(--muted)]">{formatDate(sermon.sermon_date)}</dd>
            </div>
          </dl>
          {sermon.description && (
            <p className="text-base text-[var(--body)] leading-relaxed pt-1">
              {sermon.description}
            </p>
          )}
          {sermon.youtube_id && (
            <a
              href={sermon.youtube_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--primary)] hover:text-[var(--primary-deep)] underline-offset-2 hover:underline mt-1"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.3 6.3 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.27 8.27 0 0 0 4.84 1.55V6.8a4.85 4.85 0 0 1-1.07-.11z"/>
              </svg>
              {t.sermons.watchOnYoutube}
            </a>
          )}
        </CardBody>
      </Card>
    </main>
  );
}
