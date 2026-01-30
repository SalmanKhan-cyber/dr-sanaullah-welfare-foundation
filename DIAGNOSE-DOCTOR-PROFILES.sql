-- Doctor Profile Diagnostic Script
-- This script helps identify why doctors can't see their profiles

-- Check if doctors table exists and has user_id column
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'doctors'
ORDER BY ordinal_position;

-- Check all doctors in the system
SELECT 
  d.id,
  d.user_id,
  d.name,
  d.specialization,
  u.email as user_email,
  u.role as user_role,
  u.verified as user_verified,
  u.created_at as user_created_at
FROM doctors d
LEFT JOIN users u ON d.user_id = u.id
ORDER BY u.created_at DESC;

-- Check for doctors without user_id (this would cause the issue)
SELECT 
  d.id,
  d.name,
  d.specialization,
  d.user_id,
  CASE 
    WHEN d.user_id IS NULL THEN 'MISSING USER_ID - THIS IS THE PROBLEM'
    WHEN u.id IS NULL THEN 'USER_ID EXISTS BUT USER NOT FOUND'
    ELSE 'USER_ID AND USER BOTH EXIST'
  END as status
FROM doctors d
LEFT JOIN users u ON d.user_id = u.id
WHERE d.user_id IS NULL OR u.id IS NULL;

-- Check if there are any users with doctor role but no doctor profile
SELECT 
  u.id,
  u.email,
  u.name,
  u.role,
  u.verified,
  u.created_at,
  CASE 
    WHEN d.id IS NULL THEN 'DOCTOR ROLE BUT NO PROFILE'
    ELSE 'HAS DOCTOR PROFILE'
  END as status
FROM users u
LEFT JOIN doctors d ON u.id = d.user_id
WHERE u.role = 'doctor'
ORDER BY u.created_at DESC;
