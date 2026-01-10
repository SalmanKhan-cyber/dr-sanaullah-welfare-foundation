-- Create lab-reports storage bucket for lab test reports
-- Run this in Supabase SQL Editor

-- Create the bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'lab-reports',
  'lab-reports',
  false, -- Private bucket (not public)
  20971520, -- 20MB file size limit
  ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist (to allow re-running this script)
DROP POLICY IF EXISTS "Allow authenticated uploads to lab-reports" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated reads from lab-reports" ON storage.objects;
DROP POLICY IF EXISTS "Allow service role full access to lab-reports" ON storage.objects;

-- Create policies for the bucket
-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads to lab-reports"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'lab-reports');

-- Allow authenticated users to read files
CREATE POLICY "Allow authenticated reads from lab-reports"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'lab-reports');

-- Allow service role (backend) full access
CREATE POLICY "Allow service role full access to lab-reports"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'lab-reports')
WITH CHECK (bucket_id = 'lab-reports');

-- Verify bucket was created
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id = 'lab-reports';
