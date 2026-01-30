-- Doctor Login Mapping Script
-- This shows which email doctors should use to login

-- Create a comprehensive mapping of doctors to their correct login emails
SELECT 
  d.name as doctor_name,
  d.specialization,
  d.user_id as linked_user_id,
  u.email as login_email,
  u.name as account_name,
  u.verified as is_verified,
  u.role as account_role,
  CASE 
    WHEN u.email LIKE '%@dswf.local' THEN 'GENERATED ACCOUNT - Use this email to login'
    WHEN u.email LIKE '%@gmail.com' OR u.email LIKE '%@yahoo.com' THEN 'ORIGINAL EMAIL - Use this email to login'
    ELSE 'OTHER EMAIL - Use this email to login'
  END as login_instruction
FROM doctors d
LEFT JOIN users u ON d.user_id = u.id
ORDER BY d.name;

-- Show any doctors that might have multiple user accounts
WITH doctor_duplicates AS (
  SELECT 
    d.name as doctor_name,
    COUNT(*) as account_count,
    STRING_AGG(u.email, ' | ') as available_emails
  FROM doctors d
  LEFT JOIN users u ON d.user_id = u.id
  GROUP BY d.name
  HAVING COUNT(*) > 1
)
SELECT 
  dd.doctor_name,
  dd.account_count,
  dd.available_emails,
  'Multiple accounts found - Try each email above' as instruction
FROM doctor_duplicates dd;

-- Quick lookup for specific doctors (you can modify this)
SELECT 
  'Login Guide' as information,
  d.name as doctor_name,
  'Use this email to login:' as action,
  u.email as correct_email,
  'Password should be what you set for this account' as password_note
FROM doctors d
LEFT JOIN users u ON d.user_id = u.id
WHERE d.name IN ('Dr. Salman', 'UmaR hayat', 'Dr. Muhammad Afzaal Afridi PT')
ORDER BY d.name;
