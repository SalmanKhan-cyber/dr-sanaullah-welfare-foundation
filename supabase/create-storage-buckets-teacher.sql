-- Create storage buckets for teacher features
-- Run this in Supabase SQL Editor or via Dashboard

-- Note: Storage buckets must be created via Supabase Dashboard > Storage
-- This SQL file is for reference only

-- Required buckets:
-- 1. course-materials (private)
--    - Purpose: Store course materials (PDFs, videos, documents)
--    - Access: Private, signed URLs only
--    - Path structure: course-materials/{courseId}/{timestamp}-{filename}

-- 2. course-assignments (private)
--    - Purpose: Store assignment files uploaded by teachers
--    - Access: Private, signed URLs only
--    - Path structure: course-assignments/{courseId}/{timestamp}-{filename}

-- To create buckets manually:
-- 1. Go to Supabase Dashboard > Storage
-- 2. Click "New bucket"
-- 3. Name: course-materials
-- 4. Public: No (unchecked)
-- 5. Click "Create bucket"
-- 6. Repeat for course-assignments

-- Storage policies will be handled by RLS on the database tables

