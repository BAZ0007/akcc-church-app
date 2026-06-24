-- ============================================================
-- AKCC schema — all application tables
-- ============================================================

-- profiles (one row per auth.users row, created by trigger)
CREATE TABLE public.profiles (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT        NOT NULL,
  full_name   TEXT        NOT NULL,
  phone       TEXT,
  role        TEXT        NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'admin')),
  joined_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_profiles_role ON public.profiles(role);

-- sermons
CREATE TABLE public.sermons (
  id           UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT    NOT NULL,
  speaker      TEXT    NOT NULL,
  youtube_url  TEXT    NOT NULL,
  youtube_id   TEXT    NOT NULL,
  series       TEXT,
  sermon_date  DATE    NOT NULL,
  description  TEXT,
  published    BOOLEAN NOT NULL DEFAULT TRUE,
  created_by   UUID    NOT NULL REFERENCES public.profiles(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_sermons_sermon_date ON public.sermons(sermon_date DESC);
CREATE INDEX idx_sermons_published   ON public.sermons(published);

-- events
CREATE TABLE public.events (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT    NOT NULL,
  description TEXT,
  location    TEXT    NOT NULL,
  starts_at   TIMESTAMPTZ NOT NULL,
  ends_at     TIMESTAMPTZ,
  capacity    INTEGER,
  published   BOOLEAN NOT NULL DEFAULT TRUE,
  created_by  UUID    NOT NULL REFERENCES public.profiles(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_events_starts_at ON public.events(starts_at ASC);
CREATE INDEX idx_events_published  ON public.events(published);

-- rsvps
CREATE TABLE public.rsvps (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    UUID    NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id     UUID    NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status      TEXT    NOT NULL DEFAULT 'attending' CHECK (status IN ('attending', 'not_attending', 'maybe')),
  guest_count INTEGER NOT NULL DEFAULT 1 CHECK (guest_count >= 1 AND guest_count <= 10),
  note        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (event_id, user_id)
);
CREATE INDEX idx_rsvps_event_id ON public.rsvps(event_id);
CREATE INDEX idx_rsvps_user_id  ON public.rsvps(user_id);

-- announcements
CREATE TABLE public.announcements (
  id         UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  title      TEXT    NOT NULL,
  body       TEXT    NOT NULL,
  pinned     BOOLEAN NOT NULL DEFAULT FALSE,
  published  BOOLEAN NOT NULL DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  created_by UUID    NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_announcements_published  ON public.announcements(published);
CREATE INDEX idx_announcements_pinned     ON public.announcements(pinned DESC);
CREATE INDEX idx_announcements_created_at ON public.announcements(created_at DESC);

-- givings
CREATE TABLE public.givings (
  id                    UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID    NOT NULL REFERENCES public.profiles(id),
  stripe_session_id     TEXT    NOT NULL UNIQUE,
  stripe_payment_intent TEXT,
  fund                  TEXT    NOT NULL CHECK (fund IN ('general', 'building', 'missions')),
  amount_cents          INTEGER NOT NULL CHECK (amount_cents > 0),
  currency              TEXT    NOT NULL DEFAULT 'aud',
  frequency             TEXT    NOT NULL DEFAULT 'one_off' CHECK (frequency IN ('one_off', 'monthly')),
  stripe_subscription_id TEXT,
  status                TEXT    NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  receipt_email         TEXT    NOT NULL,
  stripe_receipt_url    TEXT,
  paid_at               TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_givings_user_id        ON public.givings(user_id);
CREATE INDEX idx_givings_status         ON public.givings(status);
CREATE INDEX idx_givings_fund           ON public.givings(fund);
CREATE INDEX idx_givings_created_at     ON public.givings(created_at DESC);
CREATE INDEX idx_givings_stripe_session ON public.givings(stripe_session_id);

-- giving_presets
CREATE TABLE public.giving_presets (
  id           UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  label        TEXT    NOT NULL,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  active       BOOLEAN NOT NULL DEFAULT TRUE
);
