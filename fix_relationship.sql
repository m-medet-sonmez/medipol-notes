-- FIX RELATIONSHIP FOR PROFILES

-- 1. Ensure all users in support_tickets have a corresponding profile
-- This prevents the foreign key constraint from failing if a profile is missing
DO $$
BEGIN
    INSERT INTO public.profiles (id, email)
    SELECT u.id, u.email
    FROM auth.users u
    WHERE u.id IN (SELECT user_id FROM public.support_tickets)
    AND NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id);
END $$;

-- 2. Add explicit foreign key to public.profiles
-- This allows PostgREST to detect the relationship for: select('*, profiles(*)')
DO $$
BEGIN
    -- We try to add the constraint safely
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'support_tickets' 
        AND constraint_name = 'support_tickets_user_id_fkey_profiles'
    ) THEN
        ALTER TABLE public.support_tickets
        ADD CONSTRAINT support_tickets_user_id_fkey_profiles
        FOREIGN KEY (user_id) REFERENCES public.profiles(id)
        ON DELETE CASCADE;
    END IF;
END $$;

-- 3. Verify RLS (Safety Check)
-- Re-run the policy grant just to be sure
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.support_tickets TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
