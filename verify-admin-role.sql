-- Verify Admin Role is Set Correctly
-- Run this in Supabase SQL Editor to check admin@dswf.org role

-- Method 1: Check public.users table (THIS IS WHAT MATTERS FOR LOGIN)
SELECT 
  u.id,
  u.email,
  u.role as table_role,
  CASE 
    WHEN u.role = 'admin' THEN '✅ Role is admin - Should work!'
    WHEN u.role IS NULL THEN '❌ Role is NULL - Run fix-admin-role.sql'
    WHEN u.role = 'patient' THEN '❌ Role is patient - Run fix-admin-role.sql'
    ELSE '⚠️ Role is: ' || u.role || ' - Should be "admin"'
  END as status
FROM public.users u
WHERE u.email = 'admin@dswf.org';

-- Method 2: Check if user exists in auth.users (to get user ID)
SELECT 
  au.id,
  au.email
FROM auth.users au
WHERE au.email = 'admin@dswf.org';

-- If the first query shows role is NOT 'admin', run fix-admin-role.sql
