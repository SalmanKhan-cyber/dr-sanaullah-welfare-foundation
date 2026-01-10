-- Fix Admin User Role
-- Run this in Supabase SQL Editor to set admin@dswf.org role to 'admin'

-- Step 1: Check current state
SELECT 
  u.id,
  u.email,
  u.role as current_role
FROM public.users u
WHERE u.email = 'admin@dswf.org';

-- Step 2: Update or insert in public.users table (THIS IS THE MAIN FIX)
INSERT INTO public.users (id, email, role, verified)
SELECT 
  id,
  email,
  'admin',
  false
FROM auth.users
WHERE email = 'admin@dswf.org'
ON CONFLICT (id) 
DO UPDATE SET 
  role = 'admin',
  email = EXCLUDED.email;

-- Step 3: Verify the fix
SELECT 
  u.id,
  u.email,
  u.role as table_role,
  CASE 
    WHEN u.role = 'admin' THEN '✅ SUCCESS: Role is now admin'
    ELSE '❌ FAILED: Role is ' || COALESCE(u.role, 'NULL')
  END as status
FROM public.users u
WHERE u.email = 'admin@dswf.org';

-- Note: To update user_metadata, use Supabase Dashboard:
-- 1. Go to Authentication > Users
-- 2. Click on admin@dswf.org
-- 3. Edit User Metadata
-- 4. Add: {"role": "admin"}
-- 5. Save

