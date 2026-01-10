-- Add requester_name column to blood_requests table
-- Stores the name provided when placing a blood request
-- Run this in Supabase SQL Editor

ALTER TABLE public.blood_requests
ADD COLUMN IF NOT EXISTS requester_name text;

COMMENT ON COLUMN public.blood_requests.requester_name IS 'Name of the requester to contact';

