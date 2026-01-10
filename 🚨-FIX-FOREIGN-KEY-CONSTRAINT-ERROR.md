# 🚨 FIX: Foreign Key Constraint Error

## Error Message
```
ERROR: 42830: there is no unique constraint matching given keys for referenced table "patients"
```

## Problem
The foreign key constraint cannot be created because:
- The `patients` table structure might have been changed (migrated to allow multiple profiles per user)
- The constraint is trying to reference `patients(user_id)` which may no longer be unique
- Foreign keys require the referenced column to have a UNIQUE constraint or be a PRIMARY KEY

---

## ✅ Solution

I've created **two SQL scripts** to fix this:

### Option 1: Simple Fix (Recommended)
**File:** `supabase/fix-appointments-foreign-key-simple.sql`

This script:
1. ✅ Checks if `patients` table has `id` column (migrated schema)
2. ✅ Drops the broken constraint
3. ✅ Creates the correct constraint based on your schema:
   - If `patients.id` exists → Uses `appointments.patient_id → patients.id`
   - If not → Uses `appointments.patient_id → patients.user_id`

### Option 2: Comprehensive Fix
**File:** `supabase/fix-appointments-foreign-key-correct.sql`

This is a more detailed version with better error handling.

---

## 📋 Steps to Fix

### Step 1: Run the Simple Fix Script

1. Open Supabase SQL Editor
2. Copy the contents of: `supabase/fix-appointments-foreign-key-simple.sql`
3. Paste and run it
4. Check the output messages - it will tell you which constraint was created

### Step 2: Update Backend Code (If Needed)

After running the SQL, the backend needs to use the correct patient_id:

- If constraint uses `patients(id)` → Backend should use `patient.id`
- If constraint uses `patients(user_id)` → Backend should use `patient.user_id`

I've already updated the backend to handle both cases automatically.

---

## 🔧 What the Script Does

1. **Drops** the broken constraint
2. **Checks** which schema you're using:
   - Migrated schema (has `patients.id` column)
   - Original schema (`patients.user_id` is primary key)
3. **Creates** the correct constraint:
   - Migrated: `appointments.patient_id → patients.id`
   - Original: `appointments.patient_id → patients.user_id`
4. **Updates** existing appointments to use the correct IDs

---

## ✅ After Running the Script

1. The constraint will be correctly created
2. Appointment booking should work
3. Foreign key errors should be resolved

---

**Run the simple fix script and the error should be resolved!** 🎉

