import Link from "next/link";
import { getDictionary } from "@/i18n/getDictionary";
import { createClient } from "@/lib/supabase/server";
import { Card, CardBody } from "@/components/ui/Card";
import { RsvpForm } from "./_components/RsvpForm";

interface EventDetail {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  starts_at: string;
  ends_at: string | null;
  capacity: number | null;
  total_attending: number;
  my_rsvp: {
    id: string;
    status: "attending" | "maybe" | "not_attending";
    guest_count: number;
    note: string | null;
  } | null;
}

async function fetchEvent(id: string): Promise<EventDetail | null> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  try {
    const res = await fetch(`${baseUrl}/api/events/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function formatEventDate(startsAt: string, endsAt?: string | null): string {
  const d = new Date(startsAt);
  const date = d.toLocaleDateString("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const startTime = d.toLocaleTimeString("en-AU", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).toUpperCase();

  if (endsAt) {
    const endTime = new Date(endsAt).toLocaleTimeString("en-AU", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).toUpperCase();
    return `${date} · ${startTime} – ${endTime}`;
  }
  return `${date} · ${startTime}`;
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getDictionary("en");
  const event = await fetchEvent(id);

  // Get auth state server-side for RSVP initial props
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!event) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-12 text-center">
        <p className="text-lg text-[var(--muted)]">{t.common.notFound}</p>
        <Link
          href="/events"
          className="mt-4 inline-block text-sm font-medium text-[var(--primary)] hover:text-[var(--primary-deep)] underline-offset-2 hover:underline"
        >
          ← {t.events.title}
        </Link>
      </main>
    );
  }

  const rsvpT = {
    rsvp: t.events.rsvp,
    rsvpConfirmed: t.events.rsvpConfirmed,
    cancelRsvp: t.events.cancelRsvp,
    signInToRsvp: `${t.nav.signIn} to RSVP`,
    attending: "Attending",
    maybe: "Maybe",
    notAttending: "Not attending",
    guests: "Number of guests",
    note: "Note (optional)",
    submit: t.events.rsvp,
    updateRsvp: "Update RSVP",
    error: t.common.error,
    loading: t.common.loading,
    currentStatus: "Your RSVP",
  };

  return (
    <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb">
        <Link
          href="/events"
          className="text-sm text-[var(--primary)] hover:text-[var(--primary-deep)] underline-offset-2 hover:underline"
        >
          ← {t.events.title}
        </Link>
      </nav>

      {/* Event details */}
      <Card>
        <CardBody className="space-y-4">
          <h1 className="text-2xl font-bold text-[var(--ink)]">{event.title}</h1>

          <dl className="space-y-2 text-sm">
            <div className="flex gap-2">
              <dt className="text-[var(--muted)] min-w-[5rem] shrink-0">{t.events.when}</dt>
              <dd className="text-[var(--body)] font-medium">
                {formatEventDate(event.starts_at, event.ends_at)}
              </dd>
            </div>
            {event.location && (
              <div className="flex gap-2">
                <dt className="text-[var(--muted)] min-w-[5rem] shrink-0">{t.events.location}</dt>
                <dd className="text-[var(--body)]">{event.location}</dd>
              </div>
            )}
            {event.capacity != null && (
              <div className="flex gap-2">
                <dt className="text-[var(--muted)] min-w-[5rem] shrink-0">Capacity</dt>
                <dd className="text-[var(--body)]">
                  {event.total_attending} / {event.capacity} attending
                </dd>
              </div>
            )}
          </dl>

          {event.description && (
            <>
              <hr className="border-[var(--border)]" />
              <p className="text-base text-[var(--body)] leading-relaxed">{event.description}</p>
            </>
          )}
        </CardBody>
      </Card>

      {/* RSVP section */}
      <section aria-labelledby="rsvp-heading">
        <h2 id="rsvp-heading" className="text-lg font-bold text-[var(--ink)] mb-3">
          {t.events.rsvp}
        </h2>
        <Card>
          <CardBody>
            <RsvpForm
              eventId={id}
              isLoggedIn={!!user}
              existingRsvp={event.my_rsvp}
              t={rsvpT}
            />
          </CardBody>
        </Card>
      </section>
    </main>
  );
}
