# ✅ Fix: Duplicate user_id Error

## Problem
You're getting this error:
```
could not create unique index "patients_user_id_unique" 
Key (user_id) = (xxx) is duplicated.
```

This means you have **multiple patient profiles for the same user_id**, which is allowed after the migration. You **cannot** create a unique index on `user_id` because it's intentionally not unique.

---

## ✅ Solution: Use `patients.id` Instead

Since you have duplicates, you **MUST** use the migrated schema approach (using `patients.id`).

---

## 🎯 Quick Fix Steps

### **Step 1: Check if you have 'id' column**

Run this:
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_schema = 'public'
AND table_name = 'patients' 
AND column_name = 'id';
```

**If you see 'id' in results → Continue with Step 2**

**If NO 'id' → You need to add it first (run the migration script)**

---

### **Step 2: Drop old constraint**

```sql
ALTER TABLE public.appointments DROP CONSTRAINT IF EXISTS appointments_patient_id_fkey;
```

---

### **Step 3: Ensure all patients have 'id'**

```sql
UPDATE public.patients SET id = gen_random_uuid() WHERE id IS NULL;
```

---

### **Step 4: Update appointments to use patient.id**

```sql
UPDATE public.appointments ap
SET patient_id = p.id
FROM public.patients p
WHERE p.user_id::text = ap.patient_id::text
AND p.id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM public.patients WHERE id = ap.patient_id);
```

---

### **Step 5: Create constraint using patients.id**

```sql
ALTER TABLE public.appointments 
ADD CONSTRAINT appointments_patient_id_fkey 
FOREIGN KEY (patient_id) 
REFERENCES public.patients(id) 
ON DELETE CASCADE;
```

---

### **Step 6: Verify**

```sql
SELECT 
    conname AS constraint_name,
    confrelid::regclass AS referenced_table,
    a2.attname AS referenced_column
FROM pg_constraint c
JOIN pg_attribute a1 ON a1.attnum = ANY(c.conkey) AND a1.attrelid = c.conrelid
JOIN pg_attribute a2 ON a2.attnum = ANY(c.confkey) AND a2.attrelid = c.confrelid
WHERE conrelid = 'appointments'::regclass
AND conname = 'appointments_patient_id_fkey';
```

**You should see the constraint!** ✅

---

## ✅ After This

1. **Restart backend server**
2. **Try booking appointment again**
3. **It should work!** 🎉

---

**The file `fix-appointments-FINAL.sql` has all these steps - use Step 3A section!**

