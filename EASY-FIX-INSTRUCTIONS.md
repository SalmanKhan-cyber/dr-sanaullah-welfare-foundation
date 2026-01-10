# ✅ Easy Fix Instructions - Step by Step

## The Problem
You're getting a syntax error. Let's fix it with a simpler approach!

---

## 🎯 **Simple Solution - Run These Steps:**

### **Option 1: Run Everything at Once (Easiest)**

1. Open **`supabase/fix-appointments-SIMPLE.sql`**
2. Copy the **ENTIRE file** (all lines)
3. Paste into Supabase SQL Editor
4. Run it
5. Done! ✅

---

### **Option 2: Run Step by Step (If you get errors)**

#### **Step 1:** Check your patients table structure
```sql
SELECT column_name, data_type
FROM information_schema.columns 
WHERE table_schema = 'public'
AND table_name = 'patients' 
ORDER BY ordinal_position;
```

**Look at the result:**
- ✅ If you see an **`id`** column → You have migrated schema → Use Step 2A
- ❌ If you DON'T see an **`id`** column → You have original schema → Use Step 2B

---

#### **Step 2A: If you HAVE 'id' column**

Run these commands:

```sql
-- Drop broken constraint
ALTER TABLE public.appointments 
DROP CONSTRAINT IF EXISTS appointments_patient_id_fkey;

-- Update existing appointments
UPDATE public.appointments ap
SET patient_id = p.id
FROM public.patients p
WHERE p.user_id = ap.patient_id
AND p.id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM public.patients WHERE id = ap.patient_id);

-- Create new constraint
ALTER TABLE public.appointments 
ADD CONSTRAINT appointments_patient_id_fkey 
FOREIGN KEY (patient_id) 
REFERENCES public.patients(id) 
ON DELETE CASCADE;
```

---

#### **Step 2B: If you DON'T have 'id' column**

Run these commands:

```sql
-- Drop broken constraint
ALTER TABLE public.appointments 
DROP CONSTRAINT IF EXISTS appointments_patient_id_fkey;

-- Ensure user_id is unique
CREATE UNIQUE INDEX IF NOT EXISTS patients_user_id_unique 
ON public.patients(user_id) 
WHERE user_id IS NOT NULL;

-- Create new constraint
ALTER TABLE public.appointments 
ADD CONSTRAINT appointments_patient_id_fkey 
FOREIGN KEY (patient_id) 
REFERENCES public.patients(user_id) 
ON DELETE CASCADE;
```

---

#### **Step 3: Verify it worked**

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

**You should see the constraint listed!** ✅

---

## ✅ After Running

1. **Restart your backend server**
2. **Try booking an appointment again**
3. **It should work!** 🎉

---

**The simple SQL file (`fix-appointments-SIMPLE.sql`) has all these steps - just copy and run it!**

