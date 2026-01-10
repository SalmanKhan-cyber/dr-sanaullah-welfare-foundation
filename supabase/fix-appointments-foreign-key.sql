-- Fix appointments foreign key constraint issue
-- This script checks the actual table structure and creates the correct constraint

-- Step 1: Check current patients table structure
-- Check if patients table has 'id' column (migrated schema) or only 'user_id' (original schema)

-- First, check what columns exist in patients table
SELECT 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'patients' 
ORDER BY ordinal_position;

-- Step 2: Drop existing constraint if it exists
ALTER TABLE public.appointments 
DROP CONSTRAINT IF EXISTS appointments_patient_id_fkey;

-- Step 3: Check if patients table structure was migrated (has 'id' column)
DO $$
DECLARE
    has_id_column boolean;
    patients_id_is_pkey boolean;
BEGIN
    -- Check if patients table has 'id' column
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'patients' 
        AND column_name = 'id'
    ) INTO has_id_column;
    
    -- Check if 'id' is the primary key
    SELECT EXISTS (
        SELECT 1 FROM pg_constraint c
        JOIN pg_class t ON c.conrelid = t.oid
        WHERE t.relname = 'patients'
        AND t.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
        AND c.contype = 'p'
        AND 'id' = ANY(
            SELECT a.attname
            FROM pg_attribute a
            WHERE a.attrelid = c.conrelid
            AND a.attnum = ANY(c.conkey)
        )
    ) INTO patients_id_is_pkey;
    
    RAISE NOTICE 'Patients table has id column: %', has_id_column;
    RAISE NOTICE 'Patients id column is primary key: %', patients_id_is_pkey;
    
    IF has_id_column AND patients_id_is_pkey THEN
        -- Schema was migrated: patients.id is primary key
        RAISE NOTICE 'Using migrated schema: appointments.patient_id → patients.id';
        
        -- Update existing appointments to use patient.id instead of user_id (if needed)
        UPDATE public.appointments ap
        SET patient_id = p.id
        FROM public.patients p
        WHERE ap.patient_id::text = p.user_id::text 
        AND p.id IS NOT NULL
        AND NOT EXISTS (SELECT 1 FROM public.patients WHERE id = ap.patient_id);
        
        -- Create constraint referencing patients(id)
        ALTER TABLE public.appointments 
        ADD CONSTRAINT appointments_patient_id_fkey 
        FOREIGN KEY (patient_id) 
        REFERENCES public.patients(id) 
        ON DELETE CASCADE;
        
    ELSE
        -- Original schema: patients.user_id is primary key
        -- But since user_id might not be unique anymore, we need to ensure it is
        RAISE NOTICE 'Using original schema: appointments.patient_id → patients.user_id';
        
        -- Ensure user_id has unique constraint (required for foreign key)
        -- First check if unique constraint/index exists
        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint 
            WHERE conrelid = 'public.patients'::regclass
            AND contype IN ('u', 'p')
            AND 'user_id' = ANY(
                SELECT a.attname
                FROM pg_attribute a
                WHERE a.attrelid = conrelid
                AND a.attnum = ANY(conkey)
            )
        ) THEN
            -- Create unique index on user_id
            CREATE UNIQUE INDEX IF NOT EXISTS patients_user_id_unique_idx 
            ON public.patients(user_id) 
            WHERE user_id IS NOT NULL;
        END IF;
        
        -- Create constraint referencing patients(user_id)
        -- Note: This might fail if user_id is not unique
        BEGIN
            ALTER TABLE public.appointments 
            ADD CONSTRAINT appointments_patient_id_fkey 
            FOREIGN KEY (patient_id) 
            REFERENCES public.patients(user_id) 
            ON DELETE CASCADE;
            
            RAISE NOTICE 'Successfully created foreign key constraint on patients(user_id)';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Failed to create constraint on patients(user_id). Error: %. This usually means user_id is not unique.', SQLERRM;
            RAISE NOTICE 'You may need to run the allow-multiple-profiles-per-user.sql migration first, then use patients(id) instead.';
        END;
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

