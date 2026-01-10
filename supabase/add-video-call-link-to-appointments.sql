-- Add video_call_link column to appointments table for storing video call meeting URLs
-- Run this in Supabase SQL Editor

-- Add video_call_link column
ALTER TABLE public.appointments 
ADD COLUMN IF NOT EXISTS video_call_link TEXT;

-- Add index for faster queries (only indexes non-null values)
CREATE INDEX IF NOT EXISTS idx_appointments_video_call_link 
ON public.appointments(video_call_link) 
WHERE video_call_link IS NOT NULL;

-- Add comment to document the column
COMMENT ON COLUMN public.appointments.video_call_link IS 'URL to join video call (e.g., Jitsi Meet room link)';

-- Verify column was added
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'appointments' 
AND column_name = 'video_call_link';

