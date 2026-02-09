-- Fix Permissions and RLS for Exam Schedules

-- 1. Ensure RLS is enabled
ALTER TABLE public.exam_schedules ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public read access for published exams" ON public.exam_schedules;
DROP POLICY IF EXISTS "Admin full access" ON public.exam_schedules;

-- 3. Re-create Student Read Policy (Explicitly allow reading all, filtering is done in app, but we can restrict if needed)
CREATE POLICY "Student visible exams"
ON public.exam_schedules FOR SELECT
TO authenticated
USING (true);

-- 4. Re-create Admin Policy
CREATE POLICY "Admin manage exams"
ON public.exam_schedules FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);

-- 5. Grant Permissions (Crucial if missing)
GRANT SELECT ON public.exam_schedules TO authenticated;
GRANT ALL ON public.exam_schedules TO service_role;
