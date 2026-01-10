# 🔧 Complete Fix for "new row violates row-level security policy"

## Problem
Even after disabling RLS, you're still seeing the error. This is because:
1. **Multiple tables** are involved (donations AND notifications)
2. RLS might not be fully disabled
3. Backend might not be using service role key correctly

---

## ✅ Complete Solution

### Step 1: Disable RLS on ALL Related Tables

Go to **Supabase Dashboard → SQL Editor** and run this **complete SQL**:

```sql
-- Disable RLS on donations table
ALTER TABLE IF EXISTS public.donations DISABLE ROW LEVEL SECURITY;

-- Disable RLS on notifications table (also gets inserted during donation)
ALTER TABLE IF EXISTS public.notifications DISABLE ROW LEVEL SECURITY;

-- Disable RLS on users table (might be needed for user lookups)
ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 
    tablename,
    rowsecurity as "RLS Enabled"
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('donations', 'notifications', 'users')
ORDER BY tablename;
```

**Expected Result:** All should show `RLS Enabled: false`

---

### Step 2: Verify Backend is Using Service Role Key

**In Railway Dashboard:**

1. Go to your backend service
2. Click **"Variables"** tab
3. Check these environment variables:

   ✅ **MUST HAVE:**
   - `SUPABASE_SERVICE_ROLE_KEY` = `eyJhbGc...` (long key starting with `eyJ`)
   
   ❌ **MUST NOT USE:**
   - `SUPABASE_ANON_KEY` should NOT be used for backend operations

4. **If `SUPABASE_SERVICE_ROLE_KEY` is missing or wrong:**
   - Go to Supabase Dashboard → Settings → API
   - Copy the **"service_role"** key (NOT the anon key)
   - Add it to Railway as `SUPABASE_SERVICE_ROLE_KEY`
   - Redeploy backend

---

### Step 3: Check Backend Code is Using Service Role

The backend should use `supabaseAdmin` (which uses service role). Verify in `apps/backend/src/lib/supabase.js`:

```javascript
export const supabaseAdmin = createClient(
  supabaseUrl, 
  supabaseServiceRoleKey,  // ← Should use SERVICE_ROLE_KEY
  { auth: { persistSession: false } }
);
```

---

### Step 4: Test the Fix

1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Hard refresh** the donation page (Ctrl+Shift+R)
3. **Try submitting a donation**
4. **Check browser console** (F12) for errors

---

## 🔍 Debugging Steps

### Check Railway Logs

1. Go to Railway → Your Backend Service → **"Logs"** tab
2. Try submitting a donation
3. Look for error messages in the logs
4. Share the error if you see one

### Verify RLS is Actually Disabled

Run this in Supabase SQL Editor:

```sql
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('donations', 'notifications', 'users');
```

**All `rowsecurity` values should be `false`**

### Test Direct Database Insert

Run this in Supabase SQL Editor to test if RLS is blocking:

```sql
-- This should work if RLS is disabled
INSERT INTO public.donations (donor_id, amount, purpose)
VALUES ('00000000-0000-0000-0000-000000000000', 100, 'test')
RETURNING id;
```

If this fails, RLS is still enabled.

---

## 🆘 Still Not Working?

### Option 1: Disable RLS on ALL Tables (Nuclear Option)

If nothing else works, disable RLS on all backend-managed tables:

```sql
-- Disable RLS on all application tables
ALTER TABLE IF EXISTS public.donations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.doctors DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.teachers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.students DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.pharmacy_inventory DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.pharmacy_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.pharmacy_order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.labs DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lab_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.test_bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.prescriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.lab_reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.certificates DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.specialties DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.conditions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.surgery_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.surgery_bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.blood_banks DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.blood_inventory DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.blood_requests DISABLE ROW LEVEL SECURITY;
```

### Option 2: Check for Policies

Sometimes policies exist even when RLS is disabled. Drop all policies:

```sql
-- Drop all policies on donations table
DROP POLICY IF EXISTS "Allow all operations on donations" ON public.donations;
DROP POLICY IF EXISTS "Users can view their own donations" ON public.donations;
DROP POLICY IF EXISTS "Users can insert their own donations" ON public.donations;
DROP POLICY IF EXISTS "Donors can view their own donations" ON public.donations;
DROP POLICY IF EXISTS "Donors can insert their own donations" ON public.donations;

-- Drop all policies on notifications table
DROP POLICY IF EXISTS "Allow all operations on notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can insert their own notifications" ON public.notifications;

-- Then disable RLS
ALTER TABLE IF EXISTS public.donations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notifications DISABLE ROW LEVEL SECURITY;
```

---

## 📋 Checklist

- [ ] Ran SQL to disable RLS on `donations` table
- [ ] Ran SQL to disable RLS on `notifications` table
- [ ] Ran SQL to disable RLS on `users` table
- [ ] Verified RLS is disabled (ran verification query)
- [ ] Checked Railway has `SUPABASE_SERVICE_ROLE_KEY` set
- [ ] Verified backend code uses `supabaseAdmin`
- [ ] Cleared browser cache
- [ ] Hard refreshed page
- [ ] Checked Railway logs for errors
- [ ] Tested donation submission

---

## 🎯 Quick Copy-Paste SQL (Run This First)

```sql
-- Complete fix: Disable RLS and drop policies
DROP POLICY IF EXISTS "Allow all operations on donations" ON public.donations;
DROP POLICY IF EXISTS "Users can view their own donations" ON public.donations;
DROP POLICY IF EXISTS "Users can insert their own donations" ON public.donations;
DROP POLICY IF EXISTS "Donors can view their own donations" ON public.donations;
DROP POLICY IF EXISTS "Donors can insert their own donations" ON public.donations;

DROP POLICY IF EXISTS "Allow all operations on notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can insert their own notifications" ON public.notifications;

ALTER TABLE IF EXISTS public.donations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;

-- Verify
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('donations', 'notifications', 'users');
```

---

**Run the SQL above, verify Railway has service role key, then test again!** 🚀



