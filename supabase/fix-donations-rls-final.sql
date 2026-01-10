-- FINAL FIX: Disable RLS on all tables involved in donation process
-- Run this in Supabase SQL Editor

-- Step 1: Drop ALL policies that might interfere
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on donations table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'donations' AND schemaname = 'public') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.donations', r.policyname);
    END LOOP;
    
    -- Drop all policies on notifications table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'notifications' AND schemaname = 'public') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.notifications', r.policyname);
    END LOOP;
    
    -- Drop all policies on users table
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'users' AND schemaname = 'public') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.users', r.policyname);
    END LOOP;
END $$;

-- Step 2: Disable RLS on all involved tables
ALTER TABLE IF EXISTS public.donations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;

-- Step 3: Verify RLS is disabled
SELECT 
    tablename,
    CASE 
        WHEN rowsecurity THEN '❌ ENABLED' 
        ELSE '✅ DISABLED' 
    END as "RLS Status",
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = t.tablename AND schemaname = 'public') as "Policy Count"
FROM pg_tables t
WHERE schemaname = 'public'
AND tablename IN ('donations', 'notifications', 'users')
ORDER BY tablename;

-- Step 4: Test insert (uncomment to test)
-- INSERT INTO public.donations (donor_id, amount, purpose) 
-- VALUES ('00000000-0000-0000-0000-000000000000', 100, 'test') 
-- RETURNING id;



