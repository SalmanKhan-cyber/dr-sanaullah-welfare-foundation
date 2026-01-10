# ✅ SIMPLE FIX - Use patients.id Only

## ⚠️ **Important:**
You have duplicate `user_id` values, so you **CANNOT** create a unique index on `user_id`.  
You **MUST** use `patients.id` instead!

---

## 🎯 **Simple 5-Step Fix:**

### **Step 1: Drop old constraint**
```sql
ALTER TABLE public.appointments DROP CONSTRAINT IF EXISTS appointments_patient_id_fkey;
```

---

### **Step 2: Ensure patients have 'id' column**
```sql
-- Add 'id' column if it doesn't exist
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS id uuid DEFAULT gen_random_uuid();

-- Give IDs to patients missing them
UPDATE public.patients SET id = gen_random_uuid() WHERE id IS NULL;
```

---

### **Step 3: Update appointments to use patient.id**
```sql
UPDATE public.appointments ap
SET patient_id = p.id
FROM public.patients p
WHERE p.user_id::text = ap.patient_id::text
AND p.id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM public.patients WHERE id = ap.patient_id);
```

---

### **Step 4: Create constraint using patients.id**
```sql
ALTER TABLE public.appointments 
ADD CONSTRAINT appointments_patient_id_fkey 
FOREIGN KEY (patient_id) 
REFERENCES public.patients(id) 
ON DELETE CASCADE;
```

---

### **Step 5: Verify (optional)**
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

---

## ✅ **What This Does:**

1. ✅ Drops the broken constraint
2. ✅ Adds 'id' column if missing
3. ✅ Updates appointments to use `patients.id`
4. ✅ Creates constraint on `patients.id` (not `user_id`)
5. ✅ **NO unique index on user_id** (handles duplicates!)

---

## ✅ **After Running:**

1. **Restart backend server**
2. **Try booking appointment**
3. **It should work!** 🎉

---

**The file `fix-appointments-USE-ID-ONLY.sql` has all these steps - just copy and run it!**

**DO NOT try to create a unique index on user_id - it will fail because you have duplicates!**

