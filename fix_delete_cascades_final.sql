-- =========================================================================
-- COMPLETE AND BULLETPROOF FOREIGN KEY FIX FOR USER DELETION
-- Run this script in the Supabase SQL Editor.
-- It dynamically finds and replaces all conflicting foreign key constraints.
-- =========================================================================

DO $$ 
DECLARE 
    r RECORD;
BEGIN
    -- 1. SUPPORT TICKETS -> auth.users
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'support_tickets') THEN
        -- Drop all existing 'user_id' foreign keys
        FOR r IN SELECT tc.constraint_name FROM information_schema.table_constraints tc JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name WHERE tc.table_name = 'support_tickets' AND kcu.column_name = 'user_id' AND tc.constraint_type = 'FOREIGN KEY' LOOP
            EXECUTE 'ALTER TABLE public.support_tickets DROP CONSTRAINT ' || quote_ident(r.constraint_name);
        END LOOP;
        -- Re-add 'user_id' as CASCADE
        ALTER TABLE public.support_tickets ADD CONSTRAINT support_tickets_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

        -- Drop all existing 'replied_by' foreign keys
        FOR r IN SELECT tc.constraint_name FROM information_schema.table_constraints tc JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name WHERE tc.table_name = 'support_tickets' AND kcu.column_name = 'replied_by' AND tc.constraint_type = 'FOREIGN KEY' LOOP
            EXECUTE 'ALTER TABLE public.support_tickets DROP CONSTRAINT ' || quote_ident(r.constraint_name);
        END LOOP;
        -- Re-add 'replied_by' as SET NULL
        ALTER TABLE public.support_tickets ADD CONSTRAINT support_tickets_replied_by_fkey FOREIGN KEY (replied_by) REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;

    -- 2. COURSES -> profiles
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'courses') THEN
        FOR r IN SELECT tc.constraint_name FROM information_schema.table_constraints tc JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name WHERE tc.table_name = 'courses' AND kcu.column_name = 'created_by' AND tc.constraint_type = 'FOREIGN KEY' LOOP
            EXECUTE 'ALTER TABLE public.courses DROP CONSTRAINT ' || quote_ident(r.constraint_name);
        END LOOP;
        ALTER TABLE public.courses ADD CONSTRAINT courses_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;
    END IF;

    -- 3. MATERIALS -> profiles
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'materials') THEN
        FOR r IN SELECT tc.constraint_name FROM information_schema.table_constraints tc JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name WHERE tc.table_name = 'materials' AND kcu.column_name = 'uploaded_by' AND tc.constraint_type = 'FOREIGN KEY' LOOP
            EXECUTE 'ALTER TABLE public.materials DROP CONSTRAINT ' || quote_ident(r.constraint_name);
        END LOOP;
        ALTER TABLE public.materials ADD CONSTRAINT materials_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.profiles(id) ON DELETE SET NULL;
    END IF;

    -- 4. ESP TRUST REQUESTS -> profiles
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'esp_trust_requests') THEN
        -- Processed By (SET NULL)
        FOR r IN SELECT tc.constraint_name FROM information_schema.table_constraints tc JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name WHERE tc.table_name = 'esp_trust_requests' AND kcu.column_name = 'processed_by' AND tc.constraint_type = 'FOREIGN KEY' LOOP
            EXECUTE 'ALTER TABLE public.esp_trust_requests DROP CONSTRAINT ' || quote_ident(r.constraint_name);
        END LOOP;
        ALTER TABLE public.esp_trust_requests ADD CONSTRAINT esp_trust_requests_processed_by_fkey FOREIGN KEY (processed_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

        -- User ID (CASCADE)
        FOR r IN SELECT tc.constraint_name FROM information_schema.table_constraints tc JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name WHERE tc.table_name = 'esp_trust_requests' AND kcu.column_name = 'user_id' AND tc.constraint_type = 'FOREIGN KEY' LOOP
            EXECUTE 'ALTER TABLE public.esp_trust_requests DROP CONSTRAINT ' || quote_ident(r.constraint_name);
        END LOOP;
        ALTER TABLE public.esp_trust_requests ADD CONSTRAINT esp_trust_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;

    -- 5. ATTENDANCE -> profiles
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'attendance') THEN
        -- Recorded By (SET NULL)
        FOR r IN SELECT tc.constraint_name FROM information_schema.table_constraints tc JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name WHERE tc.table_name = 'attendance' AND kcu.column_name = 'recorded_by' AND tc.constraint_type = 'FOREIGN KEY' LOOP
            EXECUTE 'ALTER TABLE public.attendance DROP CONSTRAINT ' || quote_ident(r.constraint_name);
        END LOOP;
        ALTER TABLE public.attendance ADD CONSTRAINT attendance_recorded_by_fkey FOREIGN KEY (recorded_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

        -- User ID (CASCADE)
        FOR r IN SELECT tc.constraint_name FROM information_schema.table_constraints tc JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name WHERE tc.table_name = 'attendance' AND kcu.column_name = 'user_id' AND tc.constraint_type = 'FOREIGN KEY' LOOP
            EXECUTE 'ALTER TABLE public.attendance DROP CONSTRAINT ' || quote_ident(r.constraint_name);
        END LOOP;
        ALTER TABLE public.attendance ADD CONSTRAINT attendance_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;

    -- 6. EXAMS -> profiles
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'exams') THEN
        FOR r IN SELECT tc.constraint_name FROM information_schema.table_constraints tc JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name WHERE tc.table_name = 'exams' AND kcu.column_name = 'created_by' AND tc.constraint_type = 'FOREIGN KEY' LOOP
            EXECUTE 'ALTER TABLE public.exams DROP CONSTRAINT ' || quote_ident(r.constraint_name);
        END LOOP;
        ALTER TABLE public.exams ADD CONSTRAINT exams_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;
    END IF;

    -- 7. PAYMENT REQUESTS -> profiles
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'payment_requests') THEN
        FOR r IN SELECT tc.constraint_name FROM information_schema.table_constraints tc JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name WHERE tc.table_name = 'payment_requests' AND kcu.column_name = 'reviewed_by' AND tc.constraint_type = 'FOREIGN KEY' LOOP
            EXECUTE 'ALTER TABLE public.payment_requests DROP CONSTRAINT ' || quote_ident(r.constraint_name);
        END LOOP;
        ALTER TABLE public.payment_requests ADD CONSTRAINT payment_requests_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.profiles(id) ON DELETE SET NULL;
    END IF;

    -- 8. SUBSCRIPTIONS -> profiles
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'subscriptions') THEN
        FOR r IN SELECT tc.constraint_name FROM information_schema.table_constraints tc JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name WHERE tc.table_name = 'subscriptions' AND kcu.column_name = 'user_id' AND tc.constraint_type = 'FOREIGN KEY' LOOP
            EXECUTE 'ALTER TABLE public.subscriptions DROP CONSTRAINT ' || quote_ident(r.constraint_name);
        END LOOP;
        ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;

    -- 9. PAYMENT HISTORY -> profiles
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'payment_history') THEN
        FOR r IN SELECT tc.constraint_name FROM information_schema.table_constraints tc JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name WHERE tc.table_name = 'payment_history' AND kcu.column_name = 'user_id' AND tc.constraint_type = 'FOREIGN KEY' LOOP
            EXECUTE 'ALTER TABLE public.payment_history DROP CONSTRAINT ' || quote_ident(r.constraint_name);
        END LOOP;
        ALTER TABLE public.payment_history ADD CONSTRAINT payment_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;

    -- 10. NOTIFICATIONS -> profiles
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'notifications') THEN
        FOR r IN SELECT tc.constraint_name FROM information_schema.table_constraints tc JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name WHERE tc.table_name = 'notifications' AND kcu.column_name = 'user_id' AND tc.constraint_type = 'FOREIGN KEY' LOOP
            EXECUTE 'ALTER TABLE public.notifications DROP CONSTRAINT ' || quote_ident(r.constraint_name);
        END LOOP;
        ALTER TABLE public.notifications ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;

END $$;
