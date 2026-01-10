# 🚨 IMPORTANT: Run This SQL to Fix Surgery Categories!

## Problem:
You're seeing this error:
```
Failed to load surgery categories: Could not find the table 'public.surgery_categories' in the schema cache
```

This means the database table doesn't exist yet.

## Solution:
Run the SQL script to create the table and insert 24 default surgery categories.

---

## 📋 Quick Fix Steps:

### 1. Open Supabase SQL Editor
- Go to your Supabase Dashboard: https://supabase.com/dashboard
- Select your project
- Navigate to: **SQL Editor** → **New Query**

### 2. Copy and Run the SQL Script

Open the file: `supabase/create-surgery-categories-table.sql`

**OR** copy this complete SQL script:

```sql
-- Create surgery_categories table for managing surgery types
create table if not exists public.surgery_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  icon text not null,
  description text,
  display_order int default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create indexes for faster queries
create index if not exists idx_surgery_categories_display_order on public.surgery_categories(display_order);
create index if not exists idx_surgery_categories_is_active on public.surgery_categories(is_active);

-- Enable RLS
alter table public.surgery_categories enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Public can view active surgery categories" on public.surgery_categories;
drop policy if exists "Admins can manage all surgery categories" on public.surgery_categories;

-- Public can view active categories
create policy "Public can view active surgery categories"
  on public.surgery_categories for select
  using (is_active = true);

-- Admins can do everything
create policy "Admins can manage all surgery categories"
  on public.surgery_categories for all
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

-- Insert 24 default surgery categories
insert into public.surgery_categories (name, icon, description, display_order) values
  ('Piles Surgery', '🔴', 'Treatment for hemorrhoids', 1),
  ('Hip Replacement Surgery', '🦴', 'Hip joint replacement procedure', 2),
  ('Spinal Surgery', '🫀', 'Spine and back surgery', 3),
  ('Tonsillectomy', '👄', 'Tonsil removal surgery', 4),
  ('Appendectomy', '🍑', 'Appendix removal surgery', 5),
  ('Cyst Removal', '🔴', 'Cyst removal procedure', 6),
  ('TURP', '👨', 'Transurethral resection of prostate', 7),
  ('Hydrocele Surgery', '💧', 'Hydrocele treatment', 8),
  ('Lithotripsy', '🫘', 'Kidney stone removal', 9),
  ('Open Heart Surgery', '❤️', 'Cardiac surgery procedures', 10),
  ('Tummy Tuck Surgery', '🏋️', 'Abdominoplasty procedure', 11),
  ('Liver Transplant', '🫀', 'Liver transplantation', 12),
  ('Gall Bladder Surgery', '🟡', 'Cholecystectomy', 13),
  ('Heart Transplant', '❤️‍🩹', 'Heart transplantation', 14),
  ('Prostatectomy', '⚕️', 'Prostate removal surgery', 15),
  ('Laser Lithotripsy', '💎', 'Laser kidney stone treatment', 16),
  ('Penile Implants', '🔵', 'Penile implant procedure', 17),
  ('Anal Fissure Treatment', '🔴', 'Anal fissure surgery', 18),
  ('Vasectomy', '⚪', 'Male sterilization procedure', 19),
  ('Hernia Surgery', '🟢', 'Hernia repair surgery', 20),
  ('Circumcision', '🔵', 'Circumcision procedure', 21),
  ('Fistula', '🔴', 'Fistula treatment', 22),
  ('Cataract Eye Surgery', '👁️', 'Cataract removal surgery', 23),
  ('Renal Transplant', '🫘', 'Kidney transplantation', 24)
on conflict (name) do nothing;
```

### 3. Click "Run" (or press Ctrl+Enter)

### 4. Verify Success
After running the SQL, you should see:
- ✅ "Success. No rows returned" or similar success message
- ✅ The query executed without errors

### 5. Refresh the Admin Dashboard
- Go back to your admin dashboard
- Click the "Surgery-Categories" tab again
- You should now see 24 surgery categories displayed!

---

## 🔍 Verify It Worked:

Run this query in Supabase SQL Editor to verify:
```sql
SELECT COUNT(*) as total_categories FROM public.surgery_categories;
```

Expected result: `total_categories = 24`

---

## ⚠️ If It Still Doesn't Work:

1. **Check Browser Console** (F12):
   - Look for any error messages
   - Check Network tab to see if API requests are failing

2. **Check Backend Logs**:
   - Look at your backend terminal
   - Check for any error messages about the table

3. **Verify Table Exists**:
   - Run: `SELECT * FROM public.surgery_categories LIMIT 5;`
   - You should see 5 rows of data

4. **Restart Backend**:
   - Stop the backend server (Ctrl+C)
   - Start it again: `cd apps/backend && npm run dev`

---

## ✅ Expected Result:

After running the SQL script, you should see 24 surgery categories in a grid layout:
- Each category shows an icon, name, and description
- You can edit or delete each category
- You can add new categories using the "+ Add Surgery Category" button
