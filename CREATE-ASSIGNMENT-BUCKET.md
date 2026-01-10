# Create Assignment Storage Bucket

The assignment feature requires a storage bucket in Supabase. Follow these steps to create it:

## Steps to Create the Bucket

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard/project/qudebdejubackprbarvc
   - Navigate to **Storage** in the left sidebar

2. **Create New Bucket**
   - Click **"New bucket"** or **"Create bucket"**
   - Bucket name: `course-assignments`
   - Public bucket: **No** (unchecked)
   - Click **"Create bucket"**

3. **Set Bucket Policies (Optional but Recommended)**
   - Go to **Storage** → **Policies** → Select `course-assignments` bucket
   - Add policies to allow authenticated users to upload/download

## Alternative: Create via SQL

You can also create the bucket using SQL in the Supabase SQL Editor:

```sql
-- Create the course-assignments bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-assignments', 'course-assignments', false)
ON CONFLICT (id) DO NOTHING;

-- Optional: Set up policies for authenticated users
-- (Adjust these policies based on your security requirements)
```

## After Creating the Bucket

Once the bucket is created, you can:
- Upload assignment files when creating assignments
- Files will be stored securely in Supabase Storage
- Students can download assignment files

## Note

If you create an assignment without the bucket, it will still be created but without a file attachment. You can add the file later by editing the assignment (if that feature is available) or by deleting and recreating the assignment after the bucket is set up.

