-- Update Exam Schedules Schema
-- 1. Remove strict constraint on course_id (allow manual entry)
ALTER TABLE public.exam_schedules ALTER COLUMN course_id DROP NOT NULL;

-- 2. Add course_name (Text for manual input)
ALTER TABLE public.exam_schedules ADD COLUMN IF NOT EXISTS course_name TEXT;

-- 3. Add exam_type (Vize / Final / Bütünleme)
ALTER TABLE public.exam_schedules ADD COLUMN IF NOT EXISTS exam_type TEXT DEFAULT 'final';

-- 4. Drop unique constraint (Because multiple exams for same course can exist now - e.g. Midterm AND Final)
ALTER TABLE public.exam_schedules DROP CONSTRAINT IF EXISTS exam_schedules_course_id_key;

-- 5. Backfill course_name from existing courses if any
UPDATE public.exam_schedules es
SET course_name = c.course_name
FROM public.courses c
WHERE es.course_id = c.id
AND es.course_name IS NULL;
