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

## Day 8 — Workflow 1: member signup ⏭️
Call `emitToN8n("member.signup", {...})` from the signup API route.
n8n workflow JSON exported to `deploy/n8n/workflows/member-signup.json`.

## Day 9 — Workflows 2 & 3 ⏭️
Volunteer roster + weekly giving summary workflows.

## Day 10 — QA + docs ⏭️
Exercise all jobs/flows end-to-end, write `docs/automation.md`.
