import type { Metadata } from "next";
import { getDictionary } from "@/i18n/getDictionary";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";

export const metadata: Metadata = { title: "About Us" };

export default async function AboutPage() {
  const t = await getDictionary("en");

  const directionsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    t.about.address,
  )}`;

  return (
    <div className="max-w-2xl mx-auto pb-10">
      <PageHeader title={t.about.title} subtitle={t.about.subtitle} />

      <div className="px-4 space-y-8">
        {/* Welcome */}
        <p className="text-base text-[var(--body)] leading-relaxed">
          {t.about.welcome}
        </p>

        {/* Our story */}
        <section aria-labelledby="story-heading">
          <h2 id="story-heading" className="text-lg font-bold text-[var(--ink)] mb-2">
            {t.about.ourStory}
          </h2>
          <p className="text-sm text-[var(--body)] leading-relaxed">
            {t.about.ourStoryBody}
          </p>
        </section>

        {/* Beliefs */}
        <section aria-labelledby="beliefs-heading">
          <h2 id="beliefs-heading" className="text-lg font-bold text-[var(--ink)] mb-2">
            {t.about.whatWeBelieve}
          </h2>
          <p className="text-sm text-[var(--body)] leading-relaxed mb-2">
            {t.about.beliefsIntro}
          </p>
          <ul className="space-y-1.5 list-none p-0 m-0">
            {t.about.beliefs.map((belief, i) => (
              <li key={i} className="flex gap-2 text-sm text-[var(--body)]">
                <span aria-hidden="true" className="text-[var(--primary)] font-bold">
                  &bull;
                </span>
                <span>{belief}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Service times */}
        <section aria-labelledby="services-heading">
          <h2 id="services-heading" className="text-lg font-bold text-[var(--ink)] mb-2">
            {t.about.serviceTimes}
          </h2>
          <p className="text-sm text-[var(--muted)] mb-3">{t.about.serviceTimesNote}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Card>
              <CardBody>
                <p className="font-semibold text-[var(--ink)]">{t.about.sundayService}</p>
                <p className="text-sm text-[var(--body)] mt-1">
                  {t.about.sundayServiceTime}
                </p>
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <p className="font-semibold text-[var(--ink)]">{t.about.prayerMeeting}</p>
                <p className="text-sm text-[var(--body)] mt-1">
                  {t.about.prayerMeetingTime}
                </p>
              </CardBody>
            </Card>
          </div>
        </section>

        {/* Location */}
        <section aria-labelledby="location-heading">
          <h2 id="location-heading" className="text-lg font-bold text-[var(--ink)] mb-2">
            {t.about.location}
          </h2>
          <Card>
            <CardBody className="space-y-3">
              <p className="text-sm text-[var(--body)]">{t.about.address}</p>
              <a
                href={directionsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-sm font-medium text-[var(--primary)] hover:text-[var(--primary-deep)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] rounded"
              >
                {t.about.getDirections} &rarr;
              </a>
            </CardBody>
          </Card>
        </section>

        {/* Contact */}
        <section aria-labelledby="contact-heading">
          <h2 id="contact-heading" className="text-lg font-bold text-[var(--ink)] mb-2">
            {t.about.contactHeading}
          </h2>
          <p className="text-sm text-[var(--muted)] mb-3">{t.about.contactNote}</p>
          <Card>
            <CardBody className="space-y-2">
              <p className="text-sm text-[var(--body)]">
                <span className="font-semibold text-[var(--ink)]">
                  {t.about.emailLabel}:
                </span>{" "}
                {t.about.email}
              </p>
              <p className="text-sm text-[var(--body)]">
                <span className="font-semibold text-[var(--ink)]">
                  {t.about.phoneLabel}:
                </span>{" "}
                {t.about.phone}
              </p>
            </CardBody>
          </Card>
        </section>

        <p className="text-xs text-[var(--muted)] italic">{t.about.adminNote}</p>
      </div>
    </div>
  );
}
