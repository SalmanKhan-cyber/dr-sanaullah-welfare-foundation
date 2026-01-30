-- Create Missing Lab Reports Table
-- This script creates the lab_reports table that's missing from your database

-- Create the lab_reports table
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

-- Enable RLS on the table
ALTER TABLE public.lab_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for lab_reports
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all operations on lab_reports" ON public.lab_reports;

-- Allow all operations for service role (backend)
CREATE POLICY "Allow all operations on lab_reports" ON public.lab_reports
  FOR ALL USING (true) WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_lab_reports_patient_id ON public.lab_reports(patient_id);
CREATE INDEX IF NOT EXISTS idx_lab_reports_lab_id ON public.lab_reports(lab_id);
CREATE INDEX IF NOT EXISTS idx_lab_reports_status ON public.lab_reports(status);

-- Verify table creation
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'lab_reports'
ORDER BY ordinal_position;
