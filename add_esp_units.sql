-- Profiles tablosuna tamamlanan ESP ünitelerini tutacak column ekle
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS completed_esp_units text[] DEFAULT '{}';

-- Güvenlik için adminin bu kolonu güncellemesine izin verin (zaten admin policy'si genel update yetkisi veriyor ama kontrol edelim)
-- Mevcut policy: "Admins can view all profiles"
-- Mevcut policy: "Users can update own profile"

-- Adminlerin profilleri güncellemesi için policy ekleyelim (eğer yoksa)
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE USING (is_admin());
