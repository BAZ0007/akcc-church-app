# AKCC — Australian Kachin Christian Church App

A bilingual-ready Progressive Web App built for a real church community, designed to be run day-to-day by a single non-technical administrator. Built solo, end-to-end: data modeling, Row Level Security, payments, background automation, and a mobile-first UI.

## Why this project

Small community organizations rarely have engineering support — one volunteer usually maintains everything. This app is designed around that constraint: every admin action is a simple form, every table is protected by database-level security policies (not just app logic), and every recurring task (reminders, receipts, digests) runs automatically instead of depending on someone remembering to send an email.

## Features

- **Sermons & Live** — embedded YouTube/Facebook video, no self-hosted media
- **Events & RSVP** — members register attendance; automatic reminder emails 24h before an event
- **Announcements** — church-wide notices, admin-managed
- **Prayer wall** — public prayer requests with admin notification on submission
- **Online giving** — Stripe Checkout, with on-demand PDF giving statements emailed to donors
- **Weekly digest** — automatic Sunday morning email summarizing the week's sermons and upcoming events, sent to subscribed members
- **Admin panel** — server-guarded area for managing sermons, events, announcements, and giving
- **PWA** — installable on a phone, works mobile-first at 375px
- **i18n-ready** — all UI text routed through a dictionary layer, ready for a future Kachin (Jinghpaw) translation

## Architecture

**App**
- Next.js 16 (App Router) + TypeScript + Tailwind v4
- Supabase (Postgres + Auth + Storage) with Row Level Security on every table — no table ships without an RLS policy
- Stripe Checkout for payments, with webhook signature verification server-side
- Vercel hosting, `next-pwa` for installability

**Automation layer**
- **Trigger.dev** — scheduled and on-demand background jobs: hourly event-reminder sweep, weekly digest cron, on-demand giving-statement PDF generation, prayer-request admin alerts
- **n8n** (self-hosted on a DigitalOcean droplet behind Caddy/TLS) — receives signed webhook events from the app (`member.signup`, `event.rsvp`, `giving.received`) and handles downstream notification workflows
- Every event sent from the app to n8n is HMAC-SHA256 signed and timing-safe verified with a replay window — the automation layer never trusts an unauthenticated request

See [docs/automation.md](docs/automation.md) for the full automation reference (architecture, jobs, workflows, env vars, setup checklist).

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS v4 |
| Database / Auth | Supabase (Postgres, RLS, Auth, Storage) |
| Payments | Stripe Checkout + webhooks |
| Background jobs | Trigger.dev |
| Workflow automation | n8n (self-hosted, DigitalOcean + Docker + Caddy) |
| Email | Resend |
| PDF generation | pdfkit |
| Testing | Jest + React Testing Library |
| Validation | Zod |
| Hosting | Vercel |

## Project structure

```
src/
  app/
    (public)/        sermons, events, giving, prayer
    (auth)/          login / signup
    admin/           admin area (server-side auth guard)
    api/             API routes — Stripe webhooks, RSVP, prayer, admin actions
  components/        design-system primitives + layout
  lib/               Supabase clients, Stripe server instance, n8n signed emitter
  i18n/              dictionary-based translation layer
  trigger/           Trigger.dev background job definitions
supabase/
  migrations/        versioned schema + RLS policies
deploy/
  n8n/               docker-compose, Caddyfile, importable n8n workflow JSONs
docs/
  automation.md       automation architecture reference
```

## Getting started

```bash
npm install
cp .env.local.example .env.local   # fill in your Supabase/Stripe/Resend/etc. keys
npm run dev
```

Then run the Supabase migrations in `supabase/migrations/` against your project (in order), and see `.env.local.example` for every environment variable the app needs and where to get it.

```bash
npm run build      # production build
npm run lint       # eslint
npm test           # jest
```

## Security notes

- Every table has Row Level Security enabled — the client never has a path to data it shouldn't see, independent of app-layer bugs
- `SUPABASE_SERVICE_ROLE_KEY` and `STRIPE_SECRET_KEY` are server-only and never exposed to the client
- Stripe webhook payloads are verified via `stripe.webhooks.constructEvent` before being trusted
- Outbound events to the n8n automation layer are HMAC-signed and verified with a replay window on the receiving end

## Status

Phase 1 (launch) is feature-complete: auth, sermons, events + RSVP, announcements, online giving, admin panel, and the full automation layer described above. Phase 2/3 (fellowship groups, photo galleries, Kachin language toggle, hymn book) are planned next — see [CLAUDE.md](CLAUDE.md) for the full roadmap.
