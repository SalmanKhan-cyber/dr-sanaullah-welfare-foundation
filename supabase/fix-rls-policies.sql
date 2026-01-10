-- Fix RLS policies to allow user registration and patient data storage

-- First, drop existing restrictive policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Patients can view their patient row" ON public.patients;
DROP POLICY IF EXISTS "Patients can update their patient row" ON public.patients;
DROP POLICY IF EXISTS "Patients can insert their patient row" ON public.patients;

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Users table policies
-- Allow users to view their own profile
CREATE POLICY "Users can view their own profile"
    ON public.users FOR SELECT
    USING (id = auth.uid());

-- Allow users to insert their own profile
CREATE POLICY "Users can insert their own profile"
    ON public.users FOR INSERT
    WITH CHECK (id = auth.uid());

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
    ON public.users FOR UPDATE
    USING (id = auth.uid());

-- Patients table policies
-- Allow patients to view their own row
CREATE POLICY "Patients can view their patient row"
    ON public.patients FOR SELECT
    USING (user_id = auth.uid());

-- Allow patients to insert their own row
CREATE POLICY "Patients can insert their patient row"
    ON public.patients FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Allow patients to update their own row
CREATE POLICY "Patients can update their patient row"
    ON public.patients FOR UPDATE
    USING (user_id = auth.uid());

