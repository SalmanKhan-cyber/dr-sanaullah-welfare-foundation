-- Add contact_number and requester_name columns to blood_requests table
-- This allows storing contact information for blood requests so admin can contact the requester
-- Run this in Supabase SQL Editor

-- Add contact_number column if it doesn't exist
ALTER TABLE public.blood_requests 
ADD COLUMN IF NOT EXISTS contact_number text;

-- Add requester_name column if it doesn't exist
ALTER TABLE public.blood_requests 
ADD COLUMN IF NOT EXISTS requester_name text;

-- Add comments to document the columns
COMMENT ON COLUMN public.blood_requests.contact_number IS 'Contact number where admin can reach the requester';
COMMENT ON COLUMN public.blood_requests.requester_name IS 'Name of the requester to contact';

