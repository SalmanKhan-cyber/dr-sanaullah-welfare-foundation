-- ============================================
-- SIMPLE FIX - Use patients.id (NO user_id unique index)
-- ============================================
-- This works with duplicate user_id values

-- STEP 1: Drop the broken constraint
ALTER TABLE public.appointments DROP CONSTRAINT IF EXISTS appointments_patient_id_fkey;

-- STEP 2: Ensure all patients have an 'id' column and values
-- Check if 'id' column exists first
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid();

-- Give IDs to any patients missing them
UPDATE public.patients SET id = gen_random_uuid() WHERE id IS NULL;

-- STEP 3: Make 'id' the primary key if it's not already
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conrelid = 'patients'::regclass
        AND conname = 'patients_pkey'
        AND contype = 'p'
    ) THEN
        ALTER TABLE public.patients ADD PRIMARY KEY (id);
    END IF;
END $$;

-- STEP 4: Update existing appointments to use patient.id
-- This handles appointments that were created with user_id
UPDATE public.appointments ap
SET patient_id = p.id
FROM public.patients p
WHERE p.user_id::text = ap.patient_id::text
AND p.id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM public.patients WHERE id = ap.patient_id);

-- STEP 5: Create constraint using patients.id
ALTER TABLE public.appointments 
ADD CONSTRAINT appointments_patient_id_fkey 
FOREIGN KEY (patient_id) 
REFERENCES public.patients(id) 
ON DELETE CASCADE;

-- STEP 6: Verify the constraint was created
SELECT 
    conname AS constraint_name,
    confrelid::regclass AS referenced_table,
    a2.attname AS referenced_column
FROM pg_constraint c
JOIN pg_attribute a1 ON a1.attnum = ANY(c.conkey) AND a1.attrelid = c.conrelid
JOIN pg_attribute a2 ON a2.attnum = ANY(c.confkey) AND a2.attrelid = c.confrelid
WHERE conrelid = 'appointments'::regclass
AND conname = 'appointments_patient_id_fkey';

