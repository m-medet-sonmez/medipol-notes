-- Bu komutu Supabase SQL Editöründe çalıştırarak
-- kadarasopain9999@gmail.com kullanıcısını Admin yapabilirsiniz.

UPDATE public.profiles
SET role = 'admin'
WHERE email = 'kadarasopain9999@gmail.com';

-- Kontrol etmek için:
SELECT * FROM public.profiles WHERE email = 'kadarasopain9999@gmail.com';
