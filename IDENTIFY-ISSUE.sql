-- Fix Appointment Sheet Generation Issues
-- This script helps identify and resolve appointment sheet generation problems

-- Check if there are any appointments with sheets at all
SELECT 
    COUNT(*) as total_appointments,
    COUNT(appointment_sheet_url) as appointments_with_sheets,
    COUNT(*) - COUNT(appointment_sheet_url) as appointments_missing_sheets
FROM appointments;

-- Check the most recent appointments and their sheet status
SELECT 
    a.id,
    a.appointment_date,
    a.appointment_time,
    a.status,
    a.appointment_sheet_url IS NOT NULL as has_sheet,
    d.name as doctor_name,
    p.name as patient_name,
    CASE 
        WHEN a.appointment_sheet_url IS NULL THEN '❌ Missing Sheet'
        ELSE '✅ Has Sheet'
    END as sheet_status
FROM appointments a
LEFT JOIN doctors d ON a.doctor_id = d.id
LEFT JOIN patients p ON a.patient_id = p.id
ORDER BY a.appointment_date DESC, a.appointment_time DESC
LIMIT 10;

-- Check if there are any errors in recent logs (you'll need to check backend logs separately)
-- This query helps identify which appointments to test with
