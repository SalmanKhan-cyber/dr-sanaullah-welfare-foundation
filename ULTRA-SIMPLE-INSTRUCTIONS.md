# ✅ ULTRA SIMPLE Instructions - No Errors!

## Follow These Steps:

### **STEP 1: Check Your Schema**

Copy and run this **ONE query**:

```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_schema = 'public'
AND table_name = 'patients' 
AND column_name IN ('id', 'user_id')
ORDER BY column_name;
```

**Look at the results:**
- ✅ If you see **BOTH** `id` AND `user_id` → You have migrated schema → **Go to STEP 2A**
- ✅ If you see **ONLY** `user_id` → You have original schema → **Go to STEP 2B**

---

### **STEP 2A: If You Have 'id' Column**

Run these **3 commands one at a time**:

**Command 1:**
```sql
ALTER TABLE public.appointments DROP CONSTRAINT IF EXISTS appointments_patient_id_fkey;
```

**Command 2:**
```sql
UPDATE public.appointments ap
SET patient_id = p.id
FROM public.patients p
WHERE p.user_id = ap.patient_id
AND p.id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM public.patients WHERE id = ap.patient_id);
```

**Command 3:**
```sql
ALTER TABLE public.appointments 
ADD CONSTRAINT appointments_patient_id_fkey 
FOREIGN KEY (patient_id) 
REFERENCES public.patients(id) 
ON DELETE CASCADE;
```

**DONE!** ✅

---

### **STEP 2B: If You DON'T Have 'id' Column**

Run these **3 commands one at a time**:

**Command 1:**
```sql
ALTER TABLE public.appointments DROP CONSTRAINT IF EXISTS appointments_patient_id_fkey;
```

**Command 2:**
```sql
CREATE UNIQUE INDEX IF NOT EXISTS patients_user_id_unique 
ON public.patients(user_id) 
WHERE user_id IS NOT NULL;
```

**Command 3:**
```sql
ALTER TABLE public.appointments 
ADD CONSTRAINT appointments_patient_id_fkey 
FOREIGN KEY (patient_id) 
REFERENCES public.patients(user_id) 
ON DELETE CASCADE;
```

**DONE!** ✅

---

### **STEP 3: Verify (Optional)**

Run this to check if it worked:

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

You should see the constraint listed! ✅

---

## ✅ After This:

1. **Restart backend server**
2. **Try booking appointment again**
3. **It should work!** 🎉

---

**No DO blocks, no complex syntax - just simple SQL commands!**

