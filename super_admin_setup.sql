-- =====================================================
-- SÜPER ADMİN ROLÜ EKLEMESİ
-- =====================================================
-- Bu SQL'i Supabase SQL Editor'da çalıştırın.

-- 1. user_role ENUM tipine 'super_admin' değerini ekle
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'super_admin';

-- 2. is_admin() fonksiyonunu güncelle (super_admin de admin yetkisi alsın)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND (role = 'admin' OR role = 'super_admin')
  );
END;
$$;

-- 3. Grant execute permissions
GRANT EXECUTE ON FUNCTION public.is_admin TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin TO service_role;

-- 4. Hesabı super_admin yap
UPDATE public.profiles SET role = 'super_admin' WHERE email = 'kadarasopain9999@gmail.com';

-- 5. Verify
SELECT email, role FROM public.profiles WHERE email = 'kadarasopain9999@gmail.com';
