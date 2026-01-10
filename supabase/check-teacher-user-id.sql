-- Check Teacher User ID vs Course Trainer ID
-- This will help identify if there's a mismatch

-- ============================================
-- 1. Check Salman Teacher's User ID
-- ============================================
SELECT 
    id as user_id,
    name,
    email,
    role,
    'This is the ID that should match trainer_id in courses' as note
FROM public.users
WHERE email = 'teacher@gmail.com' 
  AND role = 'teacher';

-- ============================================
-- 2. Check what trainer_id is set in courses
-- ============================================
SELECT 
    id as course_id,
    title,
    trainer_id,
    'This trainer_id should match the user_id above' as note
FROM public.courses
WHERE title IN ('AI', 'Xrays Course');

-- ============================================
-- 3. Compare: Do they match?
-- ============================================
SELECT 
    u.id as teacher_user_id,
    u.name as teacher_name,
    u.email,
    c.id as course_id,
    c.title as course_title,
    c.trainer_id as course_trainer_id,
    CASE 
        WHEN u.id = c.trainer_id THEN '✅ MATCH - Should work!'
        ELSE '❌ MISMATCH - This is the problem!'
    END as match_status
FROM public.users u
CROSS JOIN public.courses c
WHERE u.email = 'teacher@gmail.com' 
  AND u.role = 'teacher'
  AND c.title IN ('AI', 'Xrays Course');

-- ============================================
-- 4. If there's a mismatch, fix it:
-- ============================================
-- Replace 'teacher@gmail.com' with the actual teacher email
-- This will update the courses to use the correct teacher user ID
/*
UPDATE public.courses
SET trainer_id = (
    SELECT id FROM public.users 
    WHERE email = 'teacher@gmail.com' 
    AND role = 'teacher'
)
WHERE title IN ('AI', 'Xrays Course');
*/

