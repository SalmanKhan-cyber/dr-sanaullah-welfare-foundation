# 🚨 IMPORTANT: Run This SQL to Fix Doctor Image URL Error!

## Error You're Seeing:
```
Could not find the 'image_url' column of 'doctors' in the schema cache
```

## Solution:
You need to add the `image_url` column to the `doctors` table.

---

## 📋 Steps to Fix:

### 1. Open Supabase SQL Editor
- Go to your Supabase Dashboard: https://supabase.com/dashboard
- Navigate to: **SQL Editor** → **New Query**

### 2. Copy and Paste This SQL:

```sql
-- Add image_url column to doctors table
ALTER TABLE public.doctors
ADD COLUMN IF NOT EXISTS image_url TEXT;
```

### 3. Click "Run" Button

### 4. Verify the Column Was Added
- Go to **Database** → **Tables** → **doctors**
- You should see `image_url` column in the table structure

### 5. Refresh Your Application
- Refresh the browser page (Ctrl+F5 or Cmd+Shift+R)
- Try adding a doctor again

---

## ✅ After Running This SQL:

- ✅ Doctor image uploads will work correctly
- ✅ Doctor images will be stored and displayed
- ✅ You can add doctors with photos

---

**Note:** If you still see the error after running the SQL, wait a few seconds for Supabase's schema cache to refresh, then refresh your browser.

