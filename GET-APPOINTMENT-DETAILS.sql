-- Get complete appointment details for testing
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
