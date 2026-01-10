# 🚨 IMPORTANT: Run SQL Migration for Teacher Image URL

You need to run a SQL migration to add the `image_url` column to the `teachers` table.

## Steps:

1. Open your Supabase Dashboard
2. Go to **SQL Editor**
3. Copy and paste the following SQL:

```sql
-- Add image_url column to teachers table
ALTER TABLE public.teachers
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Verify
SELECT user_id, specialization, image_url FROM public.teachers ORDER BY user_id;
```

4. Click **Run** to execute the SQL
5. You should see a success message and the verification query results

## What this does:

- Adds an `image_url` column to the `teachers` table
- This column will store the URL of the teacher's profile photo
- The column is optional (nullable), so existing teachers won't be affected

After running this SQL, you'll be able to upload and display teacher photos in the admin dashboard!

