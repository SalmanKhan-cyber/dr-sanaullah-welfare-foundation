# Lab Management System Guide

This guide will help you set up the complete lab management system where admins can register labs and assign patient tests directly to them.

## Step 1: Run SQL Migration

1. Go to the **Supabase SQL Editor**: https://supabase.com/dashboard/project/_/sql/new
2. Open the file `supabase/create-labs-table.sql`
3. Copy and paste the SQL into the editor
4. Click **Run** to execute

This will create:
- `labs` table for registered laboratories
- `lab_users` junction table to link Lab to labs
- Updates `lab_reports` table to link to labs
- Sample lab data (4 demo labs)

## Step 2: Restart Backend Server

The backend needs to be restarted to load the new `/api/labs` routes:
1. Stop the backend server (Ctrl+C if running)
2. Start it again: `cd apps/backend && npm run dev`

## Step 3: Test the Feature

### Admin Panel - Labs Management

1. **Open Admin Dashboard**: http://localhost:5173/dashboard/admin
2. Click on **"Labs"** tab (new tab added between "Pharmacy" and "Lab-Reports")
3. You should see 4 pre-loaded labs:
   - City Diagnostic Lab (Karachi)
   - MedLab Pakistan (Lahore)
   - Advanced Pathology Lab (Islamabad)
   - Quick Test Labs (Peshawar)

### Register a New Lab

1. Click **"+ Register Lab"** button
2. Fill in the form:
   - Lab Name
   - Location
   - Contact Info
   - Services (comma-separated list)
3. Click **"Register Lab"**

### Assign Test to Lab

1. From the **Labs** tab, click **"Assign Test"** on any lab card
   OR
   From the **Lab-Reports** tab, click **"+ Assign Test"** button
2. Fill in the form:
   - Select Lab (dropdown)
   - Select Patient (dropdown)
   - Test Type (e.g., "Blood Test", "X-Ray")
   - Remarks (optional)
3. Click **"Assign Test"**

### View Assigned Tests

1. Go to **"Lab-Reports"** tab
2. You'll see all lab reports with:
   - Date
   - Patient
   - Lab (the lab it was assigned to)
   - Test Type
   - Status (pending/in_progress/completed)
   - Actions

## Features Implemented

✅ **Lab Registration**:
- Admin can register new labs
- Fields: Name, Location, Contact Info, Services
- Grid display with lab cards

✅ **Test Assignment**:
- Admin assigns tests to specific labs
- Links patient to lab
- Sets test type and remarks
- Creates pending lab report

✅ **Lab Reports Management**:
- View all lab reports
- Filter by status
- See which lab each test was assigned to
- Enhanced table with lab column

✅ **Backend API**:
- `/api/labs` - CRUD operations for labs
- `/api/labs/users` - Lab-user associations
- `/api/labs/user/:userId` - Get labs for a user
- RBAC protection (admin/lab only)

## Database Schema

### Labs Table
```sql
- id (UUID)
- name (TEXT)
- location (TEXT)
- contact_info (TEXT)
- services (TEXT[])
- is_active (BOOLEAN)
- created_at (TIMESTAMP)
```

### Lab Reports (Updated)
```sql
- id (UUID)
- patient_id (UUID)
- lab_id (UUID) -- NEW: Links to lab
- test_type (TEXT) -- NEW
- status (TEXT) -- NEW: pending/in_progress/completed
- file_url (TEXT)
- remarks (TEXT)
- assigned_at (TIMESTAMP) -- NEW
- report_date (DATE)
```

### Lab Users Junction
```sql
- user_id (UUID)
- lab_id (UUID)
```

## Next Steps

Consider adding:
- Lab login system (connect lab users to their labs)
- Lab dashboard showing assigned tests
- Notification system when tests are assigned
- Test completion workflow
- Report upload from lab side
- Lab performance analytics

## Troubleshooting

**Issue**: Labs tab not showing
- **Solution**: Make sure SQL migration was run and backend was restarted

**Issue**: Cannot assign test
- **Solution**: Ensure you have patients in the system first

**Issue**: Assign button not working
- **Solution**: Check browser console for errors, verify API is running

## Integration with Lab Panel

When lab users log in:
1. Query `lab_users` table to find which labs they're associated with
2. Show only reports assigned to those labs
3. Allow them to update status and upload results
4. This creates a complete workflow: Admin → Lab → Patient

