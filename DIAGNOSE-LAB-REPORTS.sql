-- Lab Reports Diagnostic Script
-- This script helps identify why lab report downloads are failing

-- Step 1: Check if lab-reports bucket exists and show details
SELECT 
  id, 
  name, 
  public, 
  file_size_limit, 
  allowed_mime_types,
  created_at
FROM storage.buckets 
WHERE id = 'lab-reports';

-- Step 2: Check lab_reports table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'lab_reports'
ORDER BY ordinal_position;

-- Step 3: Check recent lab_reports entries (last 10)
SELECT 
  id,
  patient_id,
  lab_id,
  file_url,
  test_paper_url,
  status,
  report_date,
  created_at
FROM lab_reports
ORDER BY created_at DESC
LIMIT 10;

-- Step 4: Check if there are any files in the storage bucket
SELECT 
  id,
  bucket_id,
  name,
  created_at,
  updated_at,
  last_accessed_at
FROM storage.objects
WHERE bucket_id = 'lab-reports'
ORDER BY created_at DESC
LIMIT 10;

-- Step 5: Check for any NULL or empty file URLs
SELECT 
  COUNT(*) as total_reports,
  COUNT(file_url) as reports_with_file_url,
  COUNT(test_paper_url) as reports_with_test_paper_url,
  COUNT(CASE WHEN file_url IS NULL OR file_url = '' THEN 1 END) as missing_file_url,
  COUNT(CASE WHEN test_paper_url IS NULL OR test_paper_url = '' THEN 1 END) as missing_test_paper_url
FROM lab_reports;

-- Step 6: Check lab_users table to verify lab associations
SELECT 
  lu.user_id,
  lu.lab_id,
  l.name as lab_name,
  u.email,
  u.role
FROM lab_users lu
JOIN labs l ON lu.lab_id = l.id
JOIN users u ON lu.user_id = u.id
LIMIT 5;
