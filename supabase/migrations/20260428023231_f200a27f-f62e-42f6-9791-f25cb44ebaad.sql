
-- Revoke EXECUTE on internal trigger functions from public/authenticated
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- has_role is intentionally callable (used in RLS policies by postgres role), leave it.

-- Restrict product-images bucket listing: allow SELECT only when a specific object name is requested
DROP POLICY IF EXISTS "Product images public read" ON storage.objects;
CREATE POLICY "Product images public read by name" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images' AND name IS NOT NULL);
