"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface AppBarProps {
  labels: {
    appName: string;
    appFullName: string;
    home: string;
    sermons: string;
    events: string;
    prayer: string;
    give: string;
    signIn: string;
    signOut: string;
    profile: string;
    admin: string;
    kachinComingSoon: string;
  };
}

interface AuthState {
  userName: string | null;
  isAdmin: boolean;
  loaded: boolean;
}

function AppBarClient({ labels }: AppBarProps) {
  const router = useRouter();
  const [auth, setAuth] = useState<AuthState>({ userName: null, isAdmin: false, loaded: false });

  useEffect(() => {
    const supabase = createClient();

    async function loadAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setAuth({ userName: null, isAdmin: false, loaded: true });
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", user.id)
        .single();
      setAuth({
        userName: profile?.full_name ?? user.email ?? "Member",
        isAdmin: profile?.role === "admin",
        loaded: true,
      });
    }

    loadAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadAuth();
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setAuth({ userName: null, isAdmin: false, loaded: true });
    router.push("/");
    router.refresh();
  }

  const navLinks = [
    { href: "/", label: labels.home },
    { href: "/sermons", label: labels.sermons },
    { href: "/events", label: labels.events },
    { href: "/prayer", label: labels.prayer },
  ];

  return (
    <header className="hidden md:flex sticky top-0 z-50 h-16 items-center justify-between px-6 bg-[var(--card)] border-b border-[var(--border)] shadow-[var(--shadow)]">
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center gap-2 font-bold text-[var(--ink)] text-lg"
        aria-label={labels.appFullName}
      >
        <span className="text-2xl" aria-hidden="true">✦</span>
        <span>{labels.appName}</span>
      </Link>

      {/* Desktop nav */}
      <nav aria-label="Main navigation">
        <ul className="flex items-center gap-1 list-none m-0 p-0">
          {navLinks.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className="px-4 py-2 rounded-[var(--r-sm)] text-sm font-medium text-[var(--body)] hover:bg-[var(--surface)] hover:text-[var(--ink)] transition-colors"
              >
                {label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/give"
              className="ml-2 px-4 py-2 rounded-[var(--r-pill)] text-sm font-semibold bg-[var(--accent)] text-white hover:bg-[var(--accent-deep)] transition-colors"
            >
              {labels.give}
            </Link>
          </li>
        </ul>
      </nav>

      {/* Auth area */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-[var(--muted)] border border-[var(--border)] rounded-[var(--r-pill)] px-3 py-1">
          {labels.kachinComingSoon}
        </span>

        {!auth.loaded ? (
          // Skeleton to prevent layout shift
          <span className="w-16 h-4 rounded bg-[var(--surface)] animate-pulse" aria-hidden="true" />
        ) : auth.userName ? (
          <div className="flex items-center gap-3">
            {auth.isAdmin && (
              <Link
                href="/admin"
                className="text-xs font-semibold text-[var(--primary)] bg-[var(--primary-tint)] rounded-[var(--r-pill)] px-3 py-1 hover:bg-[var(--sky-2)] transition-colors"
              >
                {labels.admin}
              </Link>
            )}
            <Link
              href="/profile"
              className="text-sm font-medium text-[var(--ink)] hover:text-[var(--primary)] transition-colors"
            >
              {auth.userName.split(" ")[0]}
            </Link>
            <button
              onClick={handleSignOut}
              className="text-sm font-medium text-[var(--muted)] hover:text-[var(--ink)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] rounded-sm"
            >
              {labels.signOut}
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="text-sm font-medium text-[var(--primary)] hover:text-[var(--primary-deep)]"
          >
            {labels.signIn}
          </Link>
        )}
      </div>
    </header>
  );
}

// Server wrapper that passes i18n labels down — keeps the client component clean
// and allows server layout to call getDictionary once.
// Since AppBar is now "use client", we export it directly and let the parent
// (layout.tsx) pass labels in. For layouts that call getDictionary themselves,
// they pass the labels prop. If imported without props we use a default async wrapper.
//
// Because this file is "use client" at the top, we cannot use getDictionary here.
// The root layout must pass labels. We export AppBarClient as AppBar.
export { AppBarClient as AppBar };
export type { AppBarProps };
