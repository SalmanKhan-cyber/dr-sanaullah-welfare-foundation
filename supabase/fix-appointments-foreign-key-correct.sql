-- Fix appointments foreign key constraint
-- This script checks the actual table structure and creates the correct constraint

-- Step 1: Check current patients table structure
-- Check if patients table has 'id' column (migrated schema) or only 'user_id' (original schema)
DO $$
DECLARE
    has_id_column boolean;
    has_user_id_pkey boolean;
    current_constraint_ref text;
BEGIN
    -- Check if patients table has 'id' column
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'patients' AND column_name = 'id'
    ) INTO has_id_column;
    
    -- Check if user_id is primary key
    SELECT EXISTS (
        SELECT 1 FROM pg_constraint c
        JOIN pg_class t ON c.conrelid = t.oid
        WHERE t.relname = 'patients'
        AND c.contype = 'p'
        AND 'user_id' = ANY(
            SELECT a.attname
            FROM pg_attribute a
            WHERE a.attrelid = c.conrelid
            AND a.attnum = ANY(c.conkey)
        )
    ) INTO has_user_id_pkey;
    
    RAISE NOTICE 'Patients table has id column: %', has_id_column;
    RAISE NOTICE 'Patients table has user_id as primary key: %', has_user_id_pkey;
    
    -- Drop existing constraint if it exists
    ALTER TABLE public.appointments 
    DROP CONSTRAINT IF EXISTS appointments_patient_id_fkey;
    
    -- Create the correct constraint based on schema
    IF has_id_column AND NOT has_user_id_pkey THEN
        -- Schema was migrated: patients.id is primary key
        RAISE NOTICE 'Using migrated schema: appointments.patient_id → patients.id';
        
        -- First, update existing appointments to use patient.id instead of user_id
        UPDATE public.appointments ap
        SET patient_id = p.id
        FROM public.patients p
        WHERE ap.patient_id = p.user_id AND p.id IS NOT NULL
        AND EXISTS (SELECT 1 FROM public.patients WHERE user_id = ap.patient_id);
        
        -- Create constraint referencing patients(id)
        ALTER TABLE public.appointments 
        ADD CONSTRAINT appointments_patient_id_fkey 
        FOREIGN KEY (patient_id) 
        REFERENCES public.patients(id) 
        ON DELETE CASCADE;
        
    ELSIF has_user_id_pkey THEN
        -- Original schema: patients.user_id is primary key
        RAISE NOTICE 'Using original schema: appointments.patient_id → patients.user_id';
        
        -- Ensure user_id is unique (add unique constraint if not exists)
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_constraint 
                WHERE conrelid = 'patients'::regclass
                AND conname LIKE '%user_id%unique%'
                AND contype = 'u'
            ) THEN
                CREATE UNIQUE INDEX IF NOT EXISTS patients_user_id_unique 
                ON public.patients(user_id);
            END IF;
        END $$;
        
        -- Create constraint referencing patients(user_id)
        ALTER TABLE public.appointments 
        ADD CONSTRAINT appointments_patient_id_fkey 
        FOREIGN KEY (patient_id) 
        REFERENCES public.patients(user_id) 
        ON DELETE CASCADE;
        
    ELSE
        RAISE EXCEPTION 'Cannot determine patients table schema. Please check the table structure.';
    END IF;
    
END $$;

-- Verify constraint was created
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
AND conname LIKE '%patient_id%'
AND c.contype = 'f';

