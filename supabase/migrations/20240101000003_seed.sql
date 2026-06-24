-- ============================================================
-- AKCC seed — giving presets
-- ============================================================

INSERT INTO public.giving_presets (amount_cents, label, sort_order, active) VALUES
  (1000,  '$10',  1, TRUE),
  (2500,  '$25',  2, TRUE),
  (5000,  '$50',  3, TRUE),
  (10000, '$100', 4, TRUE),
  (25000, '$250', 5, TRUE);
