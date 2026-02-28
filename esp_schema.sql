-- ESP Trust System Schema

-- 1. Create ESP Requests Table
-- Stores student login credentials for ESP system
CREATE TABLE public.esp_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  esp_email TEXT NOT NULL,
  esp_password TEXT NOT NULL, -- Stored as requested for admin visibility
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id) -- One active request per user
);

-- 2. Create ESP Units Table
-- Stores progress for each unit (Unit 1 - Unit 10, etc.)
CREATE TABLE public.esp_units (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID REFERENCES public.esp_requests(id) ON DELETE CASCADE NOT NULL,
  unit_name TEXT NOT NULL, -- e.g., 'Unit 1'
  is_completed BOOLEAN DEFAULT false,
  admin_note TEXT, -- e.g., 'Score: 85'
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(request_id, unit_name)
);

-- 3. RLS Policies

-- Enable RLS
ALTER TABLE public.esp_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.esp_units ENABLE ROW LEVEL SECURITY;

-- ESP Requests Policies
-- Users can view/insert their own request
CREATE POLICY "Users can view own esp request" ON public.esp_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own esp request" ON public.esp_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can view/update all requests
CREATE POLICY "Admins can view all esp requests" ON public.esp_requests
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update all esp requests" ON public.esp_requests
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ESP Units Policies
-- Users can view their own units (via request_id)
CREATE POLICY "Users can view own esp units" ON public.esp_units
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.esp_requests WHERE id = request_id AND user_id = auth.uid())
  );

-- Admins can view/insert/update all units
CREATE POLICY "Admins can manage esp units" ON public.esp_units
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 4. Grant Permissions (just in case)
GRANT ALL ON public.esp_requests TO authenticated;
GRANT ALL ON public.esp_units TO authenticated;
