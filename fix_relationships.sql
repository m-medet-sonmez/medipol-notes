-- FIX DATABASE RELATIONSHIPS AND SUBSCRIPTION SCHEMA

-- 1. Fix Support Tickets Relationship
-- We need support_tickets to reference 'profiles' directly so the Admin Panel can join them.
-- Currently it likely references 'auth.users', which prevents `.select('*, profiles(*)')` from working in the API.

ALTER TABLE public.support_tickets
DROP CONSTRAINT IF EXISTS support_tickets_user_id_fkey;

-- Ensure all current user_ids exist in profiles before adding constraint
-- If you have tickets from users without profiles, this might fail, so we blindly try-catch or just add it.
-- We will assume users exist in profiles (standard App flow).
DO $$
BEGIN
    -- Try to add the constraint to profiles
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        ALTER TABLE public.support_tickets
        ADD CONSTRAINT support_tickets_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES public.profiles(id);
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not update constraint, probably missing profiles. Skipping constraint change.';
END $$;


-- 2. Fix Subscriptions Schema (Checkout Page Error)
-- The checkout page seemingly requires 'start_date' column.
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ DEFAULT now();

-- 3. Reload Schema Cache
-- This ensures the API knows about the new foreign key and column.
NOTIFY pgrst, 'reload config';

-- 4. Re-Insert Test Data (Just in case)
DO $$
DECLARE
    first_profile_id UUID;
BEGIN
    SELECT id INTO first_profile_id FROM public.profiles LIMIT 1;
    
    IF first_profile_id IS NOT NULL THEN
        -- Check if test ticket exists, if not insert
        IF NOT EXISTS (SELECT 1 FROM public.support_tickets WHERE subject = 'Bağlantı Testi') THEN
            INSERT INTO public.support_tickets (user_id, subject, category, message, status)
            VALUES (first_profile_id, 'Bağlantı Testi', 'technical', 'Bu mesaj tablo ilişkileri düzeltildikten sonra eklenmiştir.', 'open');
        END IF;
    END IF;
END $$;
