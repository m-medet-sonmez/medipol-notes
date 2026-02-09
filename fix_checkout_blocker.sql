-- FIX CHECKOUT BLOCKER
-- This script fixes the missing column error that prevents you from entering the dashboard.

-- 1. Add missing 'start_date' column to subscriptions table
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ DEFAULT now();

-- 2. Ensure other columns exist (just to be safe)
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS plan TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMPTZ;

-- 3. Fix RLS for Subscriptions (Allow users to buy/insert their own subscription)
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert own subscription" ON public.subscriptions;
CREATE POLICY "Users can insert own subscription"
ON public.subscriptions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;
CREATE POLICY "Users can view own subscription"
ON public.subscriptions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own subscription" ON public.subscriptions;
CREATE POLICY "Users can update own subscription"
ON public.subscriptions FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- 4. Notify Supabase to reload schema
NOTIFY pgrst, 'reload config';
