-- Create Exam Schedules Table
CREATE TABLE IF NOT EXISTS public.exam_schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID REFERENCES public.courses(id) NOT NULL,
    exam_title TEXT NOT NULL DEFAULT 'Final Sınavı',
    exam_date TIMESTAMPTZ,
    location TEXT,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(course_id) -- Only one active exam schedule per course for now (simplification)
);

-- Enable RLS
ALTER TABLE public.exam_schedules ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public read access for published exams"
ON public.exam_schedules FOR SELECT
TO authenticated
USING (true); -- Students can see all, logic in frontend can filter published

CREATE POLICY "Admin full access"
ON public.exam_schedules FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);

-- Grant permissions
GRANT SELECT ON public.exam_schedules TO authenticated;
GRANT ALL ON public.exam_schedules TO service_role;
