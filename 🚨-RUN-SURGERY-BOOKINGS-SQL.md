# 🚨 IMPORTANT: Run This SQL to Enable Surgery Bookings!

## Problem:
Surgery bookings are not being stored because the database table doesn't exist yet.

## Solution:
Run the SQL script to create the `surgery_bookings` table.

---

## 📋 Steps to Fix:

### 1. Open Supabase SQL Editor
- Go to your Supabase Dashboard: https://supabase.com/dashboard
- Select your project
- Navigate to: **SQL Editor** → **New Query**

### 2. Copy and Run the SQL Script

Open the file: `supabase/create-surgery-bookings-table.sql`

**OR** copy and paste this complete SQL script:

```sql
-- Create surgery_bookings table for storing surgery consultation requests
CREATE TABLE IF NOT EXISTS public.surgery_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_name text NOT NULL,
  phone text NOT NULL,
  city text,
  surgery_type text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'confirmed', 'completed', 'cancelled')),
  remarks text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_surgery_bookings_status ON public.surgery_bookings(status);
CREATE INDEX IF NOT EXISTS idx_surgery_bookings_created_at ON public.surgery_bookings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_surgery_bookings_surgery_type ON public.surgery_bookings(surgery_type);

-- Enable RLS
ALTER TABLE public.surgery_bookings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can create surgery bookings" ON public.surgery_bookings;
DROP POLICY IF EXISTS "Admins can view all surgery bookings" ON public.surgery_bookings;
DROP POLICY IF EXISTS "Admins can update surgery bookings" ON public.surgery_bookings;
DROP POLICY IF EXISTS "Service role has full access" ON public.surgery_bookings;

-- RLS Policies
-- Public can create bookings (for the booking form)
CREATE POLICY "Public can create surgery bookings"
  ON public.surgery_bookings FOR INSERT
  TO public
  WITH CHECK (true);

-- Admins can view all bookings
CREATE POLICY "Admins can view all surgery bookings"
  ON public.surgery_bookings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update bookings
CREATE POLICY "Admins can update surgery bookings"
  ON public.surgery_bookings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Service role (backend) has full access
CREATE POLICY "Service role has full access"
  ON public.surgery_bookings FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
```

### 3. Click "Run" Button

Click the "Run" button (or press Ctrl+Enter) to execute the SQL script.

### 4. Verify Table Created

You should see a success message. To verify, run:

```sql
SELECT * FROM public.surgery_bookings LIMIT 5;
```

---

## ✅ What This Enables:

1. **Surgery Booking Form**: Patients can now submit surgery consultation requests
2. **Admin Panel**: Admins can view all surgery bookings in the "Surgery Bookings" tab
3. **Status Management**: Admins can update booking status (pending → contacted → confirmed → completed)

---

## 🔍 After Running SQL:

1. Restart your backend server (if running)
2. Go to the Surgery Planning page (`/surgery`)
3. Submit a test booking
4. Check the Admin Dashboard → "Surgery Bookings" tab to see the booking!

---

**The table will store all surgery consultation requests from patients!** 🎉

