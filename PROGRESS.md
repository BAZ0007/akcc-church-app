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

### Steps to complete end-to-end confirmation ⛔
1. Go to [cloud.trigger.dev](https://cloud.trigger.dev) → create a free account/project
2. Copy your **Project Ref** (looks like `proj_xxxxxxxx`) and paste it into `trigger.config.ts` line 4
3. Copy your **Secret Key** (looks like `tr_dev_xxxxxxxx`) and add to `.env.local`:
   ```
   TRIGGER_SECRET_KEY=tr_dev_...
   ```
4. Also add both to Vercel env vars (Project → Settings → Environment Variables)
5. Run locally: `npm run trigger:dev` — confirm `hello-world` shows in dashboard
6. Deploy: `npm run trigger:deploy`
7. Trigger it once from the dashboard to confirm end-to-end run

### ⛔ Need from you
- Trigger.dev **Project Ref** (to update `trigger.config.ts`)
- Trigger.dev **Secret Key** (to add to `.env.local` + Vercel)

Reply with both values and I'll plug them in, run deploy, and complete the end-to-end check.

---

## Day 2 — `event-reminder` 🔨 (not started)
Trigger.dev schedule: 24h before an event, email every RSVPd member.

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
