import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

/**
 * Content Security Policy.
 * Allowed third parties: YouTube (sermon embeds + thumbnails), Facebook
 * (embeds), Supabase (data/auth/storage/realtime), and Stripe (giving).
 *
 * Notes:
 * - 'unsafe-inline' is required for Next.js's inline bootstrap scripts and
 *   Tailwind's injected styles. A nonce-based policy would be stricter but
 *   needs middleware; this still restricts sources and blocks framing/objects.
 * - 'unsafe-eval' is only added in development for React Fast Refresh (HMR).
 */
const csp = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://js.stripe.com`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' data: blob: https://*.supabase.co https://img.youtube.com https://i.ytimg.com`,
  `font-src 'self' data:`,
  `frame-src https://www.youtube.com https://www.youtube-nocookie.com https://www.facebook.com https://web.facebook.com https://js.stripe.com https://hooks.stripe.com`,
  `connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com`,
  `form-action 'self' https://checkout.stripe.com`,
  `manifest-src 'self'`,
  `worker-src 'self'`,
  `base-uri 'self'`,
  `frame-ancestors 'none'`,
  `object-src 'none'`,
].join("; ");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "img.youtube.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
