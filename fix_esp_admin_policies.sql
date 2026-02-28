-- Update ESP Requests policies to include super_admin for UPDATE and SELECT

-- Drop existing admin policies for esp_requests
DROP POLICY IF EXISTS "Admins can view all esp requests" ON public.esp_requests;
DROP POLICY IF EXISTS "Admins can update all esp requests" ON public.esp_requests;

-- Recreate SELECT policy for admins and super_admins
CREATE POLICY "Admins can view all esp requests" ON public.esp_requests
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- Recreate UPDATE policy for admins and super_admins
CREATE POLICY "Admins can update all esp requests" ON public.esp_requests
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- Also update esp_units policy to allow super_admin management
DROP POLICY IF EXISTS "Admins can manage esp units" ON public.esp_units;

CREATE POLICY "Admins can manage esp units" ON public.esp_units
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );
