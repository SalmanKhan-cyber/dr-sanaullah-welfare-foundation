-- ============================================
-- FINAL FIX - Handles duplicate user_id case
-- ============================================

-- STEP 1: Drop the broken constraint
ALTER TABLE public.appointments DROP CONSTRAINT IF EXISTS appointments_patient_id_fkey;

-- STEP 2: Check if patients has 'id' column (migrated schema)
-- Run this first to see what you have:
SELECT column_name 
FROM information_schema.columns 
WHERE table_schema = 'public'
AND table_name = 'patients' 
AND column_name = 'id';

-- If the query above returns a row with 'id', you have migrated schema
-- If it returns no rows, you have original schema (but duplicates suggest migrated)

-- STEP 3A: IF YOU HAVE 'id' COLUMN (Recommended - handles duplicates)
-- Run these commands:

-- 3A.1: Ensure all patient records have an 'id' (if migration was partial)
UPDATE public.patients SET id = gen_random_uuid() WHERE id IS NULL;

-- 3A.2: Update existing appointments to use patient.id instead of user_id
-- This handles the case where appointments were created with user_id
UPDATE public.appointments ap
SET patient_id = p.id
FROM public.patients p
WHERE p.user_id::text = ap.patient_id::text
AND p.id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM public.patients WHERE id = ap.patient_id);

-- 3A.3: Create constraint referencing patients(id)
ALTER TABLE public.appointments 
ADD CONSTRAINT appointments_patient_id_fkey 
FOREIGN KEY (patient_id) 
REFERENCES public.patients(id) 
ON DELETE CASCADE;

-- STEP 3B: IF YOU DON'T HAVE 'id' COLUMN (and have duplicates)
-- You need to clean up duplicates first, then create unique index
-- Skip this section if you have 'id' column

-- 3B.1: Find duplicate user_ids (for reference)
SELECT user_id, COUNT(*) as count
FROM public.patients
GROUP BY user_id
HAVING COUNT(*) > 1;

-- 3B.2: Keep only the first patient record for each user_id
-- Delete duplicates (keep the one with lowest id)
DELETE FROM public.patients p1
WHERE p1.id IN (
    SELECT id FROM (
        SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY id) as rn
        FROM public.patients
    ) t
    WHERE rn > 1
);

-- 3B.3: Now create unique index (after cleaning duplicates)
CREATE UNIQUE INDEX IF NOT EXISTS patients_user_id_unique 
ON public.patients(user_id) 
WHERE user_id IS NOT NULL;

-- 3B.4: Create constraint
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

