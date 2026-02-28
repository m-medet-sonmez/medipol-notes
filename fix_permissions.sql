-- Comprehensive Fix for Permissions and Storage

-- 1. Ensure 'materials' bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('materials', 'materials', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Drop existing policies to avoid conflicts (clean slate for specific tables)
DROP POLICY IF EXISTS "Public Read Courses" ON public.courses;
DROP POLICY IF EXISTS "Public Read Weeks" ON public.weeks;
DROP POLICY IF EXISTS "Authenticated Uploads" ON storage.objects;
DROP POLICY IF EXISTS "Public Read Materials" ON storage.objects;

-- 3. Enable RLS on tables (good practice, but we need policies)
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;

-- 4. Create "Public Read" policies for Courses and Weeks (required for dropdowns and lists)
CREATE POLICY "Public Read Courses"
ON public.courses FOR SELECT
USING (true);

CREATE POLICY "Public Read Weeks"
ON public.weeks FOR SELECT
USING (true);

-- 5. Create "Public Read" policy for Materials Table (so students can see them)
CREATE POLICY "Public Read Materials Table"
ON public.materials FOR SELECT
USING (true);

-- 6. Grant Insert access to Materials Table for Authenticated Users
CREATE POLICY "Authenticated Insert Materials"
ON public.materials FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- 7. Storage Policies
-- Allow anyone to VIEW files in 'materials' bucket
CREATE POLICY "Public Read Materials Bucket"
ON storage.objects FOR SELECT
USING ( bucket_id = 'materials' );

-- Allow authenticated users to UPLOAD to 'materials' bucket
CREATE POLICY "Authenticated Upload Materials Bucket"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'materials' AND auth.role() = 'authenticated' );

-- 8. Fix 'week_id' constraint just in case
ALTER TABLE public.materials ALTER COLUMN week_id DROP NOT NULL;
