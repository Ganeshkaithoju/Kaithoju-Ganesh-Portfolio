
ALTER TABLE public.contact_messages
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS is_approved boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_pinned boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS moderated_at timestamptz;

CREATE INDEX IF NOT EXISTS contact_messages_status_idx ON public.contact_messages (status);

GRANT SELECT ON public.contact_messages TO anon;
GRANT SELECT ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;

DROP POLICY IF EXISTS "Anyone can view approved messages" ON public.contact_messages;
CREATE POLICY "Anyone can view approved messages"
  ON public.contact_messages
  FOR SELECT
  TO anon, authenticated
  USING (status = 'approved');
