-- Seed Dummy ESP Data for Testing
-- This script adds a fake ESP request so you can see the Admin Panel interface.

-- 1. Insert a Fake Request (if not exists)
-- We need a valid user_id. We'll try to use the first available admin or user.
-- IF YOU GET AN ERROR, replace 'auth.uid()' with a real UUID from your 'profiles' table.

DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Try to get the first user from profiles
  SELECT id INTO v_user_id FROM public.profiles LIMIT 1;

  IF v_user_id IS NOT NULL THEN
    -- Insert Request
    INSERT INTO public.esp_requests (user_id, esp_email, esp_password, status)
    VALUES (v_user_id, 'test_student@medipol.edu.tr', 'TestPass123', 'pending')
    ON CONFLICT (user_id) DO UPDATE 
    SET status = 'pending', esp_password = 'TestPass123';
    
    -- Insert some Units for this request
    INSERT INTO public.esp_units (request_id, unit_name, is_completed, admin_note)
    SELECT id, 'Unit 1', true, '95 Score'
    FROM public.esp_requests WHERE user_id = v_user_id;

    INSERT INTO public.esp_units (request_id, unit_name, is_completed, admin_note)
    SELECT id, 'Unit 2', false, 'Needs work'
    FROM public.esp_requests WHERE user_id = v_user_id;
    
  END IF;
END $$;
