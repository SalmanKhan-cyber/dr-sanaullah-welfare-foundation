-- ✅ RUN THIS SQL SCRIPT ONLY
-- This script automatically detects your schema and fixes the foreign key constraint

-- Step 1: Check current patients table structure
SELECT 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public'
AND table_name = 'patients' 
ORDER BY ordinal_position;

-- Step 2: Drop broken constraint
ALTER TABLE public.appointments 
DROP CONSTRAINT IF EXISTS appointments_patient_id_fkey;

-- Step 3: Check if patients has 'id' column and create appropriate constraint
DO $$
DECLARE
    patients_has_id_col boolean;
    id_is_pkey boolean;
BEGIN
    -- Check if patients table has 'id' column
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'patients' 
        AND column_name = 'id'
    ) INTO patients_has_id_col;
    
    -- Check if 'id' is primary key
    SELECT EXISTS (
        SELECT 1 FROM pg_constraint c
        JOIN pg_class t ON c.conrelid = t.oid AND t.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
        WHERE t.relname = 'patients'
        AND c.contype = 'p'
        AND EXISTS (
            SELECT 1 FROM pg_attribute a
            WHERE a.attrelid = c.conrelid
            AND a.attnum = ANY(c.conkey)
            AND a.attname = 'id'
        )
    ) INTO id_is_pkey;
    
    RAISE NOTICE 'Patients has id column: %, id is primary key: %', patients_has_id_col, id_is_pkey;
    
    IF patients_has_id_col AND id_is_pkey THEN
        -- Migrated schema: patients.id is primary key
        RAISE NOTICE 'Using migrated schema - creating constraint: appointments.patient_id → patients.id';
        
        -- Update existing appointments to use patient.id instead of user_id
        UPDATE public.appointments ap
        SET patient_id = p.id
        FROM public.patients p
        WHERE p.user_id = ap.patient_id
        AND p.id IS NOT NULL
        AND NOT EXISTS (SELECT 1 FROM public.patients WHERE id = ap.patient_id);
        
        -- Create constraint
        ALTER TABLE public.appointments 
        ADD CONSTRAINT appointments_patient_id_fkey 
        FOREIGN KEY (patient_id) 
        REFERENCES public.patients(id) 
        ON DELETE CASCADE;
        
        RAISE NOTICE '✅ Constraint created successfully: appointments.patient_id → patients.id';
        
    ELSE
        -- Original schema: patients.user_id should be primary key
        RAISE NOTICE 'Using original schema - ensuring user_id is unique...';
        
        -- Check if user_id has unique constraint
        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint c
            JOIN pg_class t ON c.conrelid = t.oid AND t.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
            WHERE t.relname = 'patients'
            AND c.contype IN ('p', 'u')
            AND EXISTS (
                SELECT 1 FROM pg_attribute a
                WHERE a.attrelid = c.conrelid
                AND a.attnum = ANY(c.conkey)
                AND a.attname = 'user_id'
            )
        ) THEN
            -- Create unique index on user_id if it doesn't exist
            CREATE UNIQUE INDEX IF NOT EXISTS patients_user_id_unique 
            ON public.patients(user_id) 
            WHERE user_id IS NOT NULL;
            
            RAISE NOTICE 'Created unique index on patients.user_id';
        END IF;
        
        -- Create constraint referencing patients(user_id)
        BEGIN
            ALTER TABLE public.appointments 
            ADD CONSTRAINT appointments_patient_id_fkey 
            FOREIGN KEY (patient_id) 
            REFERENCES public.patients(user_id) 
            ON DELETE CASCADE;
            
            RAISE NOTICE '✅ Constraint created successfully: appointments.patient_id → patients.user_id';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '❌ Failed to create constraint on patients.user_id: %', SQLERRM;
            RAISE NOTICE 'This means user_id is not unique. You may need to run allow-multiple-profiles-per-user.sql migration first.';
            RAISE;
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
AND conname = 'appointments_patient_id_fkey'
AND c.contype = 'f';

