# Fix Course Assignment Mismatch

## Problem
The courses are assigned in the database, but the teacher dashboard shows "No courses assigned". This happens when the logged-in teacher's user ID doesn't match the `trainer_id` stored in the courses table.

## Solution

### Step 1: Check the Logged-In Teacher's User ID

1. Open the teacher dashboard in your browser
2. Open Developer Console (F12)
3. Look for a log message like: `👤 Logged in teacher user: { id: '...', email: '...' }`
4. **Note down the `id` value** - this is the teacher's actual user ID

### Step 2: Check What trainer_id is Set in Courses

Run this SQL in Supabase SQL Editor:

```sql
-- Check courses and their trainer_id
SELECT 
    id as course_id,
    title,
    trainer_id,
    'This trainer_id should match the teacher user ID from Step 1' as note
FROM public.courses
WHERE title IN ('AI', 'Xrays Course');
```

### Step 3: Compare and Fix

If the `trainer_id` in courses doesn't match the teacher's user ID from Step 1, run this SQL:

```sql
-- Replace 'TEACHER_USER_ID_FROM_STEP_1' with the actual ID from Step 1
-- Replace 'teacher@gmail.com' with the actual teacher email

UPDATE public.courses
SET trainer_id = (
    SELECT id FROM public.users 
    WHERE email = 'teacher@gmail.com' 
    AND role = 'teacher'
)
WHERE title IN ('AI', 'Xrays Course');
```

Or if you know the exact user ID:

```sql
UPDATE public.courses
SET trainer_id = 'TEACHER_USER_ID_FROM_STEP_1'
WHERE title IN ('AI', 'Xrays Course');
```

### Step 4: Verify

After running the UPDATE, refresh the teacher dashboard. The courses should now appear.

## Alternative: Use the Diagnostic SQL

Run `supabase/check-teacher-user-id.sql` which will:
1. Show the teacher's user ID
2. Show the trainer_id in courses
3. Compare them and show if they match
4. Provide a fix query if they don't match

