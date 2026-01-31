-- Test Manual Appointment Sheet Generation
-- Use one of the appointment IDs from your results to test manual generation

-- Test with the most recent appointment: abd6b153-1109-43ed-b98b-b3de08856dd4
-- You can make a POST request to: /api/debug/generate-appointment-sheet/abd6b153-1109-43ed-b98b-b3de08856dd4

-- First, let's get complete details for this appointment
SELECT 
    a.id as appointment_id,
    a.appointment_date,
    a.appointment_time,
    a.status,
    a.reason,
    a.consultation_fee,
    d.id as doctor_id,
    d.name as doctor_name,
    d.specialization,
    d.user_id as doctor_user_id,
    p.id as patient_id,
    p.name as patient_name,
    p.age,
    p.gender,
    p.phone,
    p.user_id as patient_user_id
FROM appointments a
LEFT JOIN doctors d ON a.doctor_id = d.id
LEFT JOIN patients p ON a.patient_id = p.id
WHERE a.id = 'abd6b153-1109-43ed-b98b-b3de08856dd4';

-- After running the above query, you can test the manual generation:
-- 1. Login as the patient (user_id: from the query result)
-- 2. Make a POST request to: /api/debug/generate-appointment-sheet/abd6b153-1109-43ed-b98b-b3de08856dd4
-- 3. Check the response and backend logs for detailed information

-- Alternative: Test with curl (replace YOUR_JWT_TOKEN with actual token)
/*
curl -X POST http://localhost:4000/api/debug/generate-appointment-sheet/abd6b153-1109-43ed-b98b-b3de08856dd4 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
*/

-- Check if the appointment sheet was generated after the test
SELECT 
    id,
    appointment_sheet_url,
    appointment_sheet_url IS NOT NULL as has_sheet
FROM appointments 
WHERE id = 'abd6b153-1109-43ed-b98b-b3de08856dd4';
