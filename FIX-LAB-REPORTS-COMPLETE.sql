-- Comprehensive Lab Reports Storage Fix
-- This script creates the bucket and handles all potential issues

-- Step 1: Create the lab-reports bucket with explicit settings
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('lab-reports', 'lab-reports', false, 20971520, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 20971520,
  allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

-- Step 2: Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated reads" ON storage.objects;
DROP POLICY IF EXISTS "Allow service role full access" ON storage.objects;

-- Step 3: Create new policies with proper permissions
-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'lab-reports');

-- Allow authenticated users to read files
CREATE POLICY "Allow authenticated reads"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'lab-reports');

-- Allow service role (backend) full access - MOST IMPORTANT
CREATE POLICY "Allow service role full access"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'lab-reports')
WITH CHECK (bucket_id = 'lab-reports');

-- Step 4: Grant necessary permissions
GRANT ALL ON SCHEMA storage TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA storage TO service_role;

-- Step 5: Verify bucket exists and show details
SELECT 
  id, 
  name, 
  public, 
  file_size_limit, 
  allowed_mime_types,
  created_at
FROM storage.buckets 
WHERE id = 'lab-reports';

-- Step 6: Test bucket access (should return no errors)
SELECT COUNT(*) as policy_count 
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND (policyname LIKE '%lab-reports%' OR policyname LIKE '%service_role%');
