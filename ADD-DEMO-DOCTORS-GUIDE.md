# 🩺 Add Demo Doctors to Your Database

## 📋 Quick Guide

You have **12 demo doctors** ready to add to your Supabase database!

---

## 🚀 METHOD 1: Using Supabase SQL Editor (Recommended)

### **Step-by-Step:**

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Login to your account
   - Select your project: "Dr. Sanaullah Welfare Foundation"

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar (icon: `</>`)
   - Click "New Query"

3. **Copy the SQL Script**
   - Open the file: `supabase/demo-doctors.sql`
   - Copy all the content

4. **Paste and Run**
   - Paste the SQL into the editor
   - Click "Run" button (or press Ctrl+Enter)
   - Wait for success message: "Success. No rows returned"

5. **Verify Insertion**
   - The query will show you all inserted doctors
   - You should see 12 doctors listed

6. **Refresh Your Homepage**
   - Go to: http://localhost:5173
   - Scroll to "Our Expert Doctors" section
   - See all 12 doctors displayed!

---

## 📋 METHOD 2: Using Table Editor (Manual)

### **Step-by-Step:**

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project

2. **Navigate to Table Editor**
   - Click "Table Editor" in sidebar
   - Select `doctors` table

3. **Add Doctors Manually**
   - Click "Insert row" button
   - Fill in the details for each doctor:

#### **Doctor 1:**
- Name: `Dr. Ahmed Ali Khan`
- Specialization: `Cardiologist`
- Discount Rate: `50`

#### **Doctor 2:**
- Name: `Dr. Fatima Noor`
- Specialization: `Pediatrician`
- Discount Rate: `50`

#### **Doctor 3:**
- Name: `Dr. Hassan Mahmood`
- Specialization: `Orthopedic Surgeon`
- Discount Rate: `50`

*(Continue for all 12 doctors...)*

---

## 👨‍⚕️ THE 12 DEMO DOCTORS

| # | Name | Specialization | Discount |
|---|------|----------------|----------|
| 1 | Dr. Ahmed Ali Khan | Cardiologist | 50% |
| 2 | Dr. Fatima Noor | Pediatrician | 50% |
| 3 | Dr. Hassan Mahmood | Orthopedic Surgeon | 50% |
| 4 | Dr. Ayesha Siddiqui | Gynecologist | 50% |
| 5 | Dr. Bilal Qureshi | Dermatologist | 50% |
| 6 | Dr. Zainab Rasheed | General Physician | 50% |
| 7 | Dr. Usman Farooq | Neurologist | 50% |
| 8 | Dr. Mariam Khalid | Ophthalmologist | 50% |
| 9 | Dr. Saad Jameel | ENT Specialist | 50% |
| 10 | Dr. Hina Tariq | Psychiatrist | 50% |
| 11 | Dr. Imran Shah | Urologist | 50% |
| 12 | Dr. Sana Malik | Radiologist | 50% |

---

## 🎯 Specializations Explained

- **Cardiologist** - Heart specialist
- **Pediatrician** - Children's doctor
- **Orthopedic Surgeon** - Bones and joints
- **Gynecologist** - Women's health
- **Dermatologist** - Skin specialist
- **General Physician** - General health
- **Neurologist** - Brain and nervous system
- **Ophthalmologist** - Eye specialist
- **ENT Specialist** - Ear, nose, throat
- **Psychiatrist** - Mental health
- **Urologist** - Urinary system
- **Radiologist** - Medical imaging

---

## ✅ Verification Steps

### **After Adding Doctors:**

1. **Check Supabase Table:**
   - Go to Table Editor → `doctors`
   - You should see 12 rows
   - All with `discount_rate = 50`

2. **Check Homepage:**
   - Visit: http://localhost:5173
   - Scroll to "Our Expert Doctors"
   - You should see 6 doctors (homepage shows first 6)
   - Each with name, specialization, and 50% OFF badge

3. **Check Patient Dashboard:**
   - Login as patient
   - Go to "Doctors" tab
   - You should see all 12 doctors
   - Can book appointments with them

---

## 🔧 Troubleshooting

### **Problem: SQL Error**

**Error:** `relation "public.doctors" does not exist`

**Solution:**
- Run the main schema first: `supabase/schema.sql`
- This creates the doctors table
- Then run the demo-doctors script

---

### **Problem: Duplicate Key Error**

**Error:** `duplicate key value violates unique constraint`

**Solution:**
- Doctors already exist in database
- Either:
  - Delete existing doctors first
  - Or modify script to use different names

---

### **Problem: No Doctors Showing on Homepage**

**Solution:**
1. Check browser console for errors (F12)
2. Verify doctors exist in Supabase Table Editor
3. Check `.env` file has correct Supabase URL and key
4. Refresh the page (Ctrl+R)
5. Check network tab - is the query succeeding?

---

## 📝 SQL Script Explained

```sql
-- Insert demo doctors
INSERT INTO public.doctors (name, specialization, discount_rate) VALUES
('Dr. Ahmed Ali Khan', 'Cardiologist', 50.00),
('Dr. Fatima Noor', 'Pediatrician', 50.00),
-- ... more doctors

-- ON CONFLICT DO NOTHING prevents duplicate errors
ON CONFLICT DO NOTHING;

-- Verify insertion
SELECT id, name, specialization, discount_rate 
FROM public.doctors 
ORDER BY name;
```

---

## 🎨 What You'll See on Homepage

After adding doctors, your homepage will display:

```
Our Expert Doctors
Experienced medical professionals providing quality healthcare 
with 50% discount for registered patients.

┌─────────────────────────────────┐
│ 👨‍⚕️ Dr. Ahmed Ali Khan          │
│    Cardiologist                 │
│    Discount: 50% OFF            │
│    For registered patients only │
│    [ Book Appointment ]         │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ 👨‍⚕️ Dr. Fatima Noor             │
│    Pediatrician                 │
│    Discount: 50% OFF            │
│    For registered patients only │
│    [ Book Appointment ]         │
└─────────────────────────────────┘

... (4 more doctors on homepage)

View All Doctors →
```

---

## 🚀 Quick Copy-Paste SQL

**Just copy this entire block and run in Supabase SQL Editor:**

```sql
INSERT INTO public.doctors (name, specialization, discount_rate) VALUES
('Dr. Ahmed Ali Khan', 'Cardiologist', 50.00),
('Dr. Fatima Noor', 'Pediatrician', 50.00),
('Dr. Hassan Mahmood', 'Orthopedic Surgeon', 50.00),
('Dr. Ayesha Siddiqui', 'Gynecologist', 50.00),
('Dr. Bilal Qureshi', 'Dermatologist', 50.00),
('Dr. Zainab Rasheed', 'General Physician', 50.00),
('Dr. Usman Farooq', 'Neurologist', 50.00),
('Dr. Mariam Khalid', 'Ophthalmologist', 50.00),
('Dr. Saad Jameel', 'ENT Specialist', 50.00),
('Dr. Hina Tariq', 'Psychiatrist', 50.00),
('Dr. Imran Shah', 'Urologist', 50.00),
('Dr. Sana Malik', 'Radiologist', 50.00)
ON CONFLICT DO NOTHING;
```

---

## 📊 Expected Results

### **Homepage:**
- Shows 6 doctors (first 6 alphabetically)
- Each with doctor icon, name, specialization
- 50% OFF badge
- "Book Appointment" button

### **Patient Dashboard (Doctors Tab):**
- Shows all 12 doctors
- Detailed information
- Can book appointments

### **Admin Dashboard:**
- Can view all doctors
- Can add more doctors
- Can edit/delete doctors

---

## 🎁 Bonus: Add More Doctors Later

### **Via Admin Dashboard:**
1. Login as admin (`admin@dswf.org` / `Admin123!`)
2. Go to "Doctors" tab
3. Click "Add Doctor" button
4. Fill in:
   - Name
   - Specialization
   - Discount Rate
5. Save

### **Via SQL:**
```sql
INSERT INTO public.doctors (name, specialization, discount_rate) VALUES
('Dr. Your Name', 'Your Specialization', 50.00);
```

---

## ✅ Checklist

- [ ] Open Supabase Dashboard
- [ ] Navigate to SQL Editor
- [ ] Copy SQL from `supabase/demo-doctors.sql`
- [ ] Paste into SQL Editor
- [ ] Click "Run"
- [ ] See success message
- [ ] Verify 12 doctors listed
- [ ] Open homepage (http://localhost:5173)
- [ ] Scroll to "Our Expert Doctors"
- [ ] See 6 doctors displayed
- [ ] Verify each has:
  - [ ] Name
  - [ ] Specialization
  - [ ] 50% OFF badge
  - [ ] Book Appointment button
- [ ] Login as patient
- [ ] Check Doctors tab
- [ ] See all 12 doctors

---

## 🎊 Summary

**File Created:** `supabase/demo-doctors.sql`

**Contains:** 12 demo doctors with diverse specializations

**Specializations Included:**
- Cardiology, Pediatrics, Orthopedics
- Gynecology, Dermatology, General Medicine
- Neurology, Ophthalmology, ENT
- Psychiatry, Urology, Radiology

**Discount:** All doctors have 50% discount

**Next Step:** 
1. Open Supabase SQL Editor
2. Run the script
3. Refresh your homepage
4. See beautiful doctor cards! 🎉

---

**Your homepage will look amazing with real doctors!** ✨

