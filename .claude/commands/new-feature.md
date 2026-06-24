# /new-feature

Run the full agent pipeline for a new AKCC feature.

**Usage:** `/new-feature <feature-name>`

## Steps (run in order)

1. **architect** — Plans the feature. Produces: data model, RLS policies, API surface, component list, ordered task breakdown.

2. **frontend** — Builds the Next.js UI from the architect's plan. All text via i18n. Mobile-first. Design tokens only.

3. **backend** — Writes Supabase migration (with RLS), server route handlers, and any Stripe integration per the architect's plan.

4. **security-reviewer** — Reviews the diff. Any BLOCKING finding must be resolved before proceeding. Do not continue to step 5 with blocking issues open.

5. **qa** — Runs `npm run build`, `tsc --noEmit`, `npm run lint`, writes/runs tests, spot-checks mobile and accessibility.

6. **Commit** — Only after QA passes. Message format: `feat(<feature-name>): <one-line description>`

## Notes
- Never skip the security-reviewer step for anything touching auth, payments, or personal data.
- If the architect's plan is incomplete, ask for clarification before the frontend/backend agents start.
- Each agent should read the previous agent's output before starting.
