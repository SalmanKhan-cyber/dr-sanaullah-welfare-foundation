-- Test appointment sheet generation by checking recent appointments
-- This will help us see if the fix is working for new appointments

-- Check the 5 most recent appointments
SELECT 
    id,
    appointment_date,
    appointment_time,
    status,
    appointment_sheet_url,
    appointment_sheet_url IS NOT NULL as has_sheet,
    created_at,
    updated_at
FROM appointments 
ORDER BY created_at DESC 
LIMIT 5;

-- Check if there are any appointments with sheets at all
SELECT 
    COUNT(*) as total_appointments,
    COUNT(appointment_sheet_url) as appointments_with_sheets,
    COUNT(*) - COUNT(appointment_sheet_url) as appointments_missing_sheets
FROM appointments;

-- If you book a new appointment, run this to see if it has a sheet
SELECT 
    id,
    appointment_sheet_url,
    appointment_sheet_url IS NOT NULL as has_sheet,
    created_at
FROM appointments 
WHERE created_at >= CURRENT_TIMESTAMP - INTERVAL '10 minutes'
ORDER BY created_at DESC;
