# 🔍 Verify Backend Configuration

Since RLS is disabled but error persists, the issue is likely with backend configuration.

## Step 1: Check Railway Logs for Exact Error

**This is the most important step!**

1. Go to **Railway Dashboard** → Your Backend Service
2. Click **"Logs"** tab
3. **Clear the logs** (if possible)
4. Try submitting a donation
5. **Copy the FULL error message** from the logs

The error will tell us:
- If service role key is missing/wrong
- Which table is actually failing
- The exact error message

---

## Step 2: Add Debug Logging to Backend

Add this to your backend to verify service role key is loaded:

**In Railway Dashboard → Variables**, temporarily add:

```
DEBUG=true
```

Then check logs to see if service role key warnings appear.

---

## Step 3: Verify Service Role Key Format

The service role key should:
- Start with `eyJ` (JWT format)
- Be very long (hundreds of characters)
- Come from Supabase Dashboard → Settings → API → **service_role** key

**Common mistakes:**
- Using `anon` key instead of `service_role` key
- Key is truncated/cut off
- Extra spaces or newlines in the key

---

## Step 4: Test Backend Directly

Test if backend can connect to Supabase:

1. Go to Railway → Your Backend Service → **"Deployments"**
2. Click **"View Logs"** or use Railway CLI
3. Look for startup messages
4. Check if you see: `Supabase URL or Service Role Key missing`

If you see that warning, the service role key is not set correctly.

---

## Step 5: Check if Backend is Actually Using Service Role

The backend code uses `supabaseAdmin` which should use service role. But if the environment variable is missing or wrong, it might fall back to anon key.

**Verify in Railway:**
1. Variables tab
2. Check `SUPABASE_SERVICE_ROLE_KEY` exists
3. Check it's the correct key (from Supabase)
4. **Redeploy** after changing variables

---

## Step 6: Test Database Connection from Backend

Add a test endpoint to verify backend can write to database:

**Add this to `apps/backend/src/index.js`** (temporarily):

```javascript
// Test endpoint - REMOVE AFTER TESTING
app.get('/api/test-db', async (req, res) => {
  try {
    // Test insert
    const { data, error } = await supabaseAdmin
      .from('donations')
      .insert({ 
        donor_id: '00000000-0000-0000-0000-000000000000',
        amount: 1,
        purpose: 'test'
      })
      .select()
      .single();
    
    if (error) {
      return res.status(500).json({ 
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
    }
    
    // Delete test record
    await supabaseAdmin.from('donations').delete().eq('id', data.id);
    
    res.json({ success: true, message: 'Database write test passed!' });
  } catch (err) {
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});
```

Then visit: `https://your-railway-backend.railway.app/api/test-db`

This will show the exact error if database write fails.

---

## Step 7: Check for Other Tables with RLS

The error might be from a different table. Check all tables:

```sql
-- Check ALL tables for RLS status
SELECT 
    tablename,
    CASE WHEN rowsecurity THEN 'ENABLED ❌' ELSE 'DISABLED ✅' END as "RLS Status"
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

Look for any tables that show `ENABLED ❌` - these might be involved in the donation process.

---

## 🎯 Most Likely Issues

1. **Service Role Key Missing/Wrong** - Backend can't bypass RLS
2. **Backend Not Redeployed** - Old code still running
3. **Different Table Has RLS** - Another table in the flow has RLS enabled
4. **Environment Variable Not Set** - Railway didn't pick up the variable

---

## ✅ Quick Fix Checklist

- [ ] Checked Railway logs for exact error message
- [ ] Verified `SUPABASE_SERVICE_ROLE_KEY` is set in Railway
- [ ] Verified service role key is correct (from Supabase Dashboard)
- [ ] Redeployed backend after setting variables
- [ ] Checked all tables for RLS (not just donations/notifications/users)
- [ ] Tested backend database connection with test endpoint
- [ ] Verified backend startup logs show no warnings

---

**Share the Railway logs error message and we can fix it immediately!** 🔍



