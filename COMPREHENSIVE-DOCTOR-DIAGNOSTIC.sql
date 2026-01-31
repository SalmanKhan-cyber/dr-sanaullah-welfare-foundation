-- Comprehensive Doctor Issue Diagnostic Script
-- This script helps identify all doctor-related issues

-- Step 1: Check all users with doctor role
SELECT 
  u.id as user_id,
  u.email,
  u.name as user_name,
  u.role,
  u.verified,
  u.created_at as user_created_at,
  CASE 
    WHEN d.id IS NULL THEN 'NO DOCTOR PROFILE'
    ELSE 'HAS DOCTOR PROFILE'
  END as profile_status
FROM users u
LEFT JOIN doctors d ON u.id = d.user_id
WHERE u.role = 'doctor'
ORDER BY u.created_at DESC;

-- Step 2: Check all doctors and their user links
SELECT 
  d.id as doctor_id,
  d.name as doctor_name,
  d.specialization,
  d.user_id,
  d.created_at as doctor_created_at,
  u.email as linked_email,
  u.name as linked_user_name,
  u.role as linked_user_role,
  u.verified as linked_user_verified,
  u.created_at as user_created_at,
  CASE 
    WHEN d.user_id IS NULL THEN 'MISSING USER_ID'
    WHEN u.id IS NULL THEN 'USER_ID EXISTS BUT USER NOT FOUND'
    WHEN u.role != 'doctor' THEN 'USER ROLE NOT DOCTOR'
    ELSE 'PROPERLY LINKED'
  END as link_status
FROM doctors d
LEFT JOIN users u ON d.user_id = u.id
ORDER BY d.created_at DESC;

-- Step 3: Find duplicate emails (potential conflict)
SELECT 
  email,
  COUNT(*) as user_count,
  STRING_AGG(role, ', ') as roles,
  STRING_AGG(id::text, ', ') as user_ids
FROM users
WHERE email IS NOT NULL
GROUP BY email
HAVING COUNT(*) > 1;

-- Step 4: Find duplicate doctor names
SELECT 
  name,
  COUNT(*) as profile_count,
  STRING_AGG(id::text, ', ') as doctor_ids,
  STRING_AGG(user_id::text, ', ') as linked_user_ids
FROM doctors
WHERE name IS NOT NULL
GROUP BY name
HAVING COUNT(*) > 1;

-- Step 5: Check for doctors without user_id
SELECT 
  id as doctor_id,
  name,
  specialization,
  'MISSING USER_ID - CANNOT LOGIN' as issue
FROM doctors
WHERE user_id IS NULL;

-- Step 6: Check for orphaned user accounts (doctor role but no profile)
SELECT 
  u.id as user_id,
  u.email,
  u.name as user_name,
  u.verified,
  'DOCTOR ROLE BUT NO PROFILE - NEEDS PROFILE CREATION' as issue
FROM users u
LEFT JOIN doctors d ON u.id = d.user_id
WHERE u.role = 'doctor' 
AND d.id IS NULL;
