-- ============================================
-- ULTRA SIMPLE FIX - Run these one by one
-- ============================================

-- STEP 1: Check if patients table has 'id' column
SELECT column_name 
FROM information_schema.columns 
WHERE table_schema = 'public'
AND table_name = 'patients' 
AND column_name IN ('id', 'user_id')
ORDER BY column_name;

-- If you see BOTH 'id' and 'user_id' in results → You have migrated schema → Go to STEP 2A
-- If you see ONLY 'user_id' → You have original schema → Go to STEP 2B


-- ============================================
-- STEP 2A: IF YOU HAVE 'id' COLUMN
-- ============================================
-- Run these 3 commands:

-- 2A.1: Drop old constraint
ALTER TABLE public.appointments DROP CONSTRAINT IF EXISTS appointments_patient_id_fkey;

-- 2A.2: Update appointments to use patient.id
UPDATE public.appointments ap
SET patient_id = p.id
FROM public.patients p
WHERE p.user_id = ap.patient_id
AND p.id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM public.patients WHERE id = ap.patient_id);

-- 2A.3: Create new constraint
ALTER TABLE public.appointments 
ADD CONSTRAINT appointments_patient_id_fkey 
FOREIGN KEY (patient_id) 
REFERENCES public.patients(id) 
ON DELETE CASCADE;


-- ============================================
-- STEP 2B: IF YOU DON'T HAVE 'id' COLUMN
-- ============================================
-- Run these 3 commands:

-- 2B.1: Drop old constraint
ALTER TABLE public.appointments DROP CONSTRAINT IF EXISTS appointments_patient_id_fkey;

-- 2B.2: Make user_id unique (if not already)
CREATE UNIQUE INDEX IF NOT EXISTS patients_user_id_unique 
ON public.patients(user_id) 
WHERE user_id IS NOT NULL;

-- 2B.3: Create new constraint
ALTER TABLE public.appointments 
ADD CONSTRAINT appointments_patient_id_fkey 
FOREIGN KEY (patient_id) 
REFERENCES public.patients(user_id) 
ON DELETE CASCADE;


-- ============================================
-- STEP 3: Verify it worked
-- ============================================
SELECT 
    conname AS constraint_name,
    confrelid::regclass AS referenced_table,
    a2.attname AS referenced_column
FROM pg_constraint c
JOIN pg_attribute a1 ON a1.attnum = ANY(c.conkey) AND a1.attrelid = c.conrelid
JOIN pg_attribute a2 ON a2.attnum = ANY(c.confkey) AND a2.attrelid = c.confrelid
WHERE conrelid = 'appointments'::regclass
AND conname = 'appointments_patient_id_fkey';

