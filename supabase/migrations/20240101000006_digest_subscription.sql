-- Opt-in flag for the weekly digest email (defaults TRUE so all existing
-- members are subscribed until they ask to opt out).
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS digest_subscribed BOOLEAN NOT NULL DEFAULT TRUE;
