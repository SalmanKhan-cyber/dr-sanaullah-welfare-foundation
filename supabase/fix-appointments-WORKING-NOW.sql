-- ============================================
-- WORKING FIX - No created_at column needed
-- ============================================

-- STEP 1: Drop the broken constraint
ALTER TABLE public.appointments DROP CONSTRAINT IF EXISTS appointments_patient_id_fkey;

-- STEP 2: Check if patients has 'id' column
SELECT column_name 
FROM information_schema.columns 
WHERE table_schema = 'public'
AND table_name = 'patients' 
AND column_name = 'id';

-- If you see 'id' in the results above, continue with STEP 3A below
-- If NO results, use STEP 3B (but you probably have 'id' column)

-- STEP 3A: Use patients.id (Recommended - handles duplicates)
-- Run these commands one by one:

-- 3A.1: Ensure all patients have an 'id'
UPDATE public.patients SET id = gen_random_uuid() WHERE id IS NULL;

-- 3A.2: Update appointments to use patient.id
UPDATE public.appointments ap
SET patient_id = p.id
FROM public.patients p
WHERE p.user_id::text = ap.patient_id::text
AND p.id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM public.patients WHERE id = ap.patient_id);

-- 3A.3: Create constraint using patients.id
ALTER TABLE public.appointments 
ADD CONSTRAINT appointments_patient_id_fkey 
FOREIGN KEY (patient_id) 
REFERENCES public.patients(id) 
ON DELETE CASCADE;

-- STEP 3B: Only use this if you DON'T have 'id' column
-- (Skip this if you have 'id' column)

-- First, find and clean up duplicate user_ids
-- Find duplicates (for reference):
SELECT user_id, COUNT(*) as count
FROM public.patients
GROUP BY user_id
HAVING COUNT(*) > 1;

-- Delete duplicates, keeping only one per user_id:
DELETE FROM public.patients p1
WHERE p1.id IN (
    SELECT id FROM (
        SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY id) as rn
        FROM public.patients
    ) t
    WHERE rn > 1
);

-- Then create unique index and constraint:
CREATE UNIQUE INDEX IF NOT EXISTS patients_user_id_unique 
ON public.patients(user_id) 
WHERE user_id IS NOT NULL;

ALTER TABLE public.appointments 
ADD CONSTRAINT appointments_patient_id_fkey 
FOREIGN KEY (patient_id) 
REFERENCES public.patients(user_id) 
ON DELETE CASCADE;

-- STEP 4: Verify the constraint was created
SELECT 
    conname AS constraint_name,
    confrelid::regclass AS referenced_table,
    a2.attname AS referenced_column
FROM pg_constraint c
JOIN pg_attribute a1 ON a1.attnum = ANY(c.conkey) AND a1.attrelid = c.conrelid
JOIN pg_attribute a2 ON a2.attnum = ANY(c.confkey) AND a2.attrelid = c.confrelid
WHERE conrelid = 'appointments'::regclass
AND conname = 'appointments_patient_id_fkey';

