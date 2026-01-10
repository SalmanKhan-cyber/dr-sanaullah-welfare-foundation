# 🔍 Diagnose Why Data Is Not Showing

## Quick Diagnostic Steps

### 1. Check Browser Console
1. Open your browser's Developer Tools (F12)
2. Go to the **Console** tab
3. Look for any red error messages
4. Common errors:
   - `401 Unauthorized` - Authentication issue
   - `403 Forbidden` - Permission issue
   - `Failed to fetch` - Network/API issue

### 2. Check Network Tab
1. In Developer Tools, go to **Network** tab
2. Refresh the page
3. Look for API calls (should be to `http://localhost:4000/api/...`)
4. Check if they return:
   - **200 OK** - Success
   - **401/403** - Auth/permission issue
   - **500** - Server error
   - **Failed** - Network issue

### 3. Check if Data Exists in Database
1. Go to **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your project
3. Go to **Database** → **Table Editor**
4. Check these tables:
   - `doctors` - Should have your doctors
   - `patients` - Should have your patients
   - `teachers` - Should have your teachers
   - `courses` - Should have your courses
   - `students` - Should have your students

### 4. Check Your Login Status
1. Make sure you're logged in
2. Check which role you're logged in as:
   - Admin dashboard needs `admin` role
   - Teacher dashboard needs `teacher` role
   - Student dashboard needs `student` role

### 5. Common Issues and Fixes

#### Issue: "401 Unauthorized" or "Missing token"
**Fix**: You're not logged in or session expired
- Log out and log back in
- Check if your session is valid

#### Issue: "403 Forbidden"
**Fix**: Your user role doesn't have permission
- Check your role in Supabase: `users` table → find your user → check `role` column
- If role is wrong, update it manually or contact admin

#### Issue: Data exists in database but not showing
**Fix**: RLS (Row Level Security) policies might be blocking
- See "Fix RLS Policies" section below

#### Issue: API returns empty arrays `[]`
**Fix**: 
- Check if data actually exists in database
- Check if you're querying the right user/role
- Check backend logs for errors

## Fix RLS Policies

If data exists but isn't showing, RLS policies might be blocking access. Run this SQL in Supabase:

```sql
-- Disable RLS on tables that backend manages (backend uses service role)
ALTER TABLE public.doctors DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.students DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_materials DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_announcements DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacy_inventory DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.labs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates DISABLE ROW LEVEL SECURITY;
```

**Note**: This is safe because the backend already has RBAC (Role-Based Access Control) middleware that protects these endpoints.

## Verify Backend is Running

1. Check if backend server is running:
   - Should be at `http://localhost:4000`
   - Check terminal where you ran `npm run dev` in `apps/backend`

2. Test backend health:
   - Open: http://localhost:4000/health
   - Should return: `{"ok":true}`

## Verify Frontend is Running

1. Check if frontend server is running:
   - Should be at `http://localhost:5173`
   - Check terminal where you ran `npm run dev` in `apps/frontend`

## Still Not Working?

1. **Check Backend Logs**: Look at the terminal where backend is running for errors
2. **Check Frontend Logs**: Look at browser console for errors
3. **Verify Environment Variables**: Make sure `.env` files are set up correctly
4. **Check Database Connection**: Verify Supabase credentials in `.env` files

