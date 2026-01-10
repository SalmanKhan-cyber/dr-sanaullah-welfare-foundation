-- Update urgency check constraint to allow 'normal', 'urgent', 'critical', and 'emergency'
-- Run this in Supabase SQL Editor

-- Drop the existing constraint
ALTER TABLE public.blood_requests 
DROP CONSTRAINT IF EXISTS blood_requests_urgency_check;

-- Add the updated constraint with all urgency levels
ALTER TABLE public.blood_requests 
ADD CONSTRAINT blood_requests_urgency_check 
CHECK (urgency IN ('normal', 'urgent', 'critical', 'emergency'));

