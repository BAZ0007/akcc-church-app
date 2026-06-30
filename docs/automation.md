# AKCC Automation Layer

Background jobs and visual automation for the AKCC church app.

---

## Architecture

```
                 ┌─────────────────────────────────┐
                 │         Next.js App (Vercel)      │
                 │                                   │
                 │  Auth callback ──► emitToN8n()    │
                 │  RSVP route    ──► emitToN8n()    │
                 │  Stripe webhook ─► emitToN8n()    │
                 │  Admin routes  ──► tasks.trigger() │
                 └──────────┬──────────────┬─────────┘
                            │              │
              HMAC-signed   │              │  Trigger.dev SDK
              POST          │              │
                 ┌──────────▼──────┐  ┌───▼──────────────────┐
                 │  n8n (DO droplet)│  │  Trigger.dev (cloud)  │
                 │                  │  │                        │
                 │  member-signup   │  │  event-reminder        │
                 │  event-rsvp      │  │  giving-statement      │
                 │  giving-received │  │  prayer-notify         │
                 │                  │  │  weekly-digest         │
                 └─────────┬────────┘  └──────────┬────────────┘
                           │                       │
                           └──────────┬────────────┘
                                      │ Resend API
                                 Transactional email
```

**Two job systems, different roles:**

| System | Purpose | Trigger |
|--------|---------|---------|
| Trigger.dev | Scheduled + on-demand background tasks | Code (`tasks.trigger()`, cron) |
| n8n | Visual no-code workflows, event-driven | HMAC-signed webhook from app |

---

## Trigger.dev Tasks

All tasks live in `src/trigger/`. Deploy with `npm run trigger:deploy`.

### `event-reminder`
**File:** [src/trigger/event-reminder.ts](../src/trigger/event-reminder.ts)
**Schedule:** Every hour (Melbourne time)
**What it does:** Finds published events starting in 23–25 hours with no reminder sent; marks `reminder_sent_at` BEFORE sending (at-most-once); batch-sends reminder emails via Resend to all RSVPs.

**Env vars needed:** `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`

**Test:** Create an event starting ~24 hours from now. Wait for the next hourly run, or trigger manually in the Trigger.dev dashboard.

---

### `giving-statement`
**File:** [src/trigger/giving-statement.ts](../src/trigger/giving-statement.ts)
**Type:** On-demand (triggered by admin)
**What it does:** Fetches a member's completed givings for a requested year; generates an A4 PDF with pdfkit; sends as an email attachment via Resend.

**Trigger from:** Admin UI at `/admin/giving` → select member + year → Send Statement.

**Env vars needed:** `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`

**Test:** Log in as admin → `/admin/giving` → select a member → click Send.

---

### `prayer-notify`
**File:** [src/trigger/prayer-notify.ts](../src/trigger/prayer-notify.ts)
**Type:** On-demand (triggered per prayer request)
**What it does:** Emails `ADMIN_EMAIL` when a new prayer request is submitted. Skips gracefully if `ADMIN_EMAIL` is not set. Subject injection mitigated by stripping newlines from submitter name.

**Trigger from:** `POST /api/prayer` — fires automatically when a prayer request is submitted.

**Env vars needed:** `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `ADMIN_EMAIL`

**Test:** Submit a prayer request on the `/prayer` page. Check the admin email inbox.

---

### `weekly-digest`
**File:** [src/trigger/weekly-digest.ts](../src/trigger/weekly-digest.ts)
**Schedule:** Sunday 08:00 AEDT (Melbourne)
**What it does:** Fetches subscribed members, this week's sermons, and 14-day events. Builds an HTML digest email; batch-sends via Resend (50/batch). Skips if no sermons AND no events.

**Opt-out:** Set `digest_subscribed = FALSE` on the member's profile row.

**Env vars needed:** `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`

**Test:** Trigger manually in the Trigger.dev dashboard. Ensure at least one published sermon or upcoming event exists.

---

## n8n Workflows

All workflow JSONs live in `deploy/n8n/workflows/`. Import via n8n UI → **Workflows → Import from file**. Activate each workflow after import.

**Common setup for all workflows:**
- Webhook node: **Include Headers** must be enabled (for `X-AKCC-Signature` access)
- All workflows use `/webhook/akcc` path → `N8N_WEBHOOK_URL=https://<your-n8n>/webhook/akcc`
- All verify HMAC-SHA256 signature + 5-minute replay window in the Code node

### `member-signup.json`
**File:** [deploy/n8n/workflows/member-signup.json](../deploy/n8n/workflows/member-signup.json)
**Trigger:** User confirms email → `/auth/callback` → `emitToN8n("member.signup", ...)`
**Detection:** `created_at` freshness check (< 2 min old), not the spoofable `type=` query param
**Actions:** Welcome email to new member + admin notification (parallel)

**Data payload:**
```json
{ "userId": "uuid", "email": "user@example.com", "fullName": "Jane Doe" }
```

---

### `event-rsvp.json`
**File:** [deploy/n8n/workflows/event-rsvp.json](../deploy/n8n/workflows/event-rsvp.json)
**Trigger:** Member RSVPs `attending` → `POST /api/events/[id]/rsvp` → `emitToN8n("event.rsvp", ...)`
**Actions:** RSVP confirmation email to member (formatted date/time in Melbourne timezone)

**Data payload:**
```json
{
  "eventId": "uuid",
  "eventTitle": "Sunday Service",
  "eventDate": "2026-07-06T10:00:00+10:00",
  "userId": "uuid",
  "userEmail": "member@example.com",
  "status": "attending",
  "guestCount": 2
}
```

---

### `giving-received.json`
**File:** [deploy/n8n/workflows/giving-received.json](../deploy/n8n/workflows/giving-received.json)
**Trigger:** Stripe `checkout.session.completed` → `POST /api/webhooks/stripe` → `emitToN8n("giving.received", ...)`
**Actions:** Thank-you email to donor + giving notification to admin (parallel)

**Data payload:**
```json
{
  "sessionId": "cs_live_xxx",
  "amountCents": 5000,
  "currency": "AUD",
  "donorEmail": "donor@example.com",
  "donorName": "John Doe",
  "fund": "general"
}
```

**Stripe setup required:** Stripe dashboard → Developers → Webhooks → Add endpoint:
- URL: `https://<your-app>/api/webhooks/stripe`
- Events: `checkout.session.completed`
- Copy the signing secret → add as `STRIPE_WEBHOOK_SECRET` in Vercel

---

## Environment Variables

### Next.js app (Vercel)

| Variable | Purpose | Where to get |
|----------|---------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role (server only) | Supabase → Settings → API |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe public key | Stripe → API keys |
| `STRIPE_SECRET_KEY` | Stripe secret (server only) | Stripe → API keys |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | Stripe → Webhooks → endpoint |
| `NEXT_PUBLIC_APP_URL` | Public app URL | e.g. `https://akcc.org.au` |
| `TRIGGER_SECRET_KEY` | Trigger.dev secret | Trigger.dev → project → API keys |
| `RESEND_API_KEY` | Resend API key | resend.com → API Keys |
| `RESEND_FROM_EMAIL` | Verified from address | e.g. `AKCC <no-reply@akcc.org.au>` |
| `ADMIN_EMAIL` | Admin notification address | Your admin email |
| `N8N_WEBHOOK_URL` | n8n webhook endpoint | `https://<n8n-domain>/webhook/akcc` |
| `N8N_WEBHOOK_SECRET` | HMAC signing secret | Same value as in `deploy/n8n/.env` |

### n8n droplet (`deploy/n8n/.env`)

| Variable | Purpose |
|----------|---------|
| `N8N_DOMAIN` | Subdomain (DNS A record required) |
| `POSTGRES_PASSWORD` | Local Postgres password |
| `N8N_BASIC_AUTH_USER` | Editor basic-auth username |
| `N8N_BASIC_AUTH_PASSWORD` | Editor basic-auth password |
| `N8N_ENCRYPTION_KEY` | n8n credential encryption key (set once, never change) |
| `N8N_WEBHOOK_SECRET` | HMAC secret (must match Vercel `N8N_WEBHOOK_SECRET`) |
| `RESEND_API_KEY` | Resend key for workflow email sends |
| `N8N_FROM_EMAIL` | Verified from address for Resend |
| `ADMIN_EMAIL` | Admin email for workflow notifications |

### Trigger.dev dashboard

Add these to your Trigger.dev project environment:
`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `ADMIN_EMAIL`

---

## Setup Checklist

### Trigger.dev
- [ ] Replace `"proj_replace_me"` in [trigger.config.ts](../trigger.config.ts) with your project ref
- [ ] Add `TRIGGER_SECRET_KEY` to `.env.local` and Vercel
- [ ] Add Supabase + Resend env vars to Trigger.dev project environment
- [ ] Run `npm run trigger:deploy` to deploy all tasks
- [ ] Verify `event-reminder` and `weekly-digest` schedules appear in the Trigger.dev dashboard

### Resend
- [ ] Verify your sending domain in Resend dashboard
- [ ] Add `RESEND_API_KEY` and `RESEND_FROM_EMAIL` everywhere (`.env.local`, Vercel, Trigger.dev, n8n)

### n8n (DigitalOcean)
- [ ] Follow [deploy/n8n/README.md](../deploy/n8n/README.md) to provision the droplet
- [ ] `cp .env.example .env` and fill all values
- [ ] `docker compose up -d`
- [ ] Create owner account on first browser visit
- [ ] Import all three workflow JSONs from `deploy/n8n/workflows/`
- [ ] Activate each workflow
- [ ] Set `N8N_WEBHOOK_URL` and `N8N_WEBHOOK_SECRET` in Vercel

### Stripe webhook
- [ ] Register endpoint in Stripe dashboard → `checkout.session.completed`
- [ ] Add `STRIPE_WEBHOOK_SECRET` to Vercel
- [ ] Test with Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

### Supabase migrations
- [ ] Run migration `20240101000004_event_reminder.sql` (adds `reminder_sent_at` to events)
- [ ] Run migration `20240101000005_prayer_requests.sql` (creates prayer_requests table + RLS)
- [ ] Run migration `20240101000006_digest_subscription.sql` (adds `digest_subscribed` to profiles)
- [ ] Run migration `20240101000007_givings_owner_select.sql` (RLS — donors can read own givings)

---

## Troubleshooting

**Trigger.dev task not running:**
1. Check task is deployed: `npm run trigger:deploy`
2. Verify `TRIGGER_SECRET_KEY` and `TRIGGER_PROJECT_REF` match the dashboard
3. Check task logs in the Trigger.dev dashboard → Runs

**n8n workflow not firing:**
1. Confirm workflow is **Active** (toggle in n8n editor)
2. Confirm `N8N_WEBHOOK_URL` in Vercel matches the n8n webhook path
3. Confirm `N8N_WEBHOOK_SECRET` is identical in Vercel and `deploy/n8n/.env`
4. Check n8n executions log — signature failures appear as "Invalid signature — request rejected"
5. If using `n8n.yourdomain.com`, ensure the DNS A record resolves and TLS is valid

**Emails not sending:**
1. Verify `RESEND_API_KEY` is valid and the domain is verified in Resend
2. Check `RESEND_FROM_EMAIL` matches a verified Resend domain
3. Check Resend dashboard → Logs for delivery status

**Stripe webhook signature invalid:**
1. Ensure `STRIPE_WEBHOOK_SECRET` in Vercel was copied from the correct Stripe webhook endpoint
2. For local testing use Stripe CLI — do not use raw `curl` (Stripe signs the payload)
3. The webhook reads the raw body via `request.text()` — ensure no middleware re-parses the body before the route handler
