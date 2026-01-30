-- Add patient_file_url column to appointments table
-- This column will store the URL to the generated patient file PDF

ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS patient_file_url text;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_appointments_patient_file_url 
ON public.appointments(patient_file_url);

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'appointments'
AND column_name = 'patient_file_url';
