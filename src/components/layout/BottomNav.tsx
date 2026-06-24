"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  isGive?: boolean;
}

const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
);
const SermonsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>
);
const EventsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
);
const GiveIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
);
const PrayerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" x2="6" y1="1" y2="4"/><line x1="10" x2="10" y1="1" y2="4"/><line x1="14" x2="14" y1="1" y2="4"/></svg>
);

interface BottomNavProps {
  labels: {
    home: string;
    sermons: string;
    events: string;
    give: string;
    prayer: string;
  };
}

export function BottomNav({ labels }: BottomNavProps) {
  const pathname = usePathname();

  const items: NavItem[] = [
    { href: "/", label: labels.home, icon: <HomeIcon /> },
    { href: "/sermons", label: labels.sermons, icon: <SermonsIcon /> },
    { href: "/events", label: labels.events, icon: <EventsIcon /> },
    { href: "/give", label: labels.give, icon: <GiveIcon />, isGive: true },
    { href: "/prayer", label: labels.prayer, icon: <PrayerIcon /> },
  ];

  return (
    <nav
      aria-label="Bottom navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-[var(--card)] border-t border-[var(--border)] shadow-[0_-1px_3px_rgba(23,58,94,0.06)]"
    >
      <ul className="flex items-stretch list-none m-0 p-0 h-16">
        {items.map(({ href, label, icon, isGive }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-label={label}
                aria-current={isActive ? "page" : undefined}
                className={clsx(
                  "flex flex-col items-center justify-center gap-0.5 h-full w-full text-[10px] font-medium transition-colors",
                  isGive
                    ? isActive
                      ? "text-[var(--accent-deep)]"
                      : "text-[var(--accent)]"
                    : isActive
                    ? "text-[var(--primary)]"
                    : "text-[var(--muted)]"
                )}
              >
                {icon}
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
