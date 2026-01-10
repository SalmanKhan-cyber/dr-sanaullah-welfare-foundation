# 🚨 URGENT: Fix Foreign Key Constraint Error

## Error
```
ERROR: 42830: there is no unique constraint matching given keys for referenced table "patients"
```

## Problem
The constraint is trying to reference `patients(user_id)`, but `user_id` is no longer unique (after migration that allows multiple profiles per user).

---

## ✅ QUICK FIX

### Option 1: Run This SQL Script (RECOMMENDED)

**File:** `supabase/fix-appointments-constraint-working.sql`

This script:
1. Checks if `patients` table has `id` column (migrated schema)
2. Creates the correct constraint:
   - If migrated: `appointments.patient_id → patients(id)` ✅
   - If original: `appointments.patient_id → patients(user_id)`

**OR** run this simple SQL:

```sql
-- Drop broken constraint
ALTER TABLE public.appointments 
DROP CONSTRAINT IF EXISTS appointments_patient_id_fkey;

-- Check if patients has 'id' column
-- If yes, use this:
ALTER TABLE public.appointments 
ADD CONSTRAINT appointments_patient_id_fkey 
FOREIGN KEY (patient_id) 
REFERENCES public.patients(id) 
ON DELETE CASCADE;

-- If patients doesn't have 'id' column, use this instead:
-- ALTER TABLE public.appointments 
-- ADD CONSTRAINT appointments_patient_id_fkey 
-- FOREIGN KEY (patient_id) 
-- REFERENCES public.patients(user_id) 
-- ON DELETE CASCADE;
```

### Option 2: Check Your Schema First

Run this to check your patients table structure:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'patients'
ORDER BY ordinal_position;
```

**If you see an `id` column:**
- Use constraint: `appointments.patient_id → patients(id)`
- Backend will automatically use `patient.id`

**If you DON'T see an `id` column:**
- Use constraint: `appointments.patient_id → patients(user_id)`
- But `user_id` must be unique (primary key)

---

## 🔧 Backend Already Fixed

The backend code has been updated to:
- ✅ Use `patient.id` if it exists (migrated schema)
- ✅ Fallback to `patient.user_id` (original schema)
- ✅ Handle both cases automatically

---

## ✅ Steps

1. **Run the SQL script** (`fix-appointments-constraint-working.sql`)
2. **Restart backend**
3. **Try booking again** - should work!

---

**The script automatically detects your schema and creates the correct constraint!** 🎉

