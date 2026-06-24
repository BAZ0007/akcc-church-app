import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppBar } from "@/components/layout/AppBar";
import { BottomNav } from "@/components/layout/BottomNav";
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
      <body className="min-h-screen bg-[var(--bg)]">
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
        <div id="main-content" className="pb-16 md:pb-0">
          {children}
        </div>
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
