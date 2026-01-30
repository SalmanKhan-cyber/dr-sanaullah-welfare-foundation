-- Add image_url column to doctors table (if missing)
-- This script ensures the doctors table has the image_url column

ALTER TABLE public.doctors 
ADD COLUMN IF NOT EXISTS image_url text;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_doctors_image_url 
ON public.doctors(image_url);

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'doctors'
AND column_name = 'image_url';

-- Check if doctors table exists and show its structure
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'doctors'
ORDER BY ordinal_position;
