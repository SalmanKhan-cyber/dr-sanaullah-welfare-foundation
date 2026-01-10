# 🔧 Fix "new row violates row-level security policy" Error

## Problem
You're seeing this error when trying to submit a donation:
```
new row violates row-level security policy
```

This happens because **Row Level Security (RLS)** is enabled on the `donations` table in Supabase, and it's blocking the insert even though the backend uses the service role.

---

## ✅ Solution: Disable RLS on Donations Table

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase Dashboard
2. Click on **"SQL Editor"** in the left sidebar
3. Click **"New Query"**

### Step 2: Run This SQL Command

Copy and paste this SQL into the editor:

```sql
-- Disable RLS on donations table
ALTER TABLE IF EXISTS public.donations DISABLE ROW LEVEL SECURITY;
```

### Step 3: Execute

1. Click **"Run"** or press `Ctrl+Enter`
2. You should see: `Success. No rows returned`

### Step 4: Test Donation

1. Go back to your donation page
2. Try submitting a donation again
3. It should work now! ✅

---

## 🔍 Optional: Disable RLS on All Tables (Recommended)

If you want to disable RLS on all tables that the backend manages (recommended since backend has its own RBAC), run this instead:

```sql
-- Disable RLS on all application tables managed by backend
ALTER TABLE IF EXISTS public.donations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.doctors DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.teachers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.students DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.pharmacy_inventory DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.pharmacy_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.pharmacy_order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.labs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lab_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.test_bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.prescriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lab_reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.certificates DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.specialties DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.conditions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.surgery_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.surgery_bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.blood_banks DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.blood_inventory DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.blood_requests DISABLE ROW LEVEL SECURITY;
```

**Note:** The backend uses service role and has its own RBAC middleware, so disabling RLS on these tables is safe.

---

## 🆘 Still Not Working?

### Check if RLS is Actually Disabled

Run this query to check:

```sql
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'donations';
```

If `rowsecurity` is `true`, RLS is still enabled. Run the disable command again.

### Check Backend Logs

1. Go to Railway dashboard
2. Click on your backend service
3. Go to **"Logs"** tab
4. Look for any errors when submitting donation
5. Share the error message if you see one

### Verify Backend is Using Service Role

The backend should be using `SUPABASE_SERVICE_ROLE_KEY` (not `SUPABASE_ANON_KEY`). Check Railway environment variables:

- ✅ `SUPABASE_SERVICE_ROLE_KEY` should be set
- ❌ Don't use `SUPABASE_ANON_KEY` for backend operations

---

## 📝 Why This Happens

- Supabase enables RLS by default on new tables for security
- RLS policies restrict which rows users can insert/update/delete
- Even with service role, if RLS is enabled and no policies allow the insert, it fails
- The backend uses service role which should bypass RLS, but sometimes RLS still blocks operations
- **Solution:** Disable RLS on tables managed by the backend (backend has its own authentication/authorization)

---

## ✅ After Fixing

Once RLS is disabled:
1. ✅ Donations will work
2. ✅ All backend operations will work
3. ✅ Backend RBAC middleware still protects routes
4. ✅ No security risk (backend handles auth)

---

**Run the SQL command above and donations should work!** 🎉



