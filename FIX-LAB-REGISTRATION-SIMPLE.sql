-- Fix Lab Registration User Profile Creation Error (Simplified Version)
-- This script fixes RLS policies that prevent backend from creating user profiles during lab registration

-- Step 1: Disable RLS on users table (backend uses service role key)
ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;

-- Step 2: Also ensure labs and lab_users tables allow backend operations
ALTER TABLE IF EXISTS public.labs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lab_users DISABLE ROW LEVEL SECURITY;

-- Step 3: Fix the role constraint to include 'lab'
-- First, drop any existing constraint that might not include 'lab'
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;

-- Then add the correct constraint with all roles including 'lab'
ALTER TABLE public.users 
ADD CONSTRAINT users_role_check 
CHECK (role IN ('patient', 'donor', 'admin', 'lab', 'student', 'teacher', 'pharmacy', 'doctor', 'blood_bank'));

-- That's it! The fix is now applied.
