-- Clean up Doctor Profiles
-- This script fixes duplicate doctor profiles and incorrect role assignments

-- Step 1: Fix incorrect role assignment
UPDATE users 
SET role = 'doctor' 
WHERE email = 'kik@gmail.com' AND role = 'admin';

-- Step 2: Identify and remove duplicate doctor profiles
-- Keep the most recent entry (usually the last one created)

-- For Dr. Salman - keep the last one (most recent)
DELETE FROM doctors 
WHERE name = 'Dr. Salman' 
AND id != (SELECT id FROM doctors WHERE name = 'Dr. Salman' ORDER BY id DESC LIMIT 1);

-- For UmaR hayat - keep the last one (most recent)  
DELETE FROM doctors 
WHERE name = 'UmaR hayat' 
AND id != (SELECT id FROM doctors WHERE name = 'UmaR hayat' ORDER BY id DESC LIMIT 1);

-- Step 3: Update null specializations with reasonable defaults
UPDATE doctors 
SET specialization = 'General Physician' 
WHERE specialization IS NULL AND name ILIKE '%dr%';

-- Step 4: Verify the cleanup
SELECT 
  d.name,
  COUNT(*) as duplicate_count,
  STRING_AGG(d.id::text, ', ') as doctor_ids
FROM doctors d
GROUP BY d.name
HAVING COUNT(*) > 1;

-- Step 5: Show final doctor list
SELECT 
  d.id,
  d.user_id,
  d.name,
  d.specialization,
  u.email as user_email,
  u.role as user_role,
  u.verified as user_verified,
  CASE 
    WHEN d.user_id IS NULL THEN 'STILL MISSING USER_ID'
    WHEN u.id IS NULL THEN 'USER_ID EXISTS BUT USER NOT FOUND'
    ELSE 'FIXED - USER_ID AND USER BOTH EXIST'
  END as status
FROM doctors d
LEFT JOIN users u ON d.user_id = u.id
ORDER BY d.name;
