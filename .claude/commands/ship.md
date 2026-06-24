# /ship

Pre-deploy checklist. Run before every Vercel deployment.

## Checklist

### 1. Build
```bash
npm run build
```
Must pass. Zero errors.

### 2. Type-check
```bash
npx tsc --noEmit
```
Zero errors.

### 3. Lint
```bash
npm run lint
```
Zero errors.

### 4. RLS audit
Run this query against your Supabase project to confirm every table has RLS enabled:
```sql
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = false;
```
Result must be empty. If any tables appear, add RLS before deploying.

### 5. Secrets check
Confirm these are NOT in `NEXT_PUBLIC_*` env vars or any client file:
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

Confirm these ARE set in Vercel environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_APP_URL`

### 6. PWA
- `public/manifest.json` exists and is linked in `src/app/layout.tsx`
- Icons at `public/icons/icon-192.png` and `public/icons/icon-512.png` exist
- Service worker registered

### 7. .env.local not committed
```bash
git status
```
`.env.local` must not appear in staged or committed files.

### 8. Final deploy steps
1. Push to `main` (or merge PR).
2. Vercel auto-deploys. Watch the build log.
3. After deploy, open the production URL and verify:
   - Home page loads
   - PWA install prompt appears (mobile)
   - Stripe giving flow reaches Checkout
   - Admin login works

## If anything fails
Fix it locally, re-run the checklist, then deploy.
