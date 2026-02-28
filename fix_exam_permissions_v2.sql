-- Fix Exam Permissions: Allow both admin and super_admin
-- Run this in Supabase SQL Editor

-- 1. Drop existing admin-only policy
DROP POLICY IF EXISTS "Admin manage exams" ON public.exam_schedules;
DROP POLICY IF EXISTS "Admin full access" ON public.exam_schedules;

-- 2. Re-create with both admin and super_admin
CREATE POLICY "Admin manage exams"
ON public.exam_schedules FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'super_admin')
    )
);
