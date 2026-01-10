-- Add additional fields for doctor self-registration
-- Execute in Supabase SQL editor

-- Add columns to doctors table if they don't exist
ALTER TABLE public.doctors 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS consultation_fee numeric(10,2),
ADD COLUMN IF NOT EXISTS timing text,
ADD COLUMN IF NOT EXISTS degrees text;

-- Add index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_doctors_user_id ON public.doctors(user_id);

-- Verify
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'doctors' 
ORDER BY ordinal_position;

