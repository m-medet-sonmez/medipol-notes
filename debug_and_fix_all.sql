-- COMPREHENSIVE FIX FOR SUPPORT TICKETS & PERMISSIONS

-- 1. Ensure Table Structure is Identical to Expectations
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    subject TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    message TEXT NOT NULL,
    status TEXT DEFAULT 'open',
    priority TEXT DEFAULT 'normal',
    admin_reply TEXT,
    replied_by UUID REFERENCES auth.users(id),
    replied_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Explicitly Grant Privileges (Fixes 403 Forbidden errors for Authenticated role)
GRANT ALL ON public.support_tickets TO postgres;
GRANT ALL ON public.support_tickets TO service_role;
GRANT ALL ON public.support_tickets TO authenticated;

-- 3. Reset RLS Policies to be Simple and robust
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert their own tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can view their own tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Admins can update tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Admins can view all tickets" ON public.support_tickets;

-- Simple Insert Policy: If you are logged in, you can insert specific row if user_id matches
CREATE POLICY "Users can insert their own tickets"
ON public.support_tickets FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Simple Select Policy: You can see your own tickets OR if you are admin
-- Using the secure function created in previous fix
CREATE POLICY "Users can view tickets"
ON public.support_tickets FOR SELECT
TO authenticated
USING (
    auth.uid() = user_id 
    OR 
    public.is_admin()
);

-- Simple Update Policy: Only admins
CREATE POLICY "Admins can update tickets"
ON public.support_tickets FOR UPDATE
TO authenticated
USING (public.is_admin());

-- 4. INSERT TEST DATA (To verify DB is working)
-- We insert a dummy ticket linked to the FIRST user found in profiles.
DO $$
DECLARE
    first_user_id UUID;
BEGIN
    SELECT id INTO first_user_id FROM auth.users LIMIT 1;
    
    IF first_user_id IS NOT NULL THEN
        INSERT INTO public.support_tickets (user_id, subject, category, message, status)
        VALUES (first_user_id, 'Test Başlığı (SQL)', 'general', 'Bu mesaj doğrudan SQL ile eklenmiştir. Eğer bunu görüyorsanız Admin Paneli çalışıyor demektir.', 'open');
    END IF;
END $$;
