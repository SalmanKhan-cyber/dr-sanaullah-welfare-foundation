-- Check if doctor profile exists for a user

-- Option 1: List all doctors and their users (EASIEST - no placeholders needed)
SELECT 
    d.id as doctor_id,
    d.name as doctor_name,
    d.specialization,
    d.user_id,
    u.email,
    u.name as user_name,
    u.verified,
    u.created_at as user_created_at
FROM public.doctors d
LEFT JOIN public.users u ON u.id = d.user_id
ORDER BY u.created_at DESC
LIMIT 20;

-- Option 2: Check by user email (replace 'your-email@example.com' with your actual email)
SELECT 
    u.id as user_id,
    u.email,
    u.name as user_name,
    u.verified,
    d.id as doctor_id,
    d.name as doctor_name,
    d.specialization,
    d.user_id as doctor_user_id
FROM public.users u
LEFT JOIN public.doctors d ON d.user_id = u.id
WHERE u.email = 'your-email@example.com';  -- Replace with your email

-- Option 3: Find users without doctor profiles (doctors who need profiles)
SELECT 
    u.id as user_id,
    u.email,
    u.name as user_name,
    u.verified,
    u.created_at as account_created_at
FROM public.users u
LEFT JOIN public.doctors d ON d.user_id = u.id
WHERE u.role = 'doctor'
AND d.id IS NULL  -- No doctor profile exists
ORDER BY u.created_at DESC;

