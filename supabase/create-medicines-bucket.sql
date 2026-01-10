-- Create medicines storage bucket for medicine images
-- Run this in Supabase SQL Editor

-- Create the bucket (public so images can be accessed directly)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'medicines',
  'medicines',
  true, -- Public bucket so images can be accessed directly
  5242880, -- 5MB file size limit
  ARRAY[
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist (to allow re-running this script)
DROP POLICY IF EXISTS "Allow public read access to medicines" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to medicines" ON storage.objects;
DROP POLICY IF EXISTS "Allow service role full access to medicines" ON storage.objects;

-- Create policies for the bucket
-- Allow public read access (since bucket is public)
CREATE POLICY "Allow public read access to medicines"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'medicines');

-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads to medicines"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'medicines');

-- Allow service role (backend) full access
CREATE POLICY "Allow service role full access to medicines"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'medicines')
WITH CHECK (bucket_id = 'medicines');

-- Verify bucket was created
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id = 'medicines';

