-- Fix: contact_messages exposes email publicly via SELECT policy
-- Remove public SELECT policy and expose safe columns through a SECURITY DEFINER function

DROP POLICY IF EXISTS "Anyone can view approved messages" ON public.contact_messages;

-- Keep an authenticated-owner-friendly path if desired later; for now only service_role reads full rows.

CREATE OR REPLACE FUNCTION public.get_approved_messages()
RETURNS TABLE (
  id uuid,
  name text,
  message text,
  created_at timestamptz,
  is_pinned boolean,
  is_featured boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, name, message, created_at, is_pinned, is_featured
  FROM public.contact_messages
  WHERE status = 'approved'
  ORDER BY is_pinned DESC, is_featured DESC, created_at DESC;
$$;

REVOKE ALL ON FUNCTION public.get_approved_messages() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_approved_messages() TO anon, authenticated;

-- admin_credentials: RLS enabled with no policies = no client access, which is correct.
-- Explicitly revoke Data API role grants so password_hash can never leak if a policy is later added by mistake.
REVOKE ALL ON public.admin_credentials FROM anon, authenticated;
GRANT ALL ON public.admin_credentials TO service_role;