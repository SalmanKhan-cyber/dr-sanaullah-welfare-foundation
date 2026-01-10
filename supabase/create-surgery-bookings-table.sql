-- Create surgery_bookings table for storing surgery consultation requests
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.surgery_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name text NOT NULL,
  phone text NOT NULL,
  city text,
  surgery_type text NOT NULL, -- e.g., "Piles Surgery", "Hip Replacement Surgery"
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'confirmed', 'completed', 'cancelled')),
  remarks text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_surgery_bookings_status ON public.surgery_bookings(status);
CREATE INDEX IF NOT EXISTS idx_surgery_bookings_created_at ON public.surgery_bookings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_surgery_bookings_surgery_type ON public.surgery_bookings(surgery_type);

-- Enable RLS
ALTER TABLE public.surgery_bookings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to allow re-running this script)
DROP POLICY IF EXISTS "Public can create surgery bookings" ON public.surgery_bookings;
DROP POLICY IF EXISTS "Admins can view all surgery bookings" ON public.surgery_bookings;
DROP POLICY IF EXISTS "Admins can update surgery bookings" ON public.surgery_bookings;
DROP POLICY IF EXISTS "Service role has full access" ON public.surgery_bookings;

-- RLS Policies
-- Public can create bookings (for the booking form)
CREATE POLICY "Public can create surgery bookings"
  ON public.surgery_bookings FOR INSERT
  TO public
  WITH CHECK (true);

-- Admins can view all bookings
CREATE POLICY "Admins can view all surgery bookings"
  ON public.surgery_bookings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update bookings
CREATE POLICY "Admins can update surgery bookings"
  ON public.surgery_bookings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Service role (backend) has full access
CREATE POLICY "Service role has full access"
  ON public.surgery_bookings FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Verify table was created
SELECT id, patient_name, phone, city, surgery_type, status, created_at
FROM public.surgery_bookings
LIMIT 0;

