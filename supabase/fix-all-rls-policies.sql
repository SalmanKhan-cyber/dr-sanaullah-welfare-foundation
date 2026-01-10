-- Fix RLS policies for all tables
-- This disables RLS on tables that the backend manages
-- The backend uses service role and has its own RBAC middleware

-- Disable RLS on all application tables
ALTER TABLE IF EXISTS public.doctors DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.teachers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.students DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.course_materials DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.course_announcements DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.course_assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.assignment_submissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.pharmacy_inventory DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.labs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lab_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.test_bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.prescriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lab_reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.donations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.certificates DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.specialties DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.conditions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.surgery_categories DISABLE ROW LEVEL SECURITY;

-- Keep RLS enabled on users table but with permissive policies
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing restrictive policies on users
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;

-- Create permissive policies for users (backend handles auth)
CREATE POLICY "Allow all operations on users" ON public.users
  FOR ALL USING (true) WITH CHECK (true);

-- Verify tables exist and show counts
SELECT 
  'doctors' as table_name, 
  COUNT(*) as record_count 
FROM public.doctors
UNION ALL
SELECT 'teachers', COUNT(*) FROM public.teachers
UNION ALL
SELECT 'courses', COUNT(*) FROM public.courses
UNION ALL
SELECT 'students', COUNT(*) FROM public.students
UNION ALL
SELECT 'patients', COUNT(*) FROM public.patients
UNION ALL
SELECT 'users', COUNT(*) FROM public.users;

