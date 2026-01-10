-- Add patient_name column to lab_reports table
-- This allows storing patient names for unregistered patients
-- Run this in Supabase SQL Editor

-- Make patient_id nullable (to allow reports without registered patients)
ALTER TABLE public.lab_reports 
ALTER COLUMN patient_id DROP NOT NULL;

-- Add patient_name column
ALTER TABLE public.lab_reports 
ADD COLUMN IF NOT EXISTS patient_name text;

-- Update existing records to use patient name from patients table if patient_name is null
UPDATE public.lab_reports lr
SET patient_name = COALESCE(
    lr.patient_name,
    (SELECT u.name FROM public.patients p 
     JOIN public.users u ON p.user_id = u.id 
     WHERE p.id = lr.patient_id)
)
WHERE lr.patient_id IS NOT NULL AND lr.patient_name IS NULL;


