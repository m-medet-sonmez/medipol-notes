-- =====================================================
-- ÖDEME TALEBİ (Payment Requests) TABLOSU - v3
-- =====================================================
-- Bu SQL'i Supabase SQL Editor'da çalıştırın.

-- 1. Tabloyu sil (varsa)
DROP TABLE IF EXISTS public.payment_requests CASCADE;

-- 2. Tabloyu oluştur
CREATE TABLE public.payment_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL,
  admin_notes TEXT,
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Indexes
CREATE INDEX idx_payment_requests_user ON public.payment_requests(user_id);
CREATE INDEX idx_payment_requests_status ON public.payment_requests(status);

-- 4. RLS
ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar kendi taleplerini görebilir
CREATE POLICY "Users can view own payment requests"
  ON public.payment_requests FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Kullanıcılar talep oluşturabilir
CREATE POLICY "Users can create payment requests"
  ON public.payment_requests FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Adminler tüm talepleri görebilir
CREATE POLICY "Admins can view all payment requests"
  ON public.payment_requests FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Adminler talepleri güncelleyebilir (onay/red)
CREATE POLICY "Admins can update payment requests"
  ON public.payment_requests FOR UPDATE
  TO authenticated
  USING (public.is_admin());

-- 5. Realtime'ı aç (opsiyonel)
ALTER PUBLICATION supabase_realtime ADD TABLE public.payment_requests;

-- 6. Verify
SELECT 'payment_requests tablosu başarıyla oluşturuldu!' as sonuc;
SELECT COUNT(*) as toplam_policy FROM pg_policies WHERE tablename = 'payment_requests';
