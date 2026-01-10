# 🚨 IMPORTANT: Run This SQL First!

## Error You're Seeing:
```
Could not find the table 'public.specialties' in the schema cache
```

## Solution:
You need to create the database tables first before using the specialties/conditions management feature.

---

## 📋 Steps to Fix:

### 1. Open Supabase SQL Editor
- Go to your Supabase Dashboard
- Navigate to: **SQL Editor** → **New Query**

### 2. Copy and Paste This SQL:

```sql
-- Create specialties and conditions tables for admin management
-- Execute in Supabase SQL editor

-- Specialties table (for doctor specializations shown on homepage)
CREATE TABLE IF NOT EXISTS public.specialties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL UNIQUE,
  icon text NOT NULL,
  display_order int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Conditions table (for conditions shown on homepage)
CREATE TABLE IF NOT EXISTS public.conditions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL UNIQUE,
  icon text NOT NULL,
  search_keyword text NOT NULL, -- What to search for when clicked
  display_order int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert default specialties
INSERT INTO public.specialties (label, icon, display_order) VALUES
  ('Dermatologist', '👋', 1),
  ('Gynecologist', '🤰', 2),
  ('Urologist', '🫁', 3),
  ('Gastroenterologist', '🫃', 4),
  ('Dentist', '🪥', 5),
  ('ENT Specialist', '👂', 6),
  ('Orthopedic Surgeon', '🦴', 7),
  ('Neurologist', '🧠', 8),
  ('Child Specialist', '👶', 9),
  ('Pulmonologist', '🩺', 10),
  ('Eye Specialist', '👓', 11),
  ('General Physician', '🩹', 12)
ON CONFLICT (label) DO NOTHING;

-- Insert default conditions
INSERT INTO public.conditions (label, icon, search_keyword, display_order) VALUES
  ('Fever', '🤒', 'General Physician', 1),
  ('Heart Attack', '❤️', 'Cardiologist', 2),
  ('Pregnancy', '👶', 'Gynecologist', 3),
  ('High Blood Pressure', '🩸', 'Cardiologist', 4),
  ('Piles', '🍑', 'General Physician', 5),
  ('Diarrhea', '💩', 'Gastroenterologist', 6),
  ('Acne', '🙂', 'Dermatologist', 7)
ON CONFLICT (label) DO NOTHING;

-- Enable RLS (but allow all for backend service role)
ALTER TABLE public.specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conditions ENABLE ROW LEVEL SECURITY;

-- Allow all operations for backend service role
CREATE POLICY "Allow all operations on specialties" ON public.specialties
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on conditions" ON public.conditions
  FOR ALL USING (true) WITH CHECK (true);

-- Verify
SELECT * FROM public.specialties ORDER BY display_order;
SELECT * FROM public.conditions ORDER BY display_order;
```

### 3. Click "Run" or Press Ctrl+Enter

### 4. Wait for Success ✅
You should see:
- "Success. No rows returned" (for CREATE TABLE)
- "Success. 12 rows returned" (for specialties INSERT)
- "Success. 7 rows returned" (for conditions INSERT)

---

## ✅ After Running:
1. Refresh your admin dashboard
2. Go to "Specialties" or "Conditions" tab
3. You should now see the default items listed
4. You can now add, edit, or delete specialties/conditions!

---

## 📁 File Location:
The SQL file is also saved at: `supabase/create-specialties-conditions.sql`

