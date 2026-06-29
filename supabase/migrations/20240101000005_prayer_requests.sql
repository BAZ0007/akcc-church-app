-- ── prayer_requests ──────────────────────────────────────────────────────────
CREATE TABLE public.prayer_requests (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  name        TEXT,
  request     TEXT        NOT NULL,
  is_public   BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_prayer_requests_is_public   ON public.prayer_requests(is_public);
CREATE INDEX idx_prayer_requests_created_at  ON public.prayer_requests(created_at DESC);

ALTER TABLE public.prayer_requests ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous visitors) may submit a prayer request.
CREATE POLICY "prayer_requests_insert_anon"
  ON public.prayer_requests FOR INSERT
  WITH CHECK (true);

-- Public wall: only published, public requests.
CREATE POLICY "prayer_requests_select_public"
  ON public.prayer_requests FOR SELECT
  USING (is_public = TRUE);

-- Authenticated users can see their own requests too.
CREATE POLICY "prayer_requests_select_own"
  ON public.prayer_requests FOR SELECT
  USING (user_id IS NOT NULL AND user_id = auth.uid());

-- Admins can read all.
CREATE POLICY "prayer_requests_select_admin"
  ON public.prayer_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can delete any request (moderation).
CREATE POLICY "prayer_requests_delete_admin"
  ON public.prayer_requests FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
