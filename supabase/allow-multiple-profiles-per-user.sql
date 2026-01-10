-- Allow multiple profiles per user (patient, teacher, doctor)
-- Execute in Supabase SQL Editor

-- ============================================
-- 1. PATIENTS TABLE: Allow multiple patient profiles per user
-- ============================================

-- Step 1: Add id column first
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid();

-- Step 2: Update existing records to have IDs
UPDATE public.patients SET id = gen_random_uuid() WHERE id IS NULL;

-- Step 3: Drop foreign key constraints that depend on the primary key
ALTER TABLE public.lab_reports DROP CONSTRAINT IF EXISTS lab_reports_patient_id_fkey;
ALTER TABLE public.prescriptions DROP CONSTRAINT IF EXISTS prescriptions_patient_id_fkey;
ALTER TABLE public.appointments DROP CONSTRAINT IF EXISTS appointments_patient_id_fkey;

-- Step 4: Drop the primary key constraint on user_id
ALTER TABLE public.patients DROP CONSTRAINT IF EXISTS patients_pkey CASCADE;

-- Step 5: Set id as primary key
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'patients_pkey' 
        AND contype = 'p'
    ) THEN
        ALTER TABLE public.patients ADD PRIMARY KEY (id);
    END IF;
END $$;

-- Step 6: Recreate foreign key constraints pointing to the new id column
-- First, we need to map existing patient_id values to the new id values
-- Update lab_reports to use the new id
UPDATE public.lab_reports lr
SET patient_id = p.id
FROM public.patients p
WHERE lr.patient_id = p.user_id AND p.id IS NOT NULL;

-- Update prescriptions to use the new id
UPDATE public.prescriptions pr
SET patient_id = p.id
FROM public.patients p
WHERE pr.patient_id = p.user_id AND p.id IS NOT NULL;

-- Update appointments to use the new id
UPDATE public.appointments ap
SET patient_id = p.id
FROM public.patients p
WHERE ap.patient_id = p.user_id AND p.id IS NOT NULL;

-- Now recreate foreign keys pointing to id
ALTER TABLE public.lab_reports 
ADD CONSTRAINT lab_reports_patient_id_fkey 
FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;

ALTER TABLE public.prescriptions 
ADD CONSTRAINT prescriptions_patient_id_fkey 
FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE SET NULL;

ALTER TABLE public.appointments 
ADD CONSTRAINT appointments_patient_id_fkey 
FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON DELETE CASCADE;

-- Ensure user_id is still a foreign key (should already exist)
-- Add index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON public.patients(user_id);

-- ============================================
-- 2. TEACHERS TABLE: Allow multiple teacher profiles per user
-- ============================================

-- Step 1: Add id column first
ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid();

-- Step 2: Update existing records to have IDs
UPDATE public.teachers SET id = gen_random_uuid() WHERE id IS NULL;

-- Step 3: Drop the primary key constraint on user_id
ALTER TABLE public.teachers DROP CONSTRAINT IF EXISTS teachers_pkey CASCADE;

-- Step 4: Set id as primary key
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'teachers_pkey' 
        AND contype = 'p'
    ) THEN
        ALTER TABLE public.teachers ADD PRIMARY KEY (id);
    END IF;
END $$;

-- Ensure user_id is still a foreign key (should already exist)
-- Add index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_teachers_user_id ON public.teachers(user_id);

-- ============================================
-- 3. DOCTORS TABLE: Ensure user_id allows multiple entries
-- ============================================

-- Ensure user_id column exists (should already exist from previous migration)
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES public.users(id) ON DELETE SET NULL;

-- Add index on user_id for faster lookups (if not exists)
CREATE INDEX IF NOT EXISTS idx_doctors_user_id ON public.doctors(user_id);

-- ============================================
-- 4. USERS TABLE: Make role nullable (optional)
-- ============================================

-- Make role nullable to allow users without a primary role
ALTER TABLE public.users ALTER COLUMN role DROP NOT NULL;

-- ============================================
-- 5. VERIFY CHANGES
-- ============================================

-- Check patients table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'patients' 
ORDER BY ordinal_position;

-- Check teachers table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'teachers' 
ORDER BY ordinal_position;

-- Check doctors table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'doctors' 
AND column_name = 'user_id';

-- Verify foreign keys are correctly set
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND (ccu.table_name = 'patients' OR ccu.table_name = 'teachers')
ORDER BY tc.table_name, kcu.column_name;
