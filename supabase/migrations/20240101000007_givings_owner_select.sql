-- Allow authenticated donors to read their own giving records.
-- Previously only admins could SELECT from givings; donors could not
-- view their own giving history. This is a pre-existing RLS gap.
CREATE POLICY "givings: owner can read own"
  ON public.givings
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());
