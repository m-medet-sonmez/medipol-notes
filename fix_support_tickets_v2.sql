-- 1. Create is_admin function to safely check role without RLS recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  -- Security Definer allows this function to run with privileges of the creator (bypass RLS)
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create Support Tickets Table if not exists
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    subject TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    message TEXT NOT NULL,
    status TEXT DEFAULT 'open', -- open, in_progress, resolved, closed
    priority TEXT DEFAULT 'normal', -- normal, urgent
    admin_reply TEXT,
    replied_by UUID REFERENCES auth.users(id),
    replied_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure message column exists (in case it was missing)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'support_tickets' AND column_name = 'message') THEN
        ALTER TABLE public.support_tickets ADD COLUMN message TEXT NOT NULL DEFAULT '';
    END IF;
END $$;

-- 3. Enable RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- 4. Clean up old policies
DROP POLICY IF EXISTS "Users can insert their own tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users can view their own tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Admins can view all tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Admins can update tickets" ON public.support_tickets;

-- 5. Define New Policies using is_admin()

-- Insert: Certified users can insert tickets
CREATE POLICY "Users can insert their own tickets"
ON public.support_tickets FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Select: Users can view their own tickets OR Admins can view all
CREATE POLICY "Users can view their own tickets"
ON public.support_tickets FOR SELECT
TO authenticated
USING (
    auth.uid() = user_id 
    OR 
    public.is_admin()
);

-- Update: Admins can update tickets
CREATE POLICY "Admins can update tickets"
ON public.support_tickets FOR UPDATE
TO authenticated
USING (
    public.is_admin()
);

-- 6. Fix Profiles Policy (Break the infinite recursion)
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;

CREATE POLICY "Admins can read all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (
    auth.uid() = id
    OR
    public.is_admin()
);
