-- Add home services support to doctors, labs, and create home services requests table
-- Run this in Supabase SQL Editor

-- Add home_services field to doctors table
ALTER TABLE public.doctors 
ADD COLUMN IF NOT EXISTS home_services boolean DEFAULT false;

-- Add home_services field to labs table
ALTER TABLE public.labs 
ADD COLUMN IF NOT EXISTS home_services boolean DEFAULT false;

-- Create home_services_requests table
CREATE TABLE IF NOT EXISTS public.home_services_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
    service_type text NOT NULL CHECK (service_type IN ('doctor', 'nurse', 'lab_test', 'phlebotomist', 'physiotherapist', 'other')),
    doctor_id uuid REFERENCES public.doctors(id) ON DELETE SET NULL,
    lab_id uuid REFERENCES public.labs(id) ON DELETE SET NULL,
    patient_name text NOT NULL,
    patient_phone text NOT NULL,
    patient_email text,
    address text NOT NULL,
    city text,
    preferred_date date,
    preferred_time text,
    urgency text CHECK (urgency IN ('normal', 'urgent', 'emergency')) DEFAULT 'normal',
    description text,
    status text CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
    assigned_to uuid REFERENCES public.users(id) ON DELETE SET NULL,
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_home_services_requests_patient_id ON public.home_services_requests(patient_id);
CREATE INDEX IF NOT EXISTS idx_home_services_requests_doctor_id ON public.home_services_requests(doctor_id);
CREATE INDEX IF NOT EXISTS idx_home_services_requests_lab_id ON public.home_services_requests(lab_id);
CREATE INDEX IF NOT EXISTS idx_home_services_requests_status ON public.home_services_requests(status);
CREATE INDEX IF NOT EXISTS idx_home_services_requests_service_type ON public.home_services_requests(service_type);
CREATE INDEX IF NOT EXISTS idx_doctors_home_services ON public.doctors(home_services);
CREATE INDEX IF NOT EXISTS idx_labs_home_services ON public.labs(home_services);

-- Enable RLS
ALTER TABLE public.home_services_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all operations on home_services_requests" ON public.home_services_requests;
DROP POLICY IF EXISTS "Users can view their own requests" ON public.home_services_requests;

-- RLS policies for home_services_requests
-- Allow all operations for backend service role (admin operations)
CREATE POLICY "Allow all operations on home_services_requests" ON public.home_services_requests
  FOR ALL USING (true) WITH CHECK (true);

-- Allow users to view their own requests
CREATE POLICY "Users can view their own requests" ON public.home_services_requests
  FOR SELECT USING (patient_id = auth.uid());


