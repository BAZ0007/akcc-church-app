import { redirect } from "next/navigation";
import Link from "next/link";
import { getDictionary } from "@/i18n/getDictionary";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getDictionary("en");
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/");
  }

  const navItems = [
    {
      href: "/admin",
      label: t.admin.dashboard,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
          <rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/>
        </svg>
      ),
    },
    {
      href: "/admin/sermons",
      label: t.nav.sermons,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
          <polygon points="5 3 19 12 5 21 5 3"/>
        </svg>
      ),
    },
    {
      href: "/admin/events",
      label: t.nav.events,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
          <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>
        </svg>
      ),
    },
    {
      href: "/admin/announcements",
      label: t.admin.sendAnnouncement,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
          <path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" x2="6" y1="1" y2="4"/><line x1="10" x2="10" y1="1" y2="4"/><line x1="14" x2="14" y1="1" y2="4"/>
        </svg>
      ),
    },
    {
      href: "/admin/giving",
      label: t.admin.givingStatementsNav,
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" aria-hidden="true">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><polyline points="10 9 9 9 8 9"/>
        </svg>
      ),
    },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 bg-[var(--card)] border-r border-[var(--border)] sticky top-0 h-screen">
        <div className="px-4 py-5 border-b border-[var(--border)]">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
            {t.admin.title}
          </p>
        </div>
        <nav aria-label="Admin navigation" className="flex-1 py-3 px-2">
          <ul className="space-y-0.5 list-none p-0 m-0">
            {navItems.map(({ href, label, icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--r-md)] text-sm font-medium text-[var(--body)] hover:bg-[var(--surface)] hover:text-[var(--ink)] transition-colors"
                >
                  {icon}
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="px-4 py-4 border-t border-[var(--border)]">
          <Link
            href="/"
            className="text-xs text-[var(--muted)] hover:text-[var(--primary)]"
          >
            ← {t.nav.home}
          </Link>
        </div>
      </aside>

      {/* Mobile top nav */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 bg-[var(--card)] border-b border-[var(--border)] px-4 h-12 flex items-center gap-2 overflow-x-auto">
        <span className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider shrink-0 mr-2">
          {t.admin.title}:
        </span>
        {navItems.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="shrink-0 text-xs font-medium text-[var(--body)] hover:text-[var(--primary)] px-2 py-1 rounded-[var(--r-sm)] hover:bg-[var(--surface)] transition-colors"
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Main content */}
      <main className="flex-1 min-w-0 pt-12 md:pt-0">
        {children}
      </main>
    </div>
  );
}
