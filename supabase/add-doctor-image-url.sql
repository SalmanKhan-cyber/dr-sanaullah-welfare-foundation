-- Add image_url column to doctors table
ALTER TABLE public.doctors
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Verify
SELECT id, name, specialization, image_url FROM public.doctors ORDER BY name;

