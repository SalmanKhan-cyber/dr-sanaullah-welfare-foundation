-- Add image_url column to teachers table
ALTER TABLE public.teachers
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Verify
SELECT user_id, specialization, image_url FROM public.teachers ORDER BY user_id;

