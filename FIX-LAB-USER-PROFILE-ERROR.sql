-- Fix Lab Registration User Profile Creation Error
-- This script fixes RLS policies that prevent backend from creating user profiles during lab registration

-- Step 1: Disable RLS on users table (backend uses service role key)
ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;

-- Step 2: Also ensure labs and lab_users tables allow backend operations
ALTER TABLE IF EXISTS public.labs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lab_users DISABLE ROW LEVEL SECURITY;

-- Step 3: Verify the role constraint includes 'lab'
-- First, drop any existing constraint that might not include 'lab'
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;

-- Then add the correct constraint with all roles including 'lab'
ALTER TABLE public.users 
ADD CONSTRAINT users_role_check 
CHECK (role IN ('patient', 'donor', 'admin', 'lab', 'student', 'teacher', 'pharmacy', 'doctor', 'blood_bank'));

-- Step 4: Verify the fix
SELECT 
    table_name, 
    row_level_security 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'labs', 'lab_users');

SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name = 'users_role_check';
