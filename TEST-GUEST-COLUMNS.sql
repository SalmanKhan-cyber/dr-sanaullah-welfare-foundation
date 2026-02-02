-- Test script to verify guest patient columns exist
-- Run this in Supabase SQL Editor to check if migration was successful

-- Check if guest patient columns exist in appointments table
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'appointments' 
    AND table_schema = 'public'
    AND column_name LIKE 'guest_patient_%'
ORDER BY column_name;

-- Check if patient_id is nullable
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'appointments' 
    AND table_schema = 'public'
    AND column_name = 'patient_id';

-- Check if appointment_sheet_url column exists
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'appointments' 
    AND table_schema = 'public'
    AND column_name = 'appointment_sheet_url';

-- Show complete appointments table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'appointments' 
    AND table_schema = 'public'
ORDER BY ordinal_position;
