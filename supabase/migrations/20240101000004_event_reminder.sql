-- Add reminder_sent_at to events so the event-reminder job never double-fires.
-- The job sets this column (via service role) before sending emails.
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_events_reminder_sent_at
  ON public.events(reminder_sent_at)
  WHERE reminder_sent_at IS NULL;
