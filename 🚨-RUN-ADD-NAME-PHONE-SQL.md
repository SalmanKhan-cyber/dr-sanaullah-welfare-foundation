# ✅ Fix Patient Profile - Add Name & Phone

## 🎯 **What Was Fixed:**

1. ✅ **Fixed the upsert error** - Changed from `onConflict` to check-then-update/insert pattern
2. ✅ **Added Name field** to patient profile forms
3. ✅ **Added Phone field** to patient profile forms
4. ✅ **Updated backend** to accept and store name and phone

---

## 📋 **STEP 1: Run This SQL Script**

**Go to Supabase SQL Editor** and run:

```sql
-- Add name and phone columns to patients table
ALTER TABLE public.patients 
ADD COLUMN IF NOT EXISTS name text;

ALTER TABLE public.patients 
ADD COLUMN IF NOT EXISTS phone text;
```

**Or copy from:** `supabase/add-name-phone-to-patients.sql`

---

## ✅ **STEP 2: Restart Backend**

```bash
# Stop backend (Ctrl+C)
# Then restart:
cd apps/backend
npm run dev
```

---

## 🎉 **What's Changed:**

### **Before:**
- ❌ Error: "there is no unique or exclusion constraint matching the ON CONFLICT specification"
- ❌ No name field
- ❌ No phone field

### **After:**
- ✅ No more upsert errors
- ✅ Name field in patient profile form
- ✅ Phone field in patient profile form
- ✅ All data saved correctly

---

## 📝 **New Form Fields:**

The patient profile form now includes:
1. **Name** * (required)
2. **Phone Number** * (required)
3. **Age** * (required)
4. **Gender** * (required)
5. **CNIC Number** * (required)
6. **Medical History** (optional)

---

**After running the SQL and restarting the backend, try creating a patient profile again!** 🚀

