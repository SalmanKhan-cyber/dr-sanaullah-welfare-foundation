-- Create Donations Table (Missing)
-- This script creates the donations table if it doesn't exist

CREATE TABLE IF NOT EXISTS public.donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL CHECK (amount > 0),
  purpose text,
  receipt_url text,
  donor_type text DEFAULT 'individual' CHECK (donor_type IN ('individual', 'organization')),
  cnic text,
  passport_number text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on the table
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Create policies for donations
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all operations on donations" ON public.donations;

-- Allow all operations for service role (backend)
CREATE POLICY "Allow all operations on donations" ON public.donations
  FOR ALL USING (true) WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_donations_donor_id ON public.donations(donor_id);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON public.donations(created_at);

-- Verify table creation
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'donations'
ORDER BY ordinal_position;
