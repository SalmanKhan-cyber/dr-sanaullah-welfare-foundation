# 🔧 Fix User Registration Data Storage Issue

## Problem
When users register, their data is not being stored in the database even though registration appears successful.

## Root Cause
The **Row Level Security (RLS)** policies in Supabase are missing **INSERT permissions** for the `users` and `patients` tables. This prevents new user data from being saved during registration.

## Solution

### Step 1: Run the RLS Fix SQL
1. Go to your **Supabase Dashboard**: https://app.supabase.com
2. Select your project: **qudebdejubackprbarvc**
3. Click on **SQL Editor** in the left sidebar
4. Open the file **`supabase/fix-rls-policies.sql`** (it should have opened in Notepad)
5. **Copy the entire contents** of the SQL file
6. Paste it into the Supabase SQL Editor
7. Click **RUN** or press `Ctrl+Enter`

### Step 2: Verify Policies Created
1. Go to **Database** → **Tables** in the left sidebar
2. Click on the **`users`** table
3. Click on the **Policies** tab
4. You should see **3 policies**:
   - ✅ Users can view their own profile
   - ✅ Users can insert their own profile  
   - ✅ Users can update their own profile
5. Click on the **`patients`** table
6. Check the **Policies** tab
7. You should see **3 policies**:
   - ✅ Patients can view their patient row
   - ✅ Patients can insert their patient row
   - ✅ Patients can update their patient row

### Step 3: Test Registration
1. Go to your website: http://localhost:5173/login
2. Switch to **Sign Up** mode
3. Fill in the registration form:
   - Full Name: Test User
   - Email: test@example.com
   - Password: test123456
4. Click **Next: Select Role**
5. Select **Patient** role
6. Fill in patient details:
   - Age: 25
   - Gender: Male
   - CNIC: 12345-1234567-1
   - Medical History: (optional)
7. Click **Complete Registration**
8. Check the browser console for any errors
9. Go to **Supabase Dashboard** → **Database** → **Tables** → **users**
10. You should see the new user in the table!

## What Was Fixed

### Before
- ❌ No INSERT policy on `users` table
- ❌ No INSERT policy on `patients` table  
- ❌ Registration failed silently

### After
- ✅ Users can insert their own profile during registration
- ✅ Patients can insert their patient data during registration
- ✅ Registration works properly!

## Additional Notes

### Why This Happened
RLS (Row Level Security) is enabled on these tables for security. Without explicit INSERT policies, even authenticated users couldn't insert their own data.

### Backend Service Role Key
The backend uses `SUPABASE_SERVICE_ROLE_KEY` which bypasses RLS, but the registration flow initially inserts via Supabase Auth (which follows RLS rules) and then syncs to the public schema.

### Testing Different Roles
After fixing RLS, test registration for different roles:
- **Patient** - should store in `users` + `patients` tables
- **Donor** - should store in `users` table only
- **Admin** - should store in `users` table only
- **Lab Staff** - should store in `users` table only
- **Student** - should store in `users` table only
- **Teacher** - should store in `users` table only
- **Pharmacy** - should store in `users` table only

## Troubleshooting

### If registration still fails:
1. Check browser console for errors
2. Check backend terminal for errors
3. Verify Supabase project URL and keys are correct
4. Make sure the SQL fix ran successfully
5. Check if email verification is required (might need to verify email first)

### If data appears in Auth but not in public schema:
- This means Supabase Auth works but RLS is blocking public table inserts
- Re-run the fix SQL script
- Verify policies are created correctly

## Next Steps
After fixing this:
1. ✅ Test user registration for all roles
2. ✅ Verify data appears in Supabase tables
3. ✅ Test login with registered users
4. ✅ Test patient dashboard displays correct data

---

**That's it!** User registration should now work properly. 🎉

