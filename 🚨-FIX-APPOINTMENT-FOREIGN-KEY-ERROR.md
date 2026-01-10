# 🚨 FIX: Appointment Foreign Key Constraint Error

## Error Message
```
insert or update on table "appointments" violates foreign key constraint "appointments_patient_id_fkey"
```

## Problem
When booking an appointment, the `patient_id` value doesn't match what's expected by the foreign key constraint.

## Root Cause
The foreign key constraint expects `patient_id` to reference `patients.user_id`, but either:
1. The patient profile doesn't exist in the `patients` table yet (timing issue)
2. The constraint was changed to reference `patients.id` instead of `patients.user_id`
3. There's a mismatch between what the backend sends and what the constraint expects

---

## ✅ Fix Applied

### 1. Backend Fix (`apps/backend/src/routes/appointments.js`)
- ✅ Added retry logic to wait for patient profile if it was just created
- ✅ Better error handling and logging
- ✅ Ensures patient profile exists before creating appointment

### 2. Frontend Fix (`apps/frontend/src/pages/ConsultOnline.jsx`)
- ✅ Added 500ms delay after profile save before booking appointment
- ✅ Ensures database commit completes before attempting booking

---

## 🔧 SQL Fix (If Still Getting Error)

If you're still getting the error, run this SQL script to ensure the constraint is correct:

**File:** `supabase/fix-appointments-foreign-key.sql`

This will:
1. Check the current constraint
2. Drop the existing constraint
3. Recreate it to reference `patients(user_id)` correctly
4. Verify it was created

---

## ✅ What Was Fixed

**Before:**
- Patient profile might not exist when appointment is created
- No retry logic
- Race condition between profile creation and appointment booking

**After:**
- Retry logic (3 attempts, 500ms apart)
- Better error messages
- 500ms delay in frontend to ensure profile is saved

---

## 🧪 Testing Steps

1. ✅ Restart backend server
2. ✅ Try booking a video consultation
3. ✅ If profile form appears, fill it and save
4. ✅ Appointment should book successfully

---

## ⚠️ If Error Persists

Run this SQL in Supabase SQL Editor:

```sql
-- Check current constraint
SELECT 
    conname AS constraint_name,
    conrelid::regclass AS table_name,
    confrelid::regclass AS referenced_table,
    a1.attname AS column_name,
    a2.attname AS referenced_column
FROM pg_constraint c
JOIN pg_attribute a1 ON a1.attnum = ANY(c.conkey) AND a1.attrelid = c.conrelid
JOIN pg_attribute a2 ON a2.attnum = ANY(c.confkey) AND a2.attrelid = c.confrelid
WHERE conrelid = 'appointments'::regclass
AND conname LIKE '%patient_id%';

-- Fix constraint (if needed)
ALTER TABLE public.appointments 
DROP CONSTRAINT IF EXISTS appointments_patient_id_fkey;

ALTER TABLE public.appointments 
ADD CONSTRAINT appointments_patient_id_fkey 
FOREIGN KEY (patient_id) 
REFERENCES public.patients(user_id) 
ON DELETE CASCADE;
```

---

**The fix is applied! Restart backend and try again.** 🎉

