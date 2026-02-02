-- Add guest patient columns to appointments table
-- This allows guest bookings without creating patient accounts

-- First, make patient_id nullable
ALTER TABLE public.appointments 
ALTER COLUMN patient_id DROP NOT NULL;

-- Add guest patient columns
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS guest_patient_name text,
ADD COLUMN IF NOT EXISTS guest_patient_phone text,
ADD COLUMN IF NOT EXISTS guest_patient_age int,
ADD COLUMN IF NOT EXISTS guest_patient_gender text CHECK (guest_patient_gender IN ('male','female','other')),
ADD COLUMN IF NOT EXISTS guest_patient_cnic text,
ADD COLUMN IF NOT EXISTS guest_patient_history text;

-- Add appointment sheet URL column if not exists
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS appointment_sheet_url text;

-- Add comments for clarity
COMMENT ON COLUMN public.appointments.patient_id IS 'Patient ID for authenticated users (null for guests)';
COMMENT ON COLUMN public.appointments.guest_patient_name IS 'Guest patient name (for guest bookings)';
COMMENT ON COLUMN public.appointments.guest_patient_phone IS 'Guest patient phone (for guest bookings)';
COMMENT ON COLUMN public.appointments.guest_patient_age IS 'Guest patient age (for guest bookings)';
COMMENT ON COLUMN public.appointments.guest_patient_gender IS 'Guest patient gender (for guest bookings)';
COMMENT ON COLUMN public.appointments.guest_patient_cnic IS 'Guest patient CNIC (for guest bookings)';
COMMENT ON COLUMN public.appointments.guest_patient_history IS 'Guest patient medical history (for guest bookings)';
COMMENT ON COLUMN public.appointments.appointment_sheet_url IS 'URL to generated appointment sheet PDF';
