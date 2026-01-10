-- Add 'doctor' role to users table
-- Execute in Supabase SQL editor

-- Update the role check constraint to include 'doctor'
ALTER TABLE public.users 
DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE public.users 
ADD CONSTRAINT users_role_check 
CHECK (role IN ('patient', 'donor', 'admin', 'lab', 'student', 'teacher', 'pharmacy', 'doctor'));

-- Verify the change
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name = 'users_role_check';

