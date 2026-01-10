-- Add test_paper_url column to lab_reports table
-- This column stores the URL/path to the test paper file uploaded when assigning a test
-- Run this in Supabase SQL Editor

-- Add test_paper_url column if it doesn't exist
ALTER TABLE public.lab_reports 
ADD COLUMN IF NOT EXISTS test_paper_url text;

-- Add a comment to document the column
COMMENT ON COLUMN public.lab_reports.test_paper_url IS 'URL/path to the test paper file uploaded when assigning a test to a lab';

