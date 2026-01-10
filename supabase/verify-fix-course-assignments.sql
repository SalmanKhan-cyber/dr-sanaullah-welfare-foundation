-- Verify and Fix Course Assignments to Teachers
-- Run this in Supabase SQL Editor to check course assignments

-- ============================================
-- 1. CHECK ALL COURSES AND THEIR TRAINER IDs
-- ============================================
SELECT 
    c.id as course_id,
    c.title,
    c.trainer_id,
    u.name as teacher_name,
    u.email as teacher_email,
    u.id as teacher_user_id
FROM public.courses c
LEFT JOIN public.users u ON c.trainer_id = u.id
ORDER BY c.title;

-- ============================================
-- 2. CHECK ALL TEACHERS
-- ============================================
SELECT 
    u.id as user_id,
    u.name,
    u.email,
    u.role,
    t.specialization
FROM public.users u
LEFT JOIN public.teachers t ON u.id = t.user_id
WHERE u.role = 'teacher'
ORDER BY u.name;

-- ============================================
-- 3. FIND COURSES WITH TRAINER_ID BUT NO MATCHING TEACHER
-- ============================================
SELECT 
    c.id,
    c.title,
    c.trainer_id,
    'No matching teacher found' as issue
FROM public.courses c
WHERE c.trainer_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.users u WHERE u.id = c.trainer_id
  );

-- ============================================
-- 4. FIND TEACHERS WITH NO ASSIGNED COURSES
-- ============================================
SELECT 
    u.id,
    u.name,
    u.email,
    'No courses assigned' as issue
FROM public.users u
WHERE u.role = 'teacher'
  AND NOT EXISTS (
    SELECT 1 FROM public.courses c WHERE c.trainer_id = u.id
  );

-- ============================================
-- 5. MANUAL FIX: Assign a course to a teacher
-- ============================================
-- Replace 'COURSE_ID_HERE' with the actual course ID
-- Replace 'TEACHER_USER_ID_HERE' with the actual teacher's user ID
-- 
-- UPDATE public.courses 
-- SET trainer_id = 'TEACHER_USER_ID_HERE'
-- WHERE id = 'COURSE_ID_HERE';

-- ============================================
-- 6. EXAMPLE: Assign course to teacher by email
-- ============================================
-- Replace 'teacher@example.com' with the teacher's email
-- Replace 'Course Title' with the course title
--
-- UPDATE public.courses c
-- SET trainer_id = u.id
-- FROM public.users u
-- WHERE u.email = 'teacher@example.com'
--   AND u.role = 'teacher'
--   AND c.title = 'Course Title';

-- ============================================
-- 7. VERIFY AFTER FIX
-- ============================================
-- Run query #1 again to verify assignments

