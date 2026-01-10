-- Check and Fix Course Assignments
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. CHECK ALL COURSES AND THEIR ASSIGNED TEACHERS
-- ============================================
SELECT 
    c.id as course_id,
    c.title as course_title,
    c.trainer_id,
    CASE 
        WHEN c.trainer_id IS NULL THEN '❌ No teacher assigned'
        WHEN u.id IS NULL THEN '⚠️ Invalid trainer_id (teacher not found)'
        ELSE '✅ Assigned to: ' || u.name
    END as assignment_status,
    u.name as teacher_name,
    u.email as teacher_email
FROM public.courses c
LEFT JOIN public.users u ON c.trainer_id = u.id
ORDER BY c.title;

-- ============================================
-- 2. CHECK ALL TEACHERS AND THEIR ASSIGNED COURSES
-- ============================================
SELECT 
    u.id as teacher_id,
    u.name as teacher_name,
    u.email as teacher_email,
    COUNT(c.id) as assigned_courses_count,
    STRING_AGG(c.title, ', ') as course_titles
FROM public.users u
LEFT JOIN public.courses c ON c.trainer_id = u.id
WHERE u.role = 'teacher'
GROUP BY u.id, u.name, u.email
ORDER BY u.name;

-- ============================================
-- 3. FIND COURSES THAT SHOULD BE ASSIGNED BUT AREN'T
-- ============================================
-- This shows courses with trainer_id set but teacher doesn't exist
SELECT 
    c.id,
    c.title,
    c.trainer_id,
    'Teacher with this ID does not exist in users table' as issue
FROM public.courses c
WHERE c.trainer_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.users u WHERE u.id = c.trainer_id
  );

-- ============================================
-- 4. QUICK FIX: Assign courses to a specific teacher by email
-- ============================================
-- Replace 'teacher@gmail.com' with the actual teacher email
-- Replace 'Course Title 1' and 'Course Title 2' with actual course titles

-- Example for Salman (teacher@gmail.com):
UPDATE public.courses c
SET trainer_id = u.id
FROM public.users u
WHERE u.email = 'teacher@gmail.com'
  AND u.role = 'teacher'
  AND c.title IN ('Course Title 1', 'Course Title 2');

-- ============================================
-- 5. ALTERNATIVE: Assign by course ID
-- ============================================
-- First, get the course IDs:
-- SELECT id, title FROM public.courses;

-- Then assign them (replace with actual IDs):
-- UPDATE public.courses 
-- SET trainer_id = (SELECT id FROM public.users WHERE email = 'teacher@gmail.com' AND role = 'teacher')
-- WHERE id IN ('course-id-1', 'course-id-2');

-- ============================================
-- 6. VERIFY THE FIX
-- ============================================
-- Run query #2 again to see updated assignments

