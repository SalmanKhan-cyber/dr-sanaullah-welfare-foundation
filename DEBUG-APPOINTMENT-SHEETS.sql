-- Manual Appointment Sheet Generation Script
-- This script helps identify appointments that need appointment sheets generated

-- Check recent appointments that should have appointment sheets
SELECT 
    a.id,
    a.appointment_date,
    a.appointment_time,
    a.status,
    a.appointment_sheet_url,
    d.name as doctor_name,
    d.specialization,
    p.name as patient_name,
    p.age,
    p.gender,
    CASE 
        WHEN a.appointment_sheet_url IS NULL THEN '❌ Missing Sheet'
        ELSE '✅ Has Sheet'
    END as sheet_status
FROM appointments a
LEFT JOIN doctors d ON a.doctor_id = d.id
LEFT JOIN patients p ON a.patient_id = p.id
WHERE a.appointment_date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY a.appointment_date DESC, a.appointment_time DESC;

-- Check if the appointment-sheets bucket exists and has policies
SELECT 
    id, 
    name, 
    public, 
    file_size_limit, 
    allowed_mime_types,
    created_at
FROM storage.buckets 
WHERE id = 'appointment-sheets';

-- Check RLS policies for appointment-sheets bucket
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%appointment-sheets%';
