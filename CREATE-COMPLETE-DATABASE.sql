-- Complete Database Foundation
-- This script creates the users table first, then all dependent tables

-- Step 1: Create the core users table
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  email text unique,
  phone text unique,
  role text check (role in ('patient','donor','admin','lab','student','teacher','pharmacy','doctor','blood_bank')),
  verified boolean default false,
  created_at timestamptz default now()
);

-- Step 2: Create patients table
CREATE TABLE IF NOT EXISTS public.patients (
  user_id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  gender text CHECK (gender IN ('male','female','other')),
  age int,
  cnic text,
  history text,
  phone text,
  created_at timestamptz DEFAULT now()
);

-- Step 3: Create doctors table
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

-- Step 4: Create labs table
CREATE TABLE IF NOT EXISTS public.labs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location text,
  contact_info text,
  services text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Step 5: Create lab_users junction table
CREATE TABLE IF NOT EXISTS public.lab_users (
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  lab_id uuid REFERENCES public.labs(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, lab_id)
);

-- Step 6: Create lab_reports table
CREATE TABLE IF NOT EXISTS public.lab_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES public.patients(user_id) ON DELETE CASCADE,
  lab_id uuid REFERENCES public.labs(id) ON DELETE SET NULL,
  file_url text,
  test_paper_url text,
  test_type text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  report_date date DEFAULT now(),
  remarks text,
  assigned_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Step 7: Create appointments table
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

-- Step 8: Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  message text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.labs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for all tables (backend uses service role)
DROP POLICY IF EXISTS "Allow all operations on users" ON public.users;
CREATE POLICY "Allow all operations on users" ON public.users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations on patients" ON public.patients;
CREATE POLICY "Allow all operations on patients" ON public.patients FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations on doctors" ON public.doctors;
CREATE POLICY "Allow all operations on doctors" ON public.doctors FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations on labs" ON public.labs;
CREATE POLICY "Allow all operations on labs" ON public.labs FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations on lab_users" ON public.lab_users;
CREATE POLICY "Allow all operations on lab_users" ON public.lab_users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations on lab_reports" ON public.lab_reports;
CREATE POLICY "Allow all operations on lab_reports" ON public.lab_reports FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations on appointments" ON public.appointments;
CREATE POLICY "Allow all operations on appointments" ON public.appointments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations on notifications" ON public.notifications;
CREATE POLICY "Allow all operations on notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON public.patients(user_id);
CREATE INDEX IF NOT EXISTS idx_doctors_user_id ON public.doctors(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON public.appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_patient_file_url ON public.appointments(patient_file_url);
CREATE INDEX IF NOT EXISTS idx_lab_reports_patient_id ON public.lab_reports(patient_id);
CREATE INDEX IF NOT EXISTS idx_lab_reports_lab_id ON public.lab_reports(lab_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);

-- Verify all tables were created
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name IN ('users', 'patients', 'doctors', 'labs', 'lab_users', 'lab_reports', 'appointments', 'notifications')
ORDER BY table_name, ordinal_position;
