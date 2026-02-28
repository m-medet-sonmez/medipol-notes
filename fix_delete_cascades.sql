-- Fix Foreign Key Constraints for User Deletion Safely
-- Run this in Supabase SQL Editor

DO $$
BEGIN
    -- 1. Support Tickets
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'support_tickets') THEN
        ALTER TABLE public.support_tickets DROP CONSTRAINT IF EXISTS support_tickets_user_id_fkey;
        ALTER TABLE public.support_tickets ADD CONSTRAINT support_tickets_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
        
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'support_tickets' AND column_name = 'replied_by') THEN
            ALTER TABLE public.support_tickets DROP CONSTRAINT IF EXISTS support_tickets_replied_by_fkey;
            ALTER TABLE public.support_tickets ADD CONSTRAINT support_tickets_replied_by_fkey FOREIGN KEY (replied_by) REFERENCES auth.users(id) ON DELETE SET NULL;
        END IF;
    END IF;

    -- 2. Courses
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'courses' AND column_name = 'created_by') THEN
        ALTER TABLE public.courses DROP CONSTRAINT IF EXISTS courses_created_by_fkey;
        ALTER TABLE public.courses ADD CONSTRAINT courses_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;
    END IF;

    -- 3. Materials
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'materials' AND column_name = 'uploaded_by') THEN
        ALTER TABLE public.materials DROP CONSTRAINT IF EXISTS materials_uploaded_by_fkey;
        ALTER TABLE public.materials ADD CONSTRAINT materials_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.profiles(id) ON DELETE SET NULL;
    END IF;

    -- 4. ESP Trust Requests
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'esp_trust_requests' AND column_name = 'processed_by') THEN
        ALTER TABLE public.esp_trust_requests DROP CONSTRAINT IF EXISTS esp_trust_requests_processed_by_fkey;
        ALTER TABLE public.esp_trust_requests ADD CONSTRAINT esp_trust_requests_processed_by_fkey FOREIGN KEY (processed_by) REFERENCES public.profiles(id) ON DELETE SET NULL;
    END IF;

    -- 5. Attendance
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'attendance' AND column_name = 'recorded_by') THEN
        ALTER TABLE public.attendance DROP CONSTRAINT IF EXISTS attendance_recorded_by_fkey;
        ALTER TABLE public.attendance ADD CONSTRAINT attendance_recorded_by_fkey FOREIGN KEY (recorded_by) REFERENCES public.profiles(id) ON DELETE SET NULL;
    END IF;

    -- 6. Exams
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'exams' AND column_name = 'created_by') THEN
        ALTER TABLE public.exams DROP CONSTRAINT IF EXISTS exams_created_by_fkey;
        ALTER TABLE public.exams ADD CONSTRAINT exams_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;
    END IF;

    -- 7. Payment Requests
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'payment_requests' AND column_name = 'reviewed_by') THEN
        ALTER TABLE public.payment_requests DROP CONSTRAINT IF EXISTS payment_requests_reviewed_by_fkey;
        ALTER TABLE public.payment_requests ADD CONSTRAINT payment_requests_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.profiles(id) ON DELETE SET NULL;
    END IF;
END $$;

