-- Quick Fix: Check and Assign Courses to Teachers
-- Run this in Supabase SQL Editor

-- ============================================
-- STEP 1: See all courses and their current assignments
-- ============================================
SELECT 
    c.id,
    c.title,
    c.trainer_id,
    CASE 
        WHEN c.trainer_id IS NULL THEN '❌ Not assigned'
        WHEN u.id IS NULL THEN '⚠️ Invalid ID'
        ELSE '✅ ' || u.name
    END as status
FROM public.courses c
LEFT JOIN public.users u ON c.trainer_id = u.id
ORDER BY c.title;

-- ============================================
-- STEP 2: See all teachers
-- ============================================
SELECT 
    id,
    name,
    email,
    role
FROM public.users
WHERE role = 'teacher'
ORDER BY name;

-- ============================================
-- STEP 3: Assign courses to Salman (teacher@gmail.com)
-- Replace the course titles with your actual course titles
-- ============================================
-- First, let's see what courses exist:
SELECT id, title, trainer_id FROM public.courses ORDER BY title;

-- Then assign them (UNCOMMENT and modify the course titles):
/*
UPDATE public.courses c
SET trainer_id = (SELECT id FROM public.users WHERE email = 'teacher@gmail.com' AND role = 'teacher')
WHERE c.title IN ('Your Course Title 1', 'Your Course Title 2');
*/

-- ============================================
-- STEP 4: OR assign by course ID (more reliable)
-- ============================================
-- First get the course IDs from Step 1, then run:
/*
UPDATE public.courses 
SET trainer_id = (SELECT id FROM public.users WHERE email = 'teacher@gmail.com' AND role = 'teacher')
WHERE id IN (
    'paste-course-id-1-here',
    'paste-course-id-2-here'
);
*/

-- ============================================
-- STEP 5: Verify the assignment worked
-- ============================================
SELECT 
    u.name as teacher_name,
    u.email,
    COUNT(c.id) as courses_count,
    STRING_AGG(c.title, ', ') as assigned_courses
FROM public.users u
LEFT JOIN public.courses c ON c.trainer_id = u.id
WHERE u.email = 'teacher@gmail.com' AND u.role = 'teacher'
GROUP BY u.id, u.name, u.email;

