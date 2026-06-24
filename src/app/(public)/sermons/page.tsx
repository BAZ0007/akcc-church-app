import Image from "next/image";
import Link from "next/link";
import { getDictionary } from "@/i18n/getDictionary";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";

interface SermonRecord {
  id: string;
  title: string;
  speaker: string;
  youtube_id: string | null;
  series: string | null;
  sermon_date: string;
  published: boolean;
}

async function fetchSermons(): Promise<SermonRecord[]> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  try {
    const res = await fetch(`${baseUrl}/api/sermons?limit=12`, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function SermonsPage() {
  const t = await getDictionary("en");
  const sermons = await fetchSermons();

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader title={t.sermons.title} subtitle={t.sermons.subtitle} />

      <div className="px-4 pb-8">
        {sermons.length === 0 ? (
          <Card>
            <CardBody>
              <p className="text-[var(--muted)] text-sm">{t.sermons.noSermons}</p>
            </CardBody>
          </Card>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 list-none p-0 m-0">
            {sermons.map((sermon) => {
              const thumbSrc = sermon.youtube_id
                ? `https://img.youtube.com/vi/${sermon.youtube_id}/mqdefault.jpg`
                : null;
              return (
                <li key={sermon.id}>
                  <Link
                    href={`/sermons/${sermon.id}`}
                    className="group block h-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] rounded-[var(--r-lg)]"
                  >
                    <Card className="h-full overflow-hidden transition-shadow group-hover:shadow-md">
                      {/* Thumbnail */}
                      <div className="relative w-full aspect-video bg-[var(--surface)]">
                        {thumbSrc ? (
                          <Image
                            src={thumbSrc}
                            alt={sermon.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-[var(--muted)]">
                            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <polygon points="5 3 19 12 5 21 5 3" />
                            </svg>
                          </div>
                        )}
                      </div>

                      <CardBody className="space-y-1">
                        {sermon.series && (
                          <span className="inline-block text-xs font-semibold text-[var(--primary)] bg-[var(--primary-tint)] rounded-[var(--r-pill)] px-2 py-0.5">
                            {sermon.series}
                          </span>
                        )}
                        <h2 className="text-base font-semibold text-[var(--ink)] line-clamp-2 leading-snug">
                          {sermon.title}
                        </h2>
                        <p className="text-sm text-[var(--muted)]">{sermon.speaker}</p>
                        <p className="text-xs text-[var(--muted)]">{formatDate(sermon.sermon_date)}</p>
                      </CardBody>
                    </Card>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
