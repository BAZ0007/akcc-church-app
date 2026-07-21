import Link from "next/link";
import { Card, CardBody } from "@/components/ui/Card";

interface LegalSection {
  heading: string;
  body: string[];
}

interface LegalDocProps {
  lastUpdated: string;
  intro: string;
  sections: LegalSection[];
  templateNotice: string;
  backLabel: string;
}

/**
 * Shared layout for legal/policy documents (Privacy, Safeguarding, Terms).
 * Renders an intro, a series of headed sections, a template disclaimer,
 * and a back link. All text is passed in from the i18n dictionary.
 */
export function LegalDoc({
  lastUpdated,
  intro,
  sections,
  templateNotice,
  backLabel,
}: LegalDocProps) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-[var(--muted)]">{lastUpdated}</p>

      <p className="text-base text-[var(--body)] leading-relaxed">{intro}</p>

      {sections.map((section) => (
        <section key={section.heading} aria-labelledby={slugify(section.heading)}>
          <h2
            id={slugify(section.heading)}
            className="text-lg font-bold text-[var(--ink)] mb-2"
          >
            {section.heading}
          </h2>
          <div className="space-y-2">
            {section.body.map((para, i) => (
              <p
                key={i}
                className="text-sm text-[var(--body)] leading-relaxed"
              >
                {para}
              </p>
            ))}
          </div>
        </section>
      ))}

      <Card>
        <CardBody>
          <p className="text-xs text-[var(--muted)] leading-relaxed">
            {templateNotice}
          </p>
        </CardBody>
      </Card>

      <Link
        href="/about"
        className="inline-block text-sm font-medium text-[var(--primary)] hover:text-[var(--primary-deep)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] rounded"
      >
        &larr; {backLabel}
      </Link>
    </div>
  );
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
