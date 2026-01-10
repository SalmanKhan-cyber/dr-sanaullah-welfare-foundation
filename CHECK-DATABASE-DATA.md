# 🔍 Check Database Data - Quick Guide

## Problem: "No data" showing in dashboards

If you're seeing "No patients found", "No doctors found", etc., follow these steps:

## Step 1: Check if Data Exists in Database

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. Select your project
3. Go to **Database** → **Table Editor**
4. Check these tables:

### Check Patients Table:
- Click on `patients` table
- Look at the bottom - it should show "X rows"
- If it shows "0 rows", you have no patients in the database

### Check Doctors Table:
- Click on `doctors` table
- Should show rows if you've added doctors

### Check Teachers Table:
- Click on `teachers` table
- Should show rows if you've added teachers

### Check Courses Table:
- Click on `courses` table
- Should show rows if you've added courses

### Check Students Table:
- Click on `students` table
- Should show rows if students have enrolled

## Step 2: Check Browser Console

1. Open your browser's Developer Tools (F12)
2. Go to **Console** tab
3. Refresh the page
4. Look for messages like:
   - `🔄 Loading patients data...`
   - `📡 Trying /api/patients/all-public endpoint...`
   - `✅ Public endpoint response:`
   - `📊 Received X patients from API`
   - `✅ Setting X valid patients`

5. If you see errors, note them down

## Step 3: Check Backend Logs

1. Look at the terminal where your backend is running
2. When you load the patients page, you should see:
   - `📡 /api/patients/all-public called`
   - `✅ Fetched X patients from database`
   - `📋 Sample patients: [...]`

3. If you see `⚠️ No patients found in database`, it means:
   - The database table is empty
   - You need to add data first

## Step 4: Verify Your Login Status

1. Make sure you're logged in
2. Check your user role:
   - Go to Supabase → Database → Table Editor → `users` table
   - Find your user (by email)
   - Check the `role` column
   - Should be `admin` for admin dashboard

## Step 5: Common Issues

### Issue: Database is Empty
**Solution**: You need to add data first
- Use the "+ Add Patient" button to add patients
- Use the "+ Add Doctor" button to add doctors
- Use the "+ Add Teacher" button to add teachers
- Use the "+ Add Course" button to add courses

### Issue: Data Exists But Not Showing
**Possible Causes**:
1. **RLS Policies Blocking**: Run the SQL from `supabase/fix-all-rls-policies.sql`
2. **Authentication Issue**: Check if you're logged in
3. **API Error**: Check browser console and backend logs

### Issue: "403 Forbidden" Error
**Solution**: Your user role is not set correctly
- Update your role in `users` table to `admin`
- Or use the public endpoints (they don't require auth)

## Quick Test

Run this SQL in Supabase SQL Editor to check all your data:

```sql
-- Check all data counts
SELECT 
  'patients' as table_name, 
  COUNT(*) as count 
FROM public.patients
UNION ALL
SELECT 'doctors', COUNT(*) FROM public.doctors
UNION ALL
SELECT 'teachers', COUNT(*) FROM public.teachers
UNION ALL
SELECT 'courses', COUNT(*) FROM public.courses
UNION ALL
SELECT 'students', COUNT(*) FROM public.students
UNION ALL
SELECT 'users', COUNT(*) FROM public.users;
```

This will show you how many records exist in each table.

