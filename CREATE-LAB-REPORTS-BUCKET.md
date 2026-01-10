# 🚨 IMPORTANT: Create Lab Reports Storage Bucket

The `lab-reports` storage bucket is missing in your Supabase project. You need to create it to enable file uploads and downloads for lab reports.

## Steps to Create the Bucket

### Option 1: Using Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project
   - Navigate to **Storage** in the left sidebar

2. **Create New Bucket**
   - Click **"New bucket"** or **"Create bucket"** button
   - **Bucket name:** `lab-reports` (exact name, lowercase with hyphen)
   - **Public bucket:** **No** (unchecked) - Keep it private for security
   - Click **"Create bucket"**

3. **Set Bucket Policies (Important)**
   - Go to **Storage** → **Policies** tab
   - Select `lab-reports` bucket
   - Click **"New Policy"**
   - Choose **"For full customization"** or use these SQL policies:

```sql
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
```

### Option 2: Using SQL (Alternative)

Run this in Supabase SQL Editor:

```sql
-- Create the lab-reports bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('lab-reports', 'lab-reports', false, 20971520, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/gif'])
ON CONFLICT (id) DO NOTHING;
```

## After Creating the Bucket

Once the bucket is created:
- ✅ Lab members can upload report files
- ✅ Admins can view/download reports
- ✅ Patients can access their reports
- ✅ All file access uses secure signed URLs

## Verify the Bucket Exists

1. Go to **Storage** in Supabase Dashboard
2. You should see `lab-reports` in the list of buckets
3. The bucket should show **Private** (not Public)

## Important Notes

- **Bucket name must be exact:** `lab-reports` (lowercase with hyphen)
- **Keep it private:** Don't make it public for security
- **File size limit:** Reports are limited to 20MB
- **Supported formats:** PDF, JPG, PNG, GIF

If you continue to see "Bucket not found" errors after creating the bucket, wait a few seconds and refresh the page.
