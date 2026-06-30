# AKCC Automation Build — Progress

## Legend
✅ done · 🔨 in progress · ⏭️ next · ⛔ need from you

---

## Day 1 — Trigger.dev Setup ✅
- `@trigger.dev/sdk` v4.4.6, `trigger.config.ts`, `src/trigger/hello-world.ts`, npm scripts
- ⛔ Need: project ref → `trigger.config.ts`; secret key → `.env.local` + Vercel + Trigger.dev env vars

## Day 2 — `event-reminder` ✅
- Migration: `reminder_sent_at` on events · `src/lib/email.ts` · `src/trigger/event-reminder.ts` (hourly Melbourne cron, 23-25h window, idempotency, batch Resend, 3 retries)
- ⛔ Need: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`; run migration in Supabase

## Day 3 — `giving-statement` ✅
- `pdfkit` · `src/trigger/giving-statement.ts` (PDF → Resend attachment, service role) · `/api/admin/giving/statement` · `/admin/giving` page with two-step confirm

## Day 4 — `prayer-notify` ✅
- Migration: `prayer_requests` table + RLS (anon insert, public wall, admin all)
- `src/trigger/prayer-notify.ts` (admin email alert, 3 retries)
- `/api/prayer` POST + GET · real prayer page + form + public wall
- `src/lib/email.ts` exports `ADMIN_EMAIL`
- ⛔ Need: `ADMIN_EMAIL` in env vars

## Day 5 — `weekly-digest` ✅
- Migration: `digest_subscribed BOOLEAN DEFAULT TRUE` on profiles
- `src/trigger/weekly-digest.ts`: Sunday 8am Melbourne cron; fetches subscribed members, week's sermons, 14-day events; HTML digest email; Resend batch (50/batch); skips if no content

---

## Day 6 — n8n infra on DigitalOcean ✅
- `deploy/n8n/docker-compose.yml`: n8n + Postgres + Caddy (auto-HTTPS), internal network only
- `deploy/n8n/Caddyfile`: reverse proxy, TLS via `{$N8N_DOMAIN}`
- `deploy/n8n/.env.example`: N8N_DOMAIN, POSTGRES_PASSWORD, basic-auth creds, encryption key, N8N_WEBHOOK_SECRET
- `deploy/n8n/README.md`: step-by-step DO droplet → DNS → Docker → compose up → lock first login
- ⛔ Need: create $6/mo DO droplet (Ubuntu 24.04, Sydney), point DNS A record, `cp .env.example .env` + fill all CHANGE_ME values, `docker compose up -d`
- ⛔ Need: add `N8N_WEBHOOK_SECRET` to Vercel env vars (same value as in .env)

## Day 7 — Signed event emitter ✅
- `src/lib/n8n.ts`: server-only `emitToN8n(event, data)` — HMAC-SHA256 signs full JSON body, adds `X-AKCC-Signature: sha256=<hex>` header
- Graceful no-op if `N8N_WEBHOOK_URL` not set; throws if URL set but secret missing
- `.env.local.example` updated with `N8N_WEBHOOK_URL` + `N8N_WEBHOOK_SECRET`
- ⛔ Need: add both vars to `.env.local`, Vercel env vars

## Day 8 — Workflow 1: member signup ✅
- `src/app/auth/callback/route.ts`: fire-and-forget `emitToN8n("member.signup", { userId, email, fullName })` — detects new signup via `created_at` freshness (< 2 min), not spoofable `type=` param
- `src/app/(auth)/signup/page.tsx`: added `emailRedirectTo` so Supabase sends confirmation link back to `/auth/callback`
- `deploy/n8n/workflows/member-signup.json`: importable workflow — webhook → HMAC verify (timing-safe, 5-min replay window) → welcome email + admin notify (parallel, via Resend HTTP Request)
- `deploy/n8n/.env.example`: added `RESEND_API_KEY`, `N8N_FROM_EMAIL`, `ADMIN_EMAIL` for workflow use
- ⛔ Need: import `member-signup.json` into n8n, activate workflow, set `N8N_WEBHOOK_URL=https://<n8n-domain>/webhook/akcc` in Vercel

## Day 9 — Workflows 2 & 3 ✅
- `src/app/api/events/[id]/rsvp/route.ts`: fire-and-forget `emitToN8n("event.rsvp", {...})` on attending RSVP; added `title` to event select
- `src/app/api/webhooks/stripe/route.ts`: NEW — verifies Stripe signature via `stripe.webhooks.constructEvent(rawBody, sig, secret)`; emits `giving.received` on `checkout.session.completed`
- `deploy/n8n/workflows/event-rsvp.json`: RSVP confirmation email to member
- `deploy/n8n/workflows/giving-received.json`: donor thank-you + admin notification (parallel)
- Migration `20240101000007`: adds `"givings: owner can read own"` RLS policy (pre-existing gap — donors couldn't read their own giving history)
- ⛔ Need: run migration in Supabase; register Stripe webhook in dashboard → endpoint `/api/webhooks/stripe`, event `checkout.session.completed`; add `STRIPE_WEBHOOK_SECRET` to Vercel

## Day 10 — QA + docs ✅
- `npx tsc --noEmit` — zero errors across all new code
- `npm run build` — production build passes (fixed Stripe client build-time init)
- All n8n workflow JSONs valid (node -e JSON.parse check)
- `src/lib/stripe/server.ts`: `||` fallback prevents constructor throw during build when STRIPE_SECRET_KEY absent
- `docs/automation.md`: full reference — architecture, all tasks/workflows, env var table, setup checklist, troubleshooting
