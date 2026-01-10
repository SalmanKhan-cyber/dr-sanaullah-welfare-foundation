# 🔍 Debug: Profile Data Not Showing

## 🚨 **Quick Check:**

### **Step 1: Open Browser Console (F12)**
Look for these logs:
- `📋 Full API response:` - Shows what the API returned
- `📋 Patient profile data:` - Shows the profile object
- `📋 Extracted profile data:` - Shows what was extracted
- `⚠️ No profile found` - Means profile doesn't exist

---

### **Step 2: Check Backend Logs**
Look in your backend terminal for:
- `📋 Fetching patient profile for userId:`
- `📋 Database query result:`
- `✅ Patient profile found:` or `⚠️ No patient profile found`

---

### **Step 3: Check Your Database**

**Run this SQL in Supabase SQL Editor:**

```sql
-- Check if your profile exists
SELECT 
    p.user_id,
    p.name,
    p.phone,
    p.age,
    p.gender,
    p.cnic,
    p.history,
    u.name as user_name,
    u.email,
    u.phone as user_phone
FROM public.patients p
LEFT JOIN public.users u ON u.id = p.user_id
WHERE p.user_id = (
    SELECT id FROM auth.users 
    WHERE email = 'YOUR_EMAIL@example.com'
);
```

**Replace `YOUR_EMAIL@example.com` with your actual email.**

---

## 🔧 **Common Issues:**

### **Issue 1: Profile Doesn't Exist**
**Symptom:** Backend logs show `⚠️ No patient profile found`

**Solution:**
1. Go to Patient Dashboard
2. Click "Edit Profile"
3. Fill in all fields (Name, Phone, Age, Gender, CNIC)
4. Click "Save"

---

### **Issue 2: Profile Exists But Fields Are NULL**
**Symptom:** Profile exists but `name`, `phone`, `age` are NULL

**Solution:**
1. Go to Patient Dashboard → Profile tab
2. Click "Edit Profile"
3. Fill in missing fields
4. Click "Save"

---

### **Issue 3: Name/Phone Columns Don't Exist**
**Symptom:** SQL error or columns not found

**Solution:** Run this SQL:
```sql
ALTER TABLE public.patients 
ADD COLUMN IF NOT EXISTS name text;

ALTER TABLE public.patients 
ADD COLUMN IF NOT EXISTS phone text;
```

---

### **Issue 4: Backend Not Restarted**
**Symptom:** Changes not taking effect

**Solution:**
```bash
# Stop backend (Ctrl+C)
cd apps/backend
npm run dev
```

---

## 📋 **What to Share:**

If it's still not working, share:
1. **Browser console logs** (F12 → Console tab)
2. **Backend terminal logs**
3. **SQL query results** (from Step 3)

This will help identify the exact issue! 🔍

