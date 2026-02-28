-- Drop old policies to update them
DROP POLICY IF EXISTS "Admin full access attendance_records" ON public.attendance_records;
DROP POLICY IF EXISTS "Admins can manage attendance" ON public.attendance;

-- Create robust policy for super_admin and admin roles
CREATE POLICY "Admin full access attendance_records"
ON public.attendance_records FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
    )
);

-- Ensure students can view their own records without status restriction
DROP POLICY IF EXISTS "Student visible attendance_records" ON public.attendance_records;
DROP POLICY IF EXISTS "Student view own attendance_records" ON public.attendance_records;

CREATE POLICY "Student view own attendance_records"
ON public.attendance_records FOR SELECT
TO authenticated
USING (user_id = auth.uid());
