# 🚨 IMPORTANT: Run Database Migration for Multiple Profiles

## What This Does

This migration allows users to create **multiple profiles** (patient, doctor, teacher) with the same email address.

## Steps to Apply

1. **Open Supabase SQL Editor:**
   - Go to your Supabase project dashboard
   - Navigate to **SQL Editor** in the left sidebar

2. **Run the Migration:**
   - Copy the contents of `supabase/allow-multiple-profiles-per-user.sql`
   - Paste it into the SQL Editor
   - Click **Run** or press `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)

3. **Verify the Changes:**
   - The migration will output verification queries at the end
   - Check that:
     - `patients` table now has an `id` column (primary key) and `user_id` is no longer primary key
     - `teachers` table now has an `id` column (primary key) and `user_id` is no longer primary key
     - `doctors` table has `user_id` column with index
     - `users.role` is now nullable

## What Changed

### Before:
- ❌ One user could only have **one patient profile**
- ❌ One user could only have **one teacher profile**
- ❌ Users had a single `role` field

### After:
- ✅ One user can have **multiple patient profiles**
- ✅ One user can have **multiple teacher profiles**
- ✅ One user can have **multiple doctor profiles**
- ✅ Users can have profiles without a primary role

## Testing

After running the migration:

1. **Login** to your account
2. Go to **Patient Dashboard** → **My Profiles** tab
3. Click **"+ Create New Profile"**
4. You should be able to create multiple profiles of different types!

## Troubleshooting

If you encounter errors:

1. **"column already exists"**: The migration uses `IF NOT EXISTS`, so this is safe to ignore
2. **"constraint does not exist"**: Some constraints may have already been removed, this is safe to ignore
3. **"permission denied"**: Make sure you're running this as a database admin
4. **"cannot drop constraint because other objects depend on it"**: This has been fixed in the updated migration script - it now properly handles foreign key dependencies by:
   - Dropping foreign keys first
   - Dropping the primary key
   - Recreating foreign keys pointing to the new `id` column

## Need Help?

If you encounter any issues, check:
- Supabase logs in the dashboard
- The SQL Editor output for specific error messages

