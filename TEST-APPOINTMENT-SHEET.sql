-- Manual Appointment Sheet Generation Test
-- This script helps test appointment sheet generation for existing appointments

-- First, let's get a specific appointment to test with
SELECT 
    a.id as appointment_id,
    a.appointment_date,
    a.appointment_time,
    a.status,
    d.name as doctor_name,
    d.id as doctor_id,
    p.name as patient_name,
    p.user_id as patient_user_id,
    p.age,
    p.gender,
    p.phone,
    a.reason
FROM appointments a
LEFT JOIN doctors d ON a.doctor_id = d.id
LEFT JOIN patients p ON a.patient_id = p.id
WHERE a.appointment_sheet_url IS NULL
ORDER BY a.appointment_date DESC, a.appointment_time DESC
LIMIT 1;

-- After you get the appointment details from above, 
-- you can test the appointment sheet generation by:
-- 1. Booking a new appointment and checking the backend logs
-- 2. Or creating a manual test endpoint to generate sheets

-- Check if the appointment-sheets bucket has any files
-- (This query shows storage bucket info, you'll need to check Supabase dashboard for actual files)
SELECT 
    id, 
    name, 
    public, 
    file_size_limit, 
    allowed_mime_types
FROM storage.buckets 
WHERE id = 'appointment-sheets';
