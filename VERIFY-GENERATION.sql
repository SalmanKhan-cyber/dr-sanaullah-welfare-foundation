-- Check if appointment sheet was generated after test
SELECT 
    id,
    appointment_sheet_url,
    appointment_sheet_url IS NOT NULL as has_sheet,
    updated_at
FROM appointments 
WHERE id = 'abd6b153-1109-43ed-b98b-b3de08856dd4';
