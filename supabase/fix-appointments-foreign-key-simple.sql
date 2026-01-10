-- Simple Fix: Update appointments foreign key constraint
-- This checks the actual schema and fixes the constraint accordingly

-- Step 1: Check if patients table has 'id' column (migrated schema)
-- Step 2: Drop existing broken constraint
-- Step 3: Create correct constraint

-- Drop the broken constraint
ALTER TABLE public.appointments 
DROP CONSTRAINT IF EXISTS appointments_patient_id_fkey;

-- Check patients table structure and create appropriate constraint
DO $$
DECLARE
    patients_has_id boolean;
BEGIN
    -- Check if patients table has 'id' column (from migration)
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'patients' 
        AND column_name = 'id'
    ) INTO patients_has_id;
    
    RAISE NOTICE 'Patients table has id column: %', patients_has_id;
    
    IF patients_has_id THEN
        -- Schema was migrated: use patients.id
        RAISE NOTICE 'Creating foreign key: appointments.patient_id → patients.id';
        
        -- Update existing appointments to use patient.id instead of user_id
        -- Only update if patient_id doesn't match any patient.id
        UPDATE public.appointments ap
        SET patient_id = p.id
        FROM public.patients p
        WHERE p.user_id::text = ap.patient_id::text
        AND NOT EXISTS (SELECT 1 FROM public.patients WHERE id = ap.patient_id)
        AND p.id IS NOT NULL;
        
        -- Create constraint referencing patients(id)
        ALTER TABLE public.appointments 
        ADD CONSTRAINT appointments_patient_id_fkey 
        FOREIGN KEY (patient_id) 
        REFERENCES public.patients(id) 
        ON DELETE CASCADE;
        
        RAISE NOTICE '✅ Foreign key constraint created: appointments.patient_id → patients.id';
        
    ELSE
        -- Original schema: patients.user_id is primary key
        RAISE NOTICE 'Creating foreign key: appointments.patient_id → patients.user_id';
        
        -- Create constraint referencing patients(user_id)
        -- Note: This requires user_id to be unique/primary key
        ALTER TABLE public.appointments 
        ADD CONSTRAINT appointments_patient_id_fkey 
        FOREIGN KEY (patient_id) 
        REFERENCES public.patients(user_id) 
        ON DELETE CASCADE;
        
        RAISE NOTICE '✅ Foreign key constraint created: appointments.patient_id → patients.user_id';
    END IF;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error creating constraint: %. Please check the patients table structure.', SQLERRM;
    RAISE;
END $$;

-- Verify constraint
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

