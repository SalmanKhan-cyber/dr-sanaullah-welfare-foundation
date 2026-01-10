# 🧪 Test API Endpoints - Quick Diagnostic

## Problem: Data exists in database but not showing in dashboard

You have **2 courses** in the database, but they're not showing. Let's test the API endpoints.

## Step 1: Test API Endpoints Directly

Open your browser and test these URLs (replace `localhost:4000` if your backend runs on a different port):

### Test Public Endpoints (No Login Required):

1. **Test Courses (Public)**:
   ```
   http://localhost:4000/api/courses/public
   ```
   - Should return: `{"courses": [...]}`
   - If you see your 2 courses here, the API works!

2. **Test Patients (Public)**:
   ```
   http://localhost:4000/api/patients/all-public
   ```
   - Should return: `{"patients": [...]}`

3. **Test Teachers (Public)**:
   ```
   http://localhost:4000/api/teachers/all-public
   ```
   - Should return: `{"teachers": [...]}`

### Test Authenticated Endpoints (Requires Login):

These require you to be logged in. Open browser console (F12) and run:

```javascript
// Get your auth token
const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;

// Test courses endpoint
fetch('http://localhost:4000/api/courses', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(r => r.json())
.then(data => console.log('Courses:', data))
.catch(err => console.error('Error:', err));
```

## Step 2: Check Browser Console

1. Open Admin Dashboard
2. Open Browser Console (F12)
3. Go to "Courses" tab
4. Look for these messages:
   - `🔄 Loading courses...`
   - `✅ Courses loaded from public endpoint: X`
   - Or error messages

## Step 3: Check Backend Terminal

When you load the courses tab, you should see in backend terminal:
- `✅ Fetched X courses from database`

## Step 4: Verify Authentication

In browser console, run:
```javascript
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session ? 'Logged in' : 'Not logged in');
console.log('User ID:', session?.user?.id);
console.log('Email:', session?.user?.email);
```

## Common Issues:

### Issue 1: "401 Unauthorized" or "Missing token"
**Solution**: You're not logged in
- Go to login page and log in
- Make sure you're logged in as `admin` role

### Issue 2: "403 Forbidden"
**Solution**: Your role doesn't have permission
- Check your role in Supabase: `users` table → find your user → check `role` column
- Should be `admin` for admin dashboard
- Update it manually if needed:
  ```sql
  UPDATE public.users SET role = 'admin' WHERE email = 'your-email@example.com';
  ```

### Issue 3: API returns empty array `[]`
**Possible Causes**:
- Data doesn't exist (but you confirmed 2 courses exist)
- Query is filtering incorrectly
- RLS policies blocking (but backend uses service role, so shouldn't be an issue)

### Issue 4: "Failed to fetch" or Network Error
**Solution**: Backend server not running
- Check if backend is running on `http://localhost:4000`
- Check backend terminal for errors
- Restart backend if needed

## Quick Fix: Run RLS SQL

If nothing works, run this SQL in Supabase to disable RLS:

```sql
-- Disable RLS on all tables (backend has RBAC protection)
ALTER TABLE IF EXISTS public.courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.doctors DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.teachers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.students DISABLE ROW LEVEL SECURITY;
```

Then refresh your dashboard.

