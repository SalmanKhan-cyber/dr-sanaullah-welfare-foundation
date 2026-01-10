-- Create labs table for registered laboratory facilities
CREATE TABLE IF NOT EXISTS public.labs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location text,
  contact_info text,
  services text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Update lab_reports to link to labs
ALTER TABLE public.lab_reports
ADD COLUMN IF NOT EXISTS lab_id uuid REFERENCES public.labs(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS test_type text,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
ADD COLUMN IF NOT EXISTS assigned_at timestamptz;

-- Create lab_users junction table to link Lab to labs
CREATE TABLE IF NOT EXISTS public.lab_users (
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  lab_id uuid REFERENCES public.labs(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, lab_id)
);

-- Enable RLS
ALTER TABLE public.labs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to allow re-running this script)
DROP POLICY IF EXISTS "Allow all operations on labs" ON public.labs;
DROP POLICY IF EXISTS "Allow all operations on lab_users" ON public.lab_users;

-- RLS policies for labs (allow all for backend service role)
CREATE POLICY "Allow all operations on labs" ON public.labs
  FOR ALL USING (true) WITH CHECK (true);

-- RLS policies for lab_users (allow all for backend service role)
CREATE POLICY "Allow all operations on lab_users" ON public.lab_users
  FOR ALL USING (true) WITH CHECK (true);

-- Insert sample labs
INSERT INTO public.labs (name, location, contact_info, services) VALUES
('City Diagnostic Lab', 'Karachi', 'Tel: 021-12345678', ARRAY['Blood Tests', 'X-Ray', 'Ultrasound', 'ECG']),
('MedLab Pakistan', 'Lahore', 'Tel: 042-87654321', ARRAY['Blood Tests', 'CT Scan', 'MRI', 'Cardiac Tests']),
('Advanced Pathology Lab', 'Islamabad', 'Tel: 051-11223344', ARRAY['Blood Tests', 'Histopathology', 'Allergy Tests']),
('Quick Test Labs', 'Peshawar', 'Tel: 091-44332211', ARRAY['Blood Tests', 'Urine Tests', 'Basic Tests'])
ON CONFLICT DO NOTHING;

-- Verify
SELECT * FROM public.labs;

