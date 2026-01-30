-- Create Lab Reports Storage Bucket
-- This script creates the missing lab-reports storage bucket for lab test reports

-- Create the lab-reports bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('lab-reports', 'lab-reports', false, 20971520, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Set up policies for the bucket
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

-- Allow service role (backend) full access
CREATE POLICY "Allow service role full access"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'lab-reports');

-- Verify bucket creation
SELECT * FROM storage.buckets WHERE id = 'lab-reports';
