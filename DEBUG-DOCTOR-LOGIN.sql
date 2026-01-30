-- Debug Doctor Login Issue
-- This script helps identify why doctors still can't see their profiles

-- Step 1: Check all users with doctor role
SELECT 
  u.id as user_id,
  u.email,
  u.name as user_name,
  u.role,
  u.verified,
  u.created_at as user_created_at
FROM users u
WHERE u.role = 'doctor'
ORDER BY u.email;

-- Step 2: Check all doctors and their linked users
SELECT 
  d.id as doctor_id,
  d.name as doctor_name,
  d.specialization,
  d.user_id,
  u.email as linked_email,
  u.name as linked_user_name,
  u.role as linked_user_role,
  u.verified as linked_user_verified,
  CASE 
    WHEN d.user_id IS NULL THEN 'NO USER LINKED'
    WHEN u.id IS NULL THEN 'LINKED USER NOT FOUND'
    ELSE 'PROPERLY LINKED'
  END as link_status
FROM doctors d
LEFT JOIN users u ON d.user_id = u.id
ORDER BY d.name;

-- Step 3: Find potential mismatches (doctors with same name but different users)
SELECT 
  d.name as doctor_name,
  COUNT(*) as profile_count,
  STRING_AGG(u.email, ', ') as linked_emails,
  STRING_AGG(u.id::text, ', ') as linked_user_ids
FROM doctors d
LEFT JOIN users u ON d.user_id = u.id
GROUP BY d.name
HAVING COUNT(*) > 1;

-- Step 4: Check for users with doctor role but no profile
SELECT 
  u.id as user_id,
  u.email,
  u.name as user_name,
  u.role,
  u.verified,
  CASE 
    WHEN d.id IS NULL THEN 'NO DOCTOR PROFILE'
    ELSE 'HAS PROFILE'
  END as profile_status
FROM users u
LEFT JOIN doctors d ON u.id = d.user_id
WHERE u.role = 'doctor'
AND d.id IS NULL;
