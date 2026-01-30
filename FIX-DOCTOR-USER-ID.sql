-- Fix Doctor Profile User ID Issues
-- This script fixes missing user_id in doctor profiles

-- Step 1: Update doctors created by admin to link to correct user accounts
-- This matches doctors by name and links them to the corresponding user account
UPDATE doctors d
SET user_id = u.id
FROM users u
WHERE d.user_id IS NULL 
AND u.name = d.name
AND u.role = 'doctor';

-- Step 2: For any remaining doctors without user_id, create user accounts
-- This creates a user account for doctors who don't have one
INSERT INTO users (id, name, email, role, verified)
SELECT 
  gen_random_uuid() as id,
  d.name,
  'doctor_' || REPLACE(LOWER(d.name), ' ', '_') || '@dswf.local' as email, -- Create a unique email
  'doctor' as role,
  true as verified
FROM doctors d
WHERE d.user_id IS NULL
AND NOT EXISTS (
  SELECT 1 FROM users u WHERE u.email = 'doctor_' || REPLACE(LOWER(d.name), ' ', '_') || '@dswf.local'
);

-- Step 3: Link the newly created user accounts to doctors
UPDATE doctors d
SET user_id = u.id
FROM users u
WHERE d.user_id IS NULL 
AND u.email = 'doctor_' || REPLACE(LOWER(d.name), ' ', '_') || '@dswf.local'
AND u.role = 'doctor';

-- Step 4: Verify the fixes
SELECT 
  d.id,
  d.user_id,
  d.name,
  d.specialization,
  u.email as user_email,
  u.role as user_role,
  CASE 
    WHEN d.user_id IS NULL THEN 'STILL MISSING USER_ID'
    WHEN u.id IS NULL THEN 'USER_ID EXISTS BUT USER NOT FOUND'
    ELSE 'FIXED - USER_ID AND USER BOTH EXIST'
  END as status
FROM doctors d
LEFT JOIN users u ON d.user_id = u.id
ORDER BY d.name;
