# AKCC — Australian Kachin Christian Church Web App

## PROJECT
A bilingual-ready church Progressive Web App (PWA). English first, Kachin (Jinghpaw) added later.
Maintained by ONE non-technical administrator — admin UI must be dead simple.

## STACK
- **Frontend**: Next.js 16 (App Router) + TypeScript + Tailwind v4
- **Backend**: Supabase (Postgres + Auth + Storage + Row Level Security)
- **Payments**: Stripe Checkout
- **Hosting**: Vercel
- **PWA**: next-pwa, web push
- **i18n**: next-intl (default locale "en")
- **Sermons/Live**: embedded YouTube / Facebook — no self-hosted video

## NON-NEGOTIABLES
1. **RLS on every table.** No table ships without Row Level Security policies. The `backend` agent must include RLS in every migration.
2. **Secrets never reach the browser.** `SUPABASE_SERVICE_ROLE_KEY` and `STRIPE_SECRET_KEY` are server-only. Only `NEXT_PUBLIC_*` vars go to the client.
3. **All user-facing text via i18n.** Import from `@/i18n/dictionary` or `useTranslations()`. Zero hard-coded strings in JSX.
4. **Accessibility.** Visible keyboard focus (`:focus-visible` ring), `prefers-reduced-motion` respected, minimum 16 px body text, semantic HTML.
5. **Child safety.** Collect no data about minors without an explicit safeguarding review.
6. **Mobile-first.** Every screen works on a 375 px phone and installs as a PWA.

## DESIGN TOKENS
```
Fonts:    headings  → "Plus Jakarta Sans" weight 600–800
          body/UI   → "Inter" weight 400–600

Colors:
  --bg           #F2F7FB   page background
  --surface      #E4EFF8   sky panels
  --sky-2        #D7E9F6
  --card         #FFFFFF
  --primary      #2479C2
  --primary-deep #1C5F9C
  --primary-tint #E1EEF9
  --ink          #173A5E   headings
  --body         #45596B   body text
  --muted        #8194A6
  --border       #DCE7F0
  --accent       #E0A03A   warm amber — Give actions ONLY
  --accent-deep  #B97E1E

Radii:    10 / 12 / 16 / 999 (pill)
Shadow:   0 1px 3px rgba(23,58,94,0.04)
```

## LAYOUT
- Top app bar with logo slot
- 5-item bottom tab nav on mobile: Home · Sermons · Events · Give · Prayer
- Becomes top nav on desktop
- Image placeholders: labelled "Add photo" box until real media is uploaded

## ROADMAP
**Phase 1 (Launch):** auth, home, sermons (embedded video), events + RSVP, announcements, online giving (Stripe), admin panel, PWA, Vercel deploy.
**Phase 2:** prayer requests, fellowship groups, photo galleries, email notifications.
**Phase 3:** Kachin (Jinghpaw) toggle, hymn book, cultural events (Manau, Kachin National Day), newcomer resources, volunteer rosters.

## WORKFLOW (run for every feature)
1. **architect** — plans the feature, designs data model + RLS, writes task breakdown (read-only).
2. **frontend** — builds the Next.js UI (design tokens, mobile-first, all text via i18n).
3. **backend** — writes Supabase migration + RLS policies + server routes.
4. **security-reviewer** — reviews diff for auth/payment/privacy/child-safety/RLS gaps (blocking, read-only).
5. **qa** — writes/runs tests, confirms prod build passes, checks mobile + a11y.
6. Commit after each working feature.

## SLASH COMMANDS
- `/new-feature <name>` — full agent pipeline for a new feature
- `/review-security` — run security-reviewer on current diff
- `/add-language <locale>` — scaffold locale + list untranslated strings
- `/ship` — pre-deploy checklist (build, RLS, secrets, env vars, PWA)

## FILE STRUCTURE
```
src/
  app/
    (public)/        public-facing pages
    (auth)/          login / signup
    admin/           admin area (server-side auth guard)
    api/             API routes (server-only secrets here)
  components/
    ui/              design-system primitives
    layout/          AppBar, BottomNav, PageHeader
  lib/
    supabase/        client + server helpers
    stripe/          server-only stripe instance
  i18n/
    dictionaries/    en.json (and future locales)
    config.ts
  types/             shared TypeScript types
docs/                build kit and reference docs
```
