# /review-security

Run the `security-reviewer` agent on the current working diff.

## What it checks
- Secrets not reaching the browser
- Auth/authorisation gaps
- Missing RLS policies on new tables
- Stripe webhook signature verification
- Child-safety data collection
- Open redirects, XSS, SQL injection risks

## Usage
Run `/review-security` any time before committing, or on demand when you want a second opinion on a security-sensitive change.

## Output
The security-reviewer will report:
- `BLOCKING` — must fix before commit
- `WARNING` — should fix, not blocking
- `PASS` — area looks good

If any BLOCKING issues are found, resolve them and run `/review-security` again before committing.
