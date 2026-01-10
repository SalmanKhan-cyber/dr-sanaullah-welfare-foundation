-- Add contact_number column to blood_requests table
-- This allows storing contact numbers for blood requests so admin can contact the requester
-- Run this in Supabase SQL Editor

-- Add contact_number column if it doesn't exist
ALTER TABLE public.blood_requests 
ADD COLUMN IF NOT EXISTS contact_number text;

-- Add a comment to document the column
COMMENT ON COLUMN public.blood_requests.contact_number IS 'Contact number where admin can reach the requester';

