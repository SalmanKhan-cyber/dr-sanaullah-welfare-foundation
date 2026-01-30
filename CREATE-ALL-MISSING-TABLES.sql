-- Create All Missing Tables for Patient File System
-- This script creates patients, doctors, and appointments tables

-- Create patients table first
CREATE TABLE IF NOT EXISTS public.patients (
  user_id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  gender text CHECK (gender IN ('male','female','other')),
  age int,
  cnic text,
  history text,
  phone text,
  created_at timestamptz DEFAULT now()
);

-- Create doctors table
CREATE TABLE IF NOT EXISTS public.doctors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  specialization text,
  degrees text,
  consultation_fee numeric(10,2) DEFAULT 50.00,
  discount_rate numeric(5,2) DEFAULT 50.00,
  image_url text,
  created_at timestamptz DEFAULT now()
);

-- Now create appointments table with proper references
CREATE TABLE IF NOT EXISTS public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(user_id) ON DELETE CASCADE,
  doctor_id uuid NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  appointment_date date NOT NULL,
  appointment_time time NOT NULL,
  reason text,
  consultation_fee numeric(10,2) DEFAULT 0.00,
  discount_applied numeric(5,2) DEFAULT 0.00,
  final_fee numeric(10,2) DEFAULT 0.00,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  video_call_link text,
  patient_file_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Create policies for patients
DROP POLICY IF EXISTS "Allow all operations on patients" ON public.patients;
CREATE POLICY "Allow all operations on patients" ON public.patients
  FOR ALL USING (true) WITH CHECK (true);

-- Create policies for doctors
DROP POLICY IF EXISTS "Allow all operations on doctors" ON public.doctors;
CREATE POLICY "Allow all operations on doctors" ON public.doctors
  FOR ALL USING (true) WITH CHECK (true);

-- Create policies for appointments
DROP POLICY IF EXISTS "Allow all operations on appointments" ON public.appointments;
CREATE POLICY "Allow all operations on appointments" ON public.appointments
  FOR ALL USING (true) WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON public.patients(user_id);
CREATE INDEX IF NOT EXISTS idx_doctors_user_id ON public.doctors(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON public.appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_file_url ON public.appointments(patient_file_url);

-- Verify all tables were created
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name IN ('patients', 'doctors', 'appointments')
ORDER BY table_name, ordinal_position;
