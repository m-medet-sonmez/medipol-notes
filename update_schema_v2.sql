-- Make week_id nullable to allow general updates/announcements
ALTER TABLE public.materials ALTER COLUMN week_id DROP NOT NULL;
