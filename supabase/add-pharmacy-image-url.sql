-- Add image_url column to pharmacy_inventory table
ALTER TABLE public.pharmacy_inventory
ADD COLUMN IF NOT EXISTS image_url TEXT;

