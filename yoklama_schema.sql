-- Create attendance_records table
CREATE TABLE IF NOT EXISTS public.attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    week_id INT REFERENCES public.weeks(week_number) ON DELETE SET NULL, -- Using week_number as FK if possible, or just INT
    course_name TEXT NOT NULL,
    status TEXT DEFAULT 'Katıldı',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, week_id, course_name)
);

-- Enable RLS
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

-- Policies
-- 1. Students can view ONLY their own records where they are marked 'Katıldı'
CREATE POLICY "Student visible attendance_records"
ON public.attendance_records FOR SELECT
TO authenticated
USING (user_id = auth.uid() AND status = 'Katıldı');

-- 2. Admins can do everything
CREATE POLICY "Admin full access attendance_records"
ON public.attendance_records FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);
