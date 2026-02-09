-- EMERGENCY FIX FOR LOGIN AND ADMIN ACCESS

-- 1. Reset Profiles RLS to avoid infinite recursion immediately
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can see own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow public read access" ON public.profiles;

-- Create a temporary robust policy for own profile (This unblocks Login)
CREATE POLICY "Users can see own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- 2. Create the Admin Check Function properly with SECURITY DEFINER
-- This function runs with the privileges of the creator (postgres), bypassing RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.is_admin TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin TO service_role;

-- 3. Now add the Admin View All Policy using the secure function
CREATE POLICY "Admins can see all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (public.is_admin());

-- 4. Fix Support Tickets Policies (ensure they use the secure function too)
DROP POLICY IF EXISTS "Users can view their own tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Admins can update tickets" ON public.support_tickets;

CREATE POLICY "Users can view their own tickets"
ON public.support_tickets FOR SELECT
TO authenticated
USING (
    auth.uid() = user_id 
    OR 
    public.is_admin()
);

CREATE POLICY "Admins can update tickets"
ON public.support_tickets FOR UPDATE
TO authenticated
USING (public.is_admin());

-- 5. Fix Insert Policy
DROP POLICY IF EXISTS "Users can insert their own tickets" ON public.support_tickets;
CREATE POLICY "Users can insert their own tickets"
ON public.support_tickets FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
