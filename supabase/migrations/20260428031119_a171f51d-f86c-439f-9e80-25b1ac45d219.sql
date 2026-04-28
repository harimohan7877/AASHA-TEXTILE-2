-- Revoke direct EXECUTE on internal SECURITY DEFINER helpers.
-- They are still callable inside RLS policies and triggers (which run as postgres).
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM anon, authenticated, public;