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

### ⛔ Still needed to complete end-to-end
1. Go to [cloud.trigger.dev](https://cloud.trigger.dev) → create free account + project
2. Copy **Project Ref** (`proj_xxxxxxxx`) → paste into `trigger.config.ts` line 4
3. Copy **Secret Key** (`tr_dev_xxxxxxxx`) → add to `.env.local` as `TRIGGER_SECRET_KEY`
4. Add both to Vercel env vars
5. Run `npm run trigger:dev` locally → confirm `hello-world` shows in dashboard
6. Run `npm run trigger:deploy`

---

## Day 2 — `event-reminder` ✅

### What shipped
- Installed `resend` v6 package
- `supabase/migrations/20240101000004_event_reminder.sql` — adds `reminder_sent_at TIMESTAMPTZ` + partial index to `events`
- `src/lib/email.ts` — server-only Resend singleton + FROM_ADDRESS helper
- `src/trigger/event-reminder.ts` — `schedules.task` (id: `event-reminder`)
  - Cron: `0 * * * *` in `Australia/Melbourne` timezone
  - Window: events starting 23–25 h from now, `reminder_sent_at IS NULL`
  - Idempotency: marks `reminder_sent_at` BEFORE sending (at-most-once, no spam)
  - Retries: 3 attempts, exponential backoff 5s → 30s
  - HTML-escapes all admin-provided fields before inserting into email
  - Sends batch via Resend; logs errors per-event without crashing

### ⛔ Need from you
1. **Resend account** — [resend.com](https://resend.com) → free plan is fine
2. Verify your sending domain (or use Resend's sandbox `onboarding@resend.dev` for testing)
3. Add to `.env.local` and Vercel env vars:
   ```
   RESEND_API_KEY=re_...
   RESEND_FROM_EMAIL=AKCC <no-reply@yourdomain.com>
   ```
4. Add same vars to Trigger.dev dashboard → project → environment variables
5. Run migration against your Supabase project: `supabase db push` (or apply via Supabase dashboard SQL editor)

---

## Day 3 — `giving-statement` ⏭️
On-demand PDF + email for year-end giving statement.

## Day 4 — `prayer-notify` ⏭️
Fire from prayer-create API → email admin when new prayer request arrives.

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
