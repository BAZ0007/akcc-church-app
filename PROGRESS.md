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

## Day 6 — n8n infra on DigitalOcean ⏭️
`deploy/n8n/` docker-compose + Caddy + README.

## Day 7 — Signed event emitter ⏭️
Thin HMAC helper to POST signed events to n8n webhook.

## Day 8 — Workflow 1: member signup ⏭️
n8n workflow JSON: new signup → welcome email + ping admin.

## Day 9 — Workflows 2 & 3 ⏭️
Volunteer roster + weekly giving summary workflows.

## Day 10 — QA + docs ⏭️
Exercise all jobs/flows end-to-end, write `docs/automation.md`.
