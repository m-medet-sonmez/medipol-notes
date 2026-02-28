-- 1. Create the new table for personal attendance tracking
CREATE TABLE IF NOT EXISTS public.student_personal_absences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    course_name TEXT NOT NULL,
    absence_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, course_name)
);

-- 2. Enable Row Level Security
ALTER TABLE public.student_personal_absences ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies for student_personal_absences
-- Students can manage their own trackers
CREATE POLICY "Students can manage own personal absences"
    ON public.student_personal_absences FOR ALL
    USING (user_id = auth.uid());

-- Admins and Super Admins can view and manage all trackers (optional, for admin oversight)
CREATE POLICY "Admins can view and manage all personal absences"
    ON public.student_personal_absences FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- 4. Clear old official attendance records as requested by the user
TRUNCATE TABLE public.attendance_records;
TRUNCATE TABLE public.attendance;
