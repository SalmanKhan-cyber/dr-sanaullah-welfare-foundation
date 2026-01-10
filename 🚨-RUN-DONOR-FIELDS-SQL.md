# 🚨 IMPORTANT: Run This SQL to Fix Donor Name/Email Error!

## Error You're Seeing:
```
Could not find the 'donor_email' column of 'donations' in the schema cache
```

## Solution:
You need to add the `donor_name` and `donor_email` columns to the `donations` table.

---

## 📋 Steps to Fix:

### 1. Open Supabase SQL Editor
- Go to your Supabase Dashboard: https://supabase.com/dashboard
- Navigate to: **SQL Editor** → **New Query**

### 2. Copy and Paste This SQL:

```sql
-- Add donor_name and donor_email columns to donations table
ALTER TABLE public.donations
ADD COLUMN IF NOT EXISTS donor_name text,
ADD COLUMN IF NOT EXISTS donor_email text;
```

### 3. Click "Run" Button

### 4. Verify the Columns Were Added
- Go to **Database** → **Tables** → **donations**
- You should see `donor_name` and `donor_email` columns in the table structure

### 5. Refresh Your Application
- Refresh the browser page (Ctrl+F5 or Cmd+Shift+R)
- Try adding a donation again

---

## ✅ After Running This SQL:

- ✅ Donor names and emails will be stored correctly
- ✅ Donor names will display properly in the donations table (no more "Anonymous")
- ✅ Edit and Delete buttons will work correctly
- ✅ All donation features will function as expected

---

**Note:** If you still see the error after running the SQL, wait a few seconds for Supabase's schema cache to refresh, then refresh your browser.

