-- Add name and phone columns to patients table
-- Run this in Supabase SQL Editor

-- Add name column if it doesn't exist
ALTER TABLE public.patients 
ADD COLUMN IF NOT EXISTS name text;

-- Add phone column if it doesn't exist
ALTER TABLE public.patients 
ADD COLUMN IF NOT EXISTS phone text;

-- Optional: Update existing records to use name/phone from users table
-- Uncomment if you want to migrate existing data
/*
UPDATE public.patients p
SET 
    name = COALESCE(p.name, u.name),
    phone = COALESCE(p.phone, u.phone)
FROM public.users u
WHERE p.user_id = u.id
AND (p.name IS NULL OR p.phone IS NULL);
*/

