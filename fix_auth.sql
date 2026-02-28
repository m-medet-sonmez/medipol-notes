-- =====================================================
-- FIX: AUTOMATIC PROFILE CREATION TRIGGER
-- =====================================================

-- 1. Create a function that handles new user insertion
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    'student' -- Default role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the trigger on auth.users
-- Drop if exists to avoid errors on multiple runs
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. (Optional) Add INSERT policy just in case client needs it, 
-- but trigger is better.
CREATE POLICY "Users can insert own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- 4. Enable email confirmation bypass (optional/dev only)
-- Note: This usually requires dashboard settings, SQL might not work for project config.
-- But we can ensure RLS allows reads even if email not confirmed?
-- Supabase default is: auth.uid() works even if not confirmed, BUT
-- user might not be able to "Login" (signInWithPassword) if "Confirm Email" is ON.
-- We advise the user to check dashboard for that.
