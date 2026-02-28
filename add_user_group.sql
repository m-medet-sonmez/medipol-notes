-- 1. Add columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS department TEXT DEFAULT 'Yönetim Bilişim Sistemleri',
ADD COLUMN IF NOT EXISTS student_group TEXT;

-- 2. Update existing profiles
UPDATE public.profiles 
SET department = 'Yönetim Bilişim Sistemleri' 
WHERE department IS NULL;

-- 3. Update the handle_new_user trigger function to include new fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, department, student_group)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    'student',
    COALESCE(NEW.raw_user_meta_data->>'department', 'Yönetim Bilişim Sistemleri'),
    NEW.raw_user_meta_data->>'student_group'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
