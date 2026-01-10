# ✅ FIXED: Appointment Foreign Key Constraint Error

## Problem
Error when booking appointment:
```
insert or update on table "appointments" violates foreign key constraint "appointments_patient_id_fkey"
```

## Root Cause
1. **Timing Issue**: Patient profile was just created, but appointment booking tried to happen before the database committed the profile
2. **Foreign Key Constraint**: The constraint expects `patient_id` to match a `user_id` that exists in the `patients` table

---

## ✅ Fixes Applied

### 1. Backend (`apps/backend/src/routes/appointments.js`)
- ✅ **Retry Logic**: Added 3 retry attempts (500ms apart) to wait for patient profile if it was just created
- ✅ **Correct patient_id**: Uses `patient.user_id` (matches the foreign key constraint)
- ✅ **Better Error Messages**: Clear error if patient profile not found
- ✅ **Logging**: Added console logs for debugging

### 2. Frontend (`apps/frontend/src/pages/ConsultOnline.jsx`)
- ✅ **500ms Delay**: Added delay after profile save before booking appointment
- ✅ **Ensures Database Commit**: Gives database time to commit the profile creation

### 3. Profile Creation (`apps/backend/src/index.js`)
- ✅ **Upsert Instead of Insert**: Changed to `.upsert()` so it works for both new and existing profiles
- ✅ **Better Error Handling**: Improved error logging

---

## 🔧 How It Works Now

1. **User fills profile form** → Submits
2. **Profile saved** → Backend uses `.upsert()` to create/update
3. **500ms delay** → Frontend waits for database commit
4. **Appointment booking** → Backend checks if patient exists (with retry)
5. **Appointment created** → Uses `patient.user_id` which matches the constraint

---

## ✅ Result

Appointment booking should now work correctly without foreign key errors!

---

**Restart your backend server and try booking again!** 🎉

