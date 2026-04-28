-- Tighten user_roles SELECT: only authenticated users can read their own role
DROP POLICY IF EXISTS "Roles viewable by everyone" ON public.user_roles;
CREATE POLICY "Users view own roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can still read all rows via the existing "Admins manage roles" ALL policy.

-- Tighten profiles SELECT: only authenticated users can read profiles (own profile),
-- and admins can read all via has_role check.
DROP POLICY IF EXISTS "Profiles viewable by everyone" ON public.profiles;
CREATE POLICY "Users view own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));