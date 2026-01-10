# 🚨 URGENT: Fix Profile Check Issue

## ⚡ **Quick Fix Steps:**

### **Step 1: Check Your Database**

**Run this SQL in Supabase SQL Editor:**

```sql
-- Check if name/phone columns exist
SELECT column_name 
FROM information_schema.columns 
WHERE table_schema = 'public'
AND table_name = 'patients' 
AND column_name IN ('name', 'phone');
```

**If you see NO results** → Run this:
```sql
ALTER TABLE public.patients 
ADD COLUMN IF NOT EXISTS name text;

ALTER TABLE public.patients 
ADD COLUMN IF NOT EXISTS phone text;
```

---

### **Step 2: Check Your Profile Data**

**Run this SQL (replace with your email):**

```sql
SELECT 
    user_id,
    name,
    phone,
    age,
    gender,
    cnic,
    history
FROM public.patients
WHERE user_id = (
    SELECT id FROM auth.users 
    WHERE email = 'YOUR_EMAIL@example.com'
);
```

**What to look for:**
- ✅ If `name` or `phone` is `NULL` → Profile incomplete
- ✅ If all fields are filled → Profile complete

---

### **Step 3: Update Your Profile**

**If name/phone are NULL, run this SQL:**

```sql
UPDATE public.patients
SET 
    name = 'Your Name',
    phone = '0300-1234567'
WHERE user_id = (
    SELECT id FROM auth.users 
    WHERE email = 'YOUR_EMAIL@example.com'
);
```

**OR** go to **Patient Dashboard → Profile tab** and fill in Name and Phone.

---

### **Step 4: Restart Backend**

```bash
# Stop backend (Ctrl+C)
cd apps/backend
npm run dev
```

---

### **Step 5: Check Browser Console**

1. Open browser console (F12)
2. Try to book an appointment
3. Look for logs starting with:
   - `📋 Profile check response:`
   - `📋 Profile completeness check:`
   - `⚠️ Profile exists but incomplete`

**This will show you exactly what's wrong!**

---

## 🔍 **Common Issues:**

### **Issue 1: SQL Not Run**
- **Symptom:** `name` and `phone` columns don't exist
- **Fix:** Run the SQL from Step 1

### **Issue 2: Profile Missing Name/Phone**
- **Symptom:** Profile exists but `name` or `phone` is NULL
- **Fix:** Update profile (Step 3)

### **Issue 3: Backend Not Restarted**
- **Symptom:** Changes not taking effect
- **Fix:** Restart backend (Step 4)

### **Issue 4: Cache Issue**
- **Symptom:** Old data showing
- **Fix:** Hard refresh (Ctrl+Shift+R) or clear browser cache

---

## ✅ **After Fixing:**

1. **Refresh the page** (Ctrl+Shift+R)
2. **Try booking again**
3. **Check browser console** for logs

---

**If it still doesn't work, share the browser console logs!** 🔍

