-- Simple Step-by-Step Fix for Appointments Foreign Key
-- Run each section one at a time, or run all at once

-- ============================================
-- STEP 1: Check patients table structure
-- ============================================
SELECT 
    column_name, 
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public'
AND table_name = 'patients' 
ORDER BY ordinal_position;

-- ============================================
-- STEP 2: Drop the broken constraint
-- ============================================
ALTER TABLE public.appointments 
DROP CONSTRAINT IF EXISTS appointments_patient_id_fkey;

-- ============================================
-- STEP 3: Check if patients has 'id' column
-- ============================================
-- Run this query first to see if you have 'id' column
SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'patients' 
    AND column_name = 'id'
) AS has_id_column;

-- ============================================
-- STEP 4A: If you HAVE 'id' column (migrated schema)
-- ============================================
-- Run this section if the query above returned TRUE

-- Update existing appointments to use patient.id
UPDATE public.appointments ap
SET patient_id = p.id
FROM public.patients p
WHERE p.user_id = ap.patient_id
AND p.id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM public.patients WHERE id = ap.patient_id);

-- Create constraint referencing patients(id)
ALTER TABLE public.appointments 
ADD CONSTRAINT appointments_patient_id_fkey 
FOREIGN KEY (patient_id) 
REFERENCES public.patients(id) 
ON DELETE CASCADE;

-- ============================================
-- STEP 4B: If you DON'T have 'id' column (original schema)
-- ============================================
-- Run this section if the query above returned FALSE
-- (Don't run both 4A and 4B - only run the one that matches your schema)

-- First, ensure user_id is unique
CREATE UNIQUE INDEX IF NOT EXISTS patients_user_id_unique 
ON public.patients(user_id) 
WHERE user_id IS NOT NULL;

-- Create constraint referencing patients(user_id)
ALTER TABLE public.appointments 
ADD CONSTRAINT appointments_patient_id_fkey 
FOREIGN KEY (patient_id) 
REFERENCES public.patients(user_id) 
ON DELETE CASCADE;

-- ============================================
-- STEP 5: Verify the constraint was created
-- ============================================
SELECT 
    conname AS constraint_name,
    conrelid::regclass AS table_name,
    confrelid::regclass AS referenced_table,
    a1.attname AS column_name,
    a2.attname AS referenced_column
FROM pg_constraint c
JOIN pg_attribute a1 ON a1.attnum = ANY(c.conkey) AND a1.attrelid = c.conrelid
JOIN pg_attribute a2 ON a2.attnum = ANY(c.confkey) AND a2.attrelid = c.confrelid
WHERE conrelid = 'appointments'::regclass
AND conname = 'appointments_patient_id_fkey'
AND c.contype = 'f';

