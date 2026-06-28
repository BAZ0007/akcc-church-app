# AKCC Automation Build — Progress

## Legend
✅ done · 🔨 in progress · ⏭️ next · ⛔ need from you

---

## Day 1 — Trigger.dev Setup ✅

### What shipped
- Installed `@trigger.dev/sdk` v4.4.6 (Trigger.dev v3 platform)
- `trigger.config.ts` at repo root — project ref placeholder, `src/trigger/` dir registered
- `src/trigger/hello-world.ts` — trivial test task (`hello-world`)
- `.env.local.example` updated with `TRIGGER_SECRET_KEY` + `TRIGGER_PROJECT_REF`
- `package.json` scripts added: `trigger:dev`, `trigger:deploy`

### ⛔ Still needed
- Trigger.dev **Project Ref** → paste into `trigger.config.ts` line 4
- Trigger.dev **Secret Key** → add to `.env.local` + Vercel + Trigger.dev env vars

---

## Day 2 — `event-reminder` ✅

### What shipped
- `resend` v6 installed
- Migration `20240101000004_event_reminder.sql` — `reminder_sent_at` + partial index on `events`
- `src/lib/email.ts` — server-only Resend singleton
- `src/trigger/event-reminder.ts` — hourly cron (Melbourne TZ), 23-25h window, idempotency guard, HTML-escaped, 3 retries

### ⛔ Still needed
- Resend account + verified domain → `RESEND_API_KEY` + `RESEND_FROM_EMAIL` in `.env.local`, Vercel, Trigger.dev env vars
- Run migration in Supabase

---

## Day 3 — `giving-statement` ✅

### What shipped
- `pdfkit` installed (+ `@types/pdfkit`)
- `src/trigger/giving-statement.ts` — on-demand task
  - Fetches completed givings for a member+year (service role)
  - Generates A4 PDF with donation table + totals (pdfkit)
  - Emails PDF attachment via Resend; 3 retries
  - HTML-escapes member name in email body
- `src/app/api/admin/giving/statement/route.ts` — admin-only POST; validates userId+year, triggers task
- `src/app/admin/giving/page.tsx` — admin RSC; fetches member list from profiles
- `src/app/admin/giving/_components/StatementForm.tsx` — client form: year + member selectors, two-step confirm before send
- `src/app/admin/layout.tsx` — added "Giving Statements" nav link
- `src/i18n/dictionaries/en.json` — added giving statement + common.confirm keys

---

## Day 4 — `prayer-notify` ⏭️
Trigger.dev task fired from prayer-create API → email admin when new prayer request arrives.

## Day 5 — `weekly-digest` ⏭️
Sunday AM Melbourne cron → email subscribed members week's sermons + events.

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
