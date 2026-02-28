-- Fix support_tickets foreign keys for PostgREST
-- Run this in Supabase SQL Editor

DO $$ 
DECLARE 
    r RECORD;
BEGIN
    -- 1. Drop existing user_id foreign keys from support_tickets
    FOR r IN SELECT tc.constraint_name FROM information_schema.table_constraints tc JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name WHERE tc.table_name = 'support_tickets' AND kcu.column_name = 'user_id' AND tc.constraint_type = 'FOREIGN KEY' LOOP
        EXECUTE 'ALTER TABLE public.support_tickets DROP CONSTRAINT ' || quote_ident(r.constraint_name);
    END LOOP;
    
    -- Re-add user_id to point to public.profiles instead of auth.users
    ALTER TABLE public.support_tickets ADD CONSTRAINT support_tickets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

    -- 2. Drop existing replied_by foreign keys from support_tickets
    FOR r IN SELECT tc.constraint_name FROM information_schema.table_constraints tc JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name WHERE tc.table_name = 'support_tickets' AND kcu.column_name = 'replied_by' AND tc.constraint_type = 'FOREIGN KEY' LOOP
        EXECUTE 'ALTER TABLE public.support_tickets DROP CONSTRAINT ' || quote_ident(r.constraint_name);
    END LOOP;
    
    -- Re-add replied_by to point to public.profiles instead of auth.users
    ALTER TABLE public.support_tickets ADD CONSTRAINT support_tickets_replied_by_fkey FOREIGN KEY (replied_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

END $$;
