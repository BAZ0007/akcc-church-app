import type { Metadata } from "next";
import Link from "next/link";
import { getDictionary } from "@/i18n/getDictionary";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";

export const metadata: Metadata = { title: "Help & FAQ" };

export default async function HelpPage() {
  const t = await getDictionary("en");

  return (
    <div className="max-w-2xl mx-auto pb-10">
      <PageHeader title={t.help.title} subtitle={t.help.subtitle} />

      <div className="px-4 space-y-6">
        <ul className="space-y-3 list-none p-0 m-0">
          {t.help.faqs.map((faq, i) => (
            <li key={i}>
              <Card>
                <CardBody>
                  <details className="group">
                    <summary className="flex items-center justify-between gap-3 cursor-pointer list-none font-semibold text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] rounded">
                      <span>{faq.q}</span>
                      <span
                        aria-hidden="true"
                        className="shrink-0 text-[var(--primary)] transition-transform group-open:rotate-45 text-xl leading-none"
                      >
                        +
                      </span>
                    </summary>
                    <p className="mt-2 text-sm text-[var(--body)] leading-relaxed">
                      {faq.a}
                    </p>
                  </details>
                </CardBody>
              </Card>
            </li>
          ))}
        </ul>

        <Card>
          <CardBody className="text-center space-y-2">
            <p className="font-semibold text-[var(--ink)]">{t.help.stillNeedHelp}</p>
            <p className="text-sm text-[var(--body)]">{t.help.contactSupport}</p>
            <Link
              href="/about"
              className="inline-block mt-1 text-sm font-medium text-[var(--primary)] hover:text-[var(--primary-deep)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] rounded"
            >
              {t.help.contactButton} &rarr;
            </Link>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
