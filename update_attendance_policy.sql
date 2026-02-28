-- Drop the restrictive policy
DROP POLICY IF EXISTS "Student visible attendance_records" ON public.attendance_records;

-- Create a new permissive policy for viewing own records (regardless of status)
CREATE POLICY "Student view own attendance_records"
ON public.attendance_records FOR SELECT
TO authenticated
USING (user_id = auth.uid());
