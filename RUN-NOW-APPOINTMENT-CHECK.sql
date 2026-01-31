-- Check Appointment Sheet Status
-- Run this query to see the current state of appointment sheets

-- Check total appointments vs those with sheets
SELECT 
    COUNT(*) as total_appointments,
    COUNT(appointment_sheet_url) as appointments_with_sheets,
    COUNT(*) - COUNT(appointment_sheet_url) as appointments_missing_sheets,
    ROUND(
        (COUNT(appointment_sheet_url)::decimal / COUNT(*)) * 100, 2
    ) as percentage_with_sheets
FROM appointments;

-- List recent appointments that are missing appointment sheets
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
    AND a.appointment_date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY a.appointment_date DESC, a.appointment_time DESC
LIMIT 10;
