import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppBar } from "@/components/layout/AppBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Footer } from "@/components/layout/Footer";
import { getDictionary } from "@/i18n/getDictionary";

export const metadata: Metadata = {
  title: {
    default: "AKCC — Australian Kachin Christian Church",
    template: "%s | AKCC",
  },
  description: "The official app of the Australian Kachin Christian Church.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AKCC",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#2479C2",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getDictionary("en");

  return (
    <html lang="en">
      <body className="min-h-screen bg-[var(--bg)] flex flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-2 focus:left-2 focus:rounded-[var(--r-md)] focus:bg-[var(--primary)] focus:px-4 focus:py-2 focus:text-white focus:font-medium"
        >
          {t.nav.skipToContent}
        </a>
        <AppBar
          labels={{
            appName: t.common.appName,
            appFullName: t.common.appFullName,
            home: t.nav.home,
            sermons: t.nav.sermons,
            events: t.nav.events,
            prayer: t.nav.prayer,
            give: t.nav.give,
            signIn: t.nav.signIn,
            signOut: t.nav.signOut,
            profile: t.nav.profile,
            admin: t.nav.admin,
            kachinComingSoon: t.common.kachinComingSoon,
          }}
        />
        <div id="main-content" tabIndex={-1} className="flex-1 pb-16 md:pb-0 outline-none">
          {children}
        </div>
        <Footer />
        <BottomNav
          labels={{
            home: t.nav.home,
            sermons: t.nav.sermons,
            events: t.nav.events,
            give: t.nav.give,
            prayer: t.nav.prayer,
          }}
        />
      </body>
    </html>
  );
}
