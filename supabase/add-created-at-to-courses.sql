-- Add created_at column to courses table
-- Run this in Supabase SQL Editor

ALTER TABLE public.courses
ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- Update existing courses to have a created_at timestamp if they don't have one
UPDATE public.courses
SET created_at = now()
WHERE created_at IS NULL;

-- Verify
SELECT id, title, created_at FROM public.courses ORDER BY created_at DESC;

