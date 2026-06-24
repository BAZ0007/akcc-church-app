-- ============================================================
-- AKCC RLS — Row Level Security policies for all tables
-- ============================================================

-- Helper: returns TRUE when the caller's profile.role = 'admin'
-- SECURITY DEFINER so it always runs as the function owner and
-- bypasses RLS on profiles itself.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$$;

-- ────────────────────────────────────────────────────────────
-- profiles
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can read any profile
CREATE POLICY "profiles: authenticated users can read"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (TRUE);

-- A user can only update their own profile row, and cannot change their own role.
-- The WITH CHECK subquery re-reads the existing role from DB so a client cannot
-- promote themselves by passing role='admin' in an UPDATE.
CREATE POLICY "profiles: owner can update"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
  );

-- Admins can update any profile (e.g., promote to admin)
CREATE POLICY "profiles: admin can update any"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ────────────────────────────────────────────────────────────
-- sermons
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.sermons ENABLE ROW LEVEL SECURITY;

-- Public (including anon) can read published sermons
CREATE POLICY "sermons: public can read published"
  ON public.sermons
  FOR SELECT
  USING (published = TRUE);

-- Admins can read all sermons (including unpublished)
CREATE POLICY "sermons: admin can read all"
  ON public.sermons
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Admins can insert
CREATE POLICY "sermons: admin can insert"
  ON public.sermons
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Admins can update
CREATE POLICY "sermons: admin can update"
  ON public.sermons
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admins can delete
CREATE POLICY "sermons: admin can delete"
  ON public.sermons
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ────────────────────────────────────────────────────────────
-- events
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Public can read published events
CREATE POLICY "events: public can read published"
  ON public.events
  FOR SELECT
  USING (published = TRUE);

-- Admins can read all events
CREATE POLICY "events: admin can read all"
  ON public.events
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Admins can insert
CREATE POLICY "events: admin can insert"
  ON public.events
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Admins can update
CREATE POLICY "events: admin can update"
  ON public.events
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admins can delete
CREATE POLICY "events: admin can delete"
  ON public.events
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ────────────────────────────────────────────────────────────
-- rsvps
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;

-- A user can see their own RSVPs
CREATE POLICY "rsvps: owner can read own"
  ON public.rsvps
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Admins can read all RSVPs
CREATE POLICY "rsvps: admin can read all"
  ON public.rsvps
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Authenticated users can insert their own RSVP
CREATE POLICY "rsvps: authenticated can insert own"
  ON public.rsvps
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Owner can update their own RSVP
CREATE POLICY "rsvps: owner can update own"
  ON public.rsvps
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Owner can delete their own RSVP
CREATE POLICY "rsvps: owner can delete own"
  ON public.rsvps
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Admins can delete any RSVP
CREATE POLICY "rsvps: admin can delete any"
  ON public.rsvps
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ────────────────────────────────────────────────────────────
-- announcements
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Public can read published, non-expired announcements
CREATE POLICY "announcements: public can read published"
  ON public.announcements
  FOR SELECT
  USING (
    published = TRUE
    AND (expires_at IS NULL OR expires_at > NOW())
  );

-- Admins can read all announcements
CREATE POLICY "announcements: admin can read all"
  ON public.announcements
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Admins can insert
CREATE POLICY "announcements: admin can insert"
  ON public.announcements
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Admins can update
CREATE POLICY "announcements: admin can update"
  ON public.announcements
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Admins can delete
CREATE POLICY "announcements: admin can delete"
  ON public.announcements
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ────────────────────────────────────────────────────────────
-- givings
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.givings ENABLE ROW LEVEL SECURITY;

-- Only admins can SELECT givings
CREATE POLICY "givings: admin can read all"
  ON public.givings
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Authenticated user can only INSERT a pending row for themselves.
-- status must be 'pending' — only the Stripe webhook (service_role) sets
-- 'completed'. paid_at and stripe_receipt_url must be NULL on insert so
-- clients cannot fabricate completed giving records.
CREATE POLICY "givings: authenticated can insert own"
  ON public.givings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND status = 'pending'
    AND paid_at IS NULL
    AND stripe_receipt_url IS NULL
  );

-- No UPDATE policy — the Stripe webhook runs as service_role, which bypasses RLS

-- ────────────────────────────────────────────────────────────
-- giving_presets
-- ────────────────────────────────────────────────────────────
ALTER TABLE public.giving_presets ENABLE ROW LEVEL SECURITY;

-- Everyone (including anon) can read active presets
CREATE POLICY "giving_presets: public can read active"
  ON public.giving_presets
  FOR SELECT
  USING (active = TRUE);

-- Admins can manage presets
CREATE POLICY "giving_presets: admin can insert"
  ON public.giving_presets
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "giving_presets: admin can update"
  ON public.giving_presets
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "giving_presets: admin can delete"
  ON public.giving_presets
  FOR DELETE
  TO authenticated
  USING (public.is_admin());
