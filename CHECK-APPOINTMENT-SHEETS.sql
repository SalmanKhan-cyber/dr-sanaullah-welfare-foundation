-- Generate Appointment Sheets for Existing Appointments
-- This script generates appointment sheets for all existing appointments that don't have them

-- First, let's see how many appointments are missing appointment sheets
SELECT 
    COUNT(*) as total_appointments,
    COUNT(appointment_sheet_url) as appointments_with_sheets,
    COUNT(*) - COUNT(appointment_sheet_url) as appointments_missing_sheets
FROM appointments;

-- List appointments that are missing appointment sheets
SELECT 
    a.id,
    a.appointment_date,
    a.appointment_time,
    a.status,
    d.name as doctor_name,
    p.name as patient_name,
    a.appointment_sheet_url IS NULL as missing_sheet
FROM appointments a
LEFT JOIN doctors d ON a.doctor_id = d.id
LEFT JOIN patients p ON a.patient_id = p.id
WHERE a.appointment_sheet_url IS NULL
ORDER BY a.appointment_date DESC, a.appointment_time DESC;

-- Check if appointment_sheet_url column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'appointments'
AND column_name = 'appointment_sheet_url';
