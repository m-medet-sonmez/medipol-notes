-- =====================================================
-- 1. KULLANICI PROFİLLERİ VE YETKİLENDİRME
-- =====================================================

-- Kullanıcı rolleri enum
CREATE TYPE user_role AS ENUM ('student', 'admin');

-- Abonelik planları enum
CREATE TYPE subscription_plan AS ENUM ('weekly', 'monthly', 'semester');

-- ESP Trust durum enum
CREATE TYPE esp_status AS ENUM ('pending', 'processing', 'completed', 'failed');

-- Destek talebi durum enum
CREATE TYPE support_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');

-- Kullanıcı profilleri
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role user_role DEFAULT 'student' NOT NULL,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. ABONELİK YÖNETİMİ
-- =====================================================

-- Abonelik bilgileri
CREATE TABLE public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  plan subscription_plan NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  
  -- Tarih bilgileri
  subscription_start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  subscription_end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Erişim kontrol
  allowed_weeks TEXT[] DEFAULT '{}', -- Week ID'leri (UUID array)
  has_esp_access BOOLEAN DEFAULT false,
  
  -- Ödeme bilgileri
  shopier_transaction_id TEXT,
  shopier_payment_status TEXT,
  
  -- Durum
  is_active BOOLEAN DEFAULT true,
  auto_renew BOOLEAN DEFAULT false,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ödeme geçmişi
CREATE TABLE public.payment_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  
  amount DECIMAL(10, 2) NOT NULL,
  plan subscription_plan NOT NULL,
  
  -- Shopier bilgileri
  shopier_transaction_id TEXT UNIQUE,
  shopier_order_id TEXT,
  shopier_status TEXT,
  
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. DERS VE İÇERİK YÖNETİMİ
-- =====================================================

-- Dersler
CREATE TABLE public.courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_code TEXT UNIQUE NOT NULL, -- Örn: MAT101
  course_name TEXT NOT NULL, -- Örn: Matematik 1
  description TEXT,
  instructor_name TEXT,
  
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Haftalar (Tarih bazlı)
CREATE TABLE public.weeks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  week_number INTEGER NOT NULL, -- 1, 2, 3, 4...
  week_name TEXT, -- "1. Hafta - Giriş", "2. Hafta - Türev"
  
  -- Tarih aralığı
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  
  -- Ayı belirtmek için
  month INTEGER NOT NULL, -- 1-12
  year INTEGER NOT NULL,
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint: Aynı tarih aralığı tekrar edilemez
  UNIQUE(start_date, end_date)
);

-- Haftalık içerikler
CREATE TABLE public.materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  week_id UUID REFERENCES public.weeks(id) ON DELETE CASCADE NOT NULL,
  
  title TEXT NOT NULL, -- "1. Hafta Matematik Notları"
  description TEXT,
  
  -- Dosya yolları (Supabase Storage)
  pdf_file_path TEXT, -- storage/materials/mat101/week1.pdf
  pdf_file_size BIGINT, -- Bytes
  
  audio_file_path TEXT, -- storage/materials/mat101/week1.mp3
  audio_file_size BIGINT, -- Bytes
  audio_duration INTEGER, -- Saniye cinsinden
  
  -- Yükleyen admin
  uploaded_by UUID REFERENCES public.profiles(id),
  
  is_active BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique: Bir dersin bir haftasında sadece bir materyal
  UNIQUE(course_id, week_id)
);

-- =====================================================
-- 4. ESP TRUST SERVİSİ
-- =====================================================

-- ESP Trust talepleri
CREATE TABLE public.esp_trust_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Kullanıcının girdiği bilgiler
  esp_email TEXT NOT NULL,
  esp_password TEXT NOT NULL, -- Plain text (güvenlik kritik değil)
  
  -- Durum takibi
  status esp_status DEFAULT 'pending',
  admin_notes TEXT, -- Admin'in notları
  processed_by UUID REFERENCES public.profiles(id), -- İşlemi yapan admin
  processed_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. YOKLAMA SİSTEMİ
-- =====================================================

-- Yoklama kayıtları
CREATE TABLE public.attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  week_id UUID REFERENCES public.weeks(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  
  -- Yoklama durumu
  status TEXT NOT NULL, -- "Katıldı", "Katılmadı", "İzinli", "Mazeret"
  notes TEXT, -- Ekstra bilgiler
  
  -- Admin tarafından girilir
  recorded_by UUID REFERENCES public.profiles(id),
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique: Bir öğrencinin bir haftadaki bir dersten sadece bir yoklama kaydı
  UNIQUE(user_id, week_id, course_id)
);

-- =====================================================
-- 6. SINAV TAKVİMİ
-- =====================================================

-- Sınav ve duyurular
CREATE TABLE public.exams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  
  title TEXT NOT NULL, -- "Vize Sınavı", "Final Sınavı"
  description TEXT,
  exam_type TEXT, -- "vize", "final", "quiz", "proje"
  
  -- Tarih ve yer
  exam_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT, -- "A Blok 204"
  duration INTEGER, -- Dakika cinsinden
  
  -- Bildirim
  notify_students BOOLEAN DEFAULT true,
  
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 7. DESTEK VE SORU-CEVAP
-- =====================================================

-- Destek talepleri
CREATE TABLE public.support_tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT, -- "Teknik", "İçerik", "Ödeme", "Genel"
  
  status support_status DEFAULT 'open',
  priority TEXT DEFAULT 'normal', -- "low", "normal", "high", "urgent"
  
  -- Admin yanıtı
  admin_reply TEXT,
  replied_by UUID REFERENCES public.profiles(id),
  replied_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 8. BİLDİRİMLER
-- =====================================================

-- Bildirimler
CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL, -- "material", "attendance", "esp", "exam", "support"
  
  -- Link (tıklanınca nereye gidecek)
  action_url TEXT,
  
  -- Okundu bilgisi
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 9. İNDEKSLER (Performans için)
-- =====================================================

CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_active ON public.subscriptions(is_active);
CREATE INDEX idx_subscriptions_end_date ON public.subscriptions(subscription_end_date);
CREATE INDEX idx_materials_course_week ON public.materials(course_id, week_id);
CREATE INDEX idx_materials_active ON public.materials(is_active);
CREATE INDEX idx_weeks_date_range ON public.weeks(start_date, end_date);
CREATE INDEX idx_weeks_month_year ON public.weeks(month, year);
CREATE INDEX idx_attendance_user_week ON public.attendance(user_id, week_id);
CREATE INDEX idx_attendance_course ON public.attendance(course_id);
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON public.notifications(created_at DESC);
CREATE INDEX idx_esp_status ON public.esp_trust_requests(status);
CREATE INDEX idx_esp_user ON public.esp_trust_requests(user_id);
CREATE INDEX idx_support_status ON public.support_tickets(status);
CREATE INDEX idx_support_user ON public.support_tickets(user_id);

-- =====================================================
-- 10. TRIGGER'LAR ve FONKSİYONLAR
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON public.materials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_esp_updated_at BEFORE UPDATE ON public.esp_trust_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_updated_at BEFORE UPDATE ON public.support_tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exams_updated_at BEFORE UPDATE ON public.exams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Download Count Helper
CREATE OR REPLACE FUNCTION increment_download_count(material_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.materials
  SET download_count = download_count + 1
  WHERE id = material_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- View Count Helper
CREATE OR REPLACE FUNCTION increment_view_count(material_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.materials
  SET view_count = view_count + 1
  WHERE id = material_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 11. ROW LEVEL SECURITY (RLS) POLİTİKALARI
-- =====================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.esp_trust_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Helper function to check admin role
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (is_admin());

-- Subscriptions Policies
CREATE POLICY "Users can view own subscription" ON public.subscriptions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can view all subscriptions" ON public.subscriptions FOR SELECT USING (is_admin());
CREATE POLICY "Admins can manage subscriptions" ON public.subscriptions FOR ALL USING (is_admin());

-- Materials Policies
CREATE POLICY "Users can view active materials" ON public.materials FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage materials" ON public.materials FOR ALL USING (is_admin());

-- ESP Trust Policies
CREATE POLICY "Users can view own esp requests" ON public.esp_trust_requests FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create esp requests" ON public.esp_trust_requests FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can view all esp requests" ON public.esp_trust_requests FOR SELECT USING (is_admin());
CREATE POLICY "Admins can update esp requests" ON public.esp_trust_requests FOR UPDATE USING (is_admin());

-- Attendance Policies
CREATE POLICY "Users can view own attendance" ON public.attendance FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can manage attendance" ON public.attendance FOR ALL USING (is_admin());

-- Exams Policies
CREATE POLICY "Users can view active exams" ON public.exams FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage exams" ON public.exams FOR ALL USING (is_admin());

-- Support Tickets Policies
CREATE POLICY "Users can view own tickets" ON public.support_tickets FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create tickets" ON public.support_tickets FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can view all tickets" ON public.support_tickets FOR SELECT USING (is_admin());
CREATE POLICY "Admins can manage tickets" ON public.support_tickets FOR UPDATE USING (is_admin());

-- Notifications Policies
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (user_id = auth.uid());

-- Weeks ve Courses herkese açık (okuma)
CREATE POLICY "Everyone can view weeks" ON public.weeks FOR SELECT USING (true);
CREATE POLICY "Everyone can view courses" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Admins can manage weeks" ON public.weeks FOR ALL USING (is_admin());
CREATE POLICY "Admins can manage courses" ON public.courses FOR ALL USING (is_admin());
