# 🔍 Troubleshoot "new row violates row-level security policy" Error

## Step-by-Step Debugging

### Step 1: Verify RLS is Actually Disabled

Run this in **Supabase SQL Editor**:

```sql
-- Check RLS status on all involved tables
SELECT 
    tablename,
    CASE WHEN rowsecurity THEN '❌ ENABLED' ELSE '✅ DISABLED' END as "RLS Status",
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = t.tablename AND schemaname = 'public') as "Policies"
FROM pg_tables t
WHERE schemaname = 'public'
AND tablename IN ('donations', 'notifications', 'users')
ORDER BY tablename;
```

**Expected Result:** All should show `✅ DISABLED` and `Policies: 0`

**If any show `❌ ENABLED`:** Run the fix SQL again.

---

### Step 2: Run the Complete Fix SQL

Copy and paste this **entire SQL** into Supabase SQL Editor:

```sql
-- Drop ALL policies
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'donations' AND schemaname = 'public') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.donations', r.policyname);
    END LOOP;
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'notifications' AND schemaname = 'public') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.notifications', r.policyname);
    END LOOP;
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'users' AND schemaname = 'public') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.users', r.policyname);
    END LOOP;
END $$;

-- Disable RLS
ALTER TABLE IF EXISTS public.donations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.users DISABLE ROW LEVEL SECURITY;

-- Verify
SELECT tablename, 
       CASE WHEN rowsecurity THEN 'ENABLED ❌' ELSE 'DISABLED ✅' END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('donations', 'notifications', 'users');
```

---

### Step 3: Check Railway Logs for Exact Error

1. Go to **Railway Dashboard** → Your Backend Service
2. Click **"Logs"** tab
3. Try submitting a donation
4. Look for the **exact error message** in the logs
5. **Copy the full error** and share it

The error in logs will tell us:
- Which table is causing the issue
- What operation is failing
- If it's an RLS issue or something else

---

### Step 4: Verify Backend Environment Variables

In **Railway Dashboard** → Variables, check:

✅ **Required Variables:**
- `SUPABASE_URL` = Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` = Service role key (long JWT starting with `eyJ`)
- `SUPABASE_ANON_KEY` = Anon key (also needed)

❌ **Common Mistakes:**
- Using `SUPABASE_ANON_KEY` instead of `SUPABASE_SERVICE_ROLE_KEY`
- Missing `SUPABASE_SERVICE_ROLE_KEY` entirely
- Wrong key copied (make sure it's the `service_role` key, not `anon`)

**To get the correct key:**
1. Go to Supabase Dashboard → Settings → API
2. Find **"service_role"** key (NOT the anon key)
3. Copy it
4. Add to Railway as `SUPABASE_SERVICE_ROLE_KEY`
5. **Redeploy backend**

---

### Step 5: Test Direct Database Insert

Run this in **Supabase SQL Editor** to test if RLS is blocking:

```sql
-- Test insert into donations (replace with a real user ID if you have one)
INSERT INTO public.donations (donor_id, amount, purpose) 
VALUES ('00000000-0000-0000-0000-000000000000', 100, 'test') 
RETURNING id;
```

**If this fails:** RLS is still enabled or there's a constraint issue.

**If this succeeds:** RLS is disabled, but the backend might not be using service role correctly.

---

### Step 6: Check if User is Authenticated

The donation endpoint requires authentication. Make sure:

1. User is **logged in** before submitting donation
2. Browser has a valid **auth token** in localStorage
3. Token is being sent in the request headers

**To check:**
1. Open browser console (F12)
2. Go to **Application** tab → **Local Storage**
3. Look for Supabase auth token
4. If missing, user needs to log in first

---

### Step 7: Check Browser Console for Actual Error

1. Open browser console (F12)
2. Go to **Network** tab
3. Try submitting donation
4. Click on the failed request (usually `/api/donations`)
5. Check **Response** tab for the actual error message
6. Share the full error response

---

## 🎯 Quick Checklist

- [ ] Ran SQL to disable RLS on donations, notifications, and users tables
- [ ] Verified RLS is disabled (ran verification query)
- [ ] Checked Railway has `SUPABASE_SERVICE_ROLE_KEY` set correctly
- [ ] Verified backend is using service role key (not anon key)
- [ ] Checked Railway logs for exact error message
- [ ] Verified user is logged in before submitting donation
- [ ] Checked browser console Network tab for actual error
- [ ] Tested direct database insert (should work if RLS is disabled)

---

## 🆘 If Still Not Working

**Share these details:**

1. **Supabase SQL Result:** Run Step 1 verification query and share the result
2. **Railway Logs:** Copy the error from Railway logs when you submit donation
3. **Browser Console:** Copy the error from Network tab → Response
4. **Environment Variables:** Confirm `SUPABASE_SERVICE_ROLE_KEY` is set in Railway

With these details, I can pinpoint the exact issue! 🔍



