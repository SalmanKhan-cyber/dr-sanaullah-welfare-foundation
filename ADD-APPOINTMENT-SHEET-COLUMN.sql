-- Add appointment_sheet_url column to appointments table
-- This column will store the URL to the generated appointment sheet PDF

ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS appointment_sheet_url text;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_appointments_appointment_sheet_url 
ON public.appointments(appointment_sheet_url);

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'appointments'
AND column_name = 'appointment_sheet_url';
