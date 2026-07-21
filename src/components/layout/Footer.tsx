import Link from "next/link";
import { getDictionary } from "@/i18n/getDictionary";

/**
 * Site footer, present on every page (below the mobile bottom-nav spacer).
 * Server component — reads the dictionary directly.
 */
export async function Footer() {
  const t = await getDictionary("en");
  const year = new Date().getFullYear();

  const exploreLinks = [
    { href: "/about", label: t.footer.aboutUs },
    { href: "/sermons", label: t.nav.sermons },
    { href: "/events", label: t.nav.events },
    { href: "/give", label: t.nav.give },
    { href: "/prayer", label: t.nav.prayer },
    { href: "/help", label: t.footer.helpFaq },
  ];

  const legalLinks = [
    { href: "/privacy", label: t.footer.privacy },
    { href: "/safeguarding", label: t.footer.safeguarding },
    { href: "/terms", label: t.footer.terms },
  ];

  return (
    <footer
      className="mt-12 border-t border-[var(--border)] bg-[var(--surface)]"
      aria-label="Site footer"
    >
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        <div className="grid gap-8 sm:grid-cols-3">
          {/* Brand */}
          <div className="sm:col-span-1">
            <p className="font-bold text-[var(--ink)]">{t.common.appName}</p>
            <p className="mt-2 text-sm text-[var(--body)] leading-relaxed">
              {t.footer.tagline}
            </p>
          </div>

          {/* Explore */}
          <nav aria-label={t.footer.explore}>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)] mb-3">
              {t.footer.explore}
            </p>
            <ul className="space-y-2 list-none p-0 m-0">
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--body)] hover:text-[var(--primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] rounded"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Legal */}
          <nav aria-label={t.footer.legal}>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)] mb-3">
              {t.footer.legal}
            </p>
            <ul className="space-y-2 list-none p-0 m-0">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--body)] hover:text-[var(--primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] rounded"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="border-t border-[var(--border)] pt-6 space-y-3">
          <p className="text-xs text-[var(--muted)] leading-relaxed">
            {t.footer.acknowledgement}
          </p>
          <p className="text-xs text-[var(--muted)]">
            &copy; {year} {t.common.appFullName}. {t.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}
