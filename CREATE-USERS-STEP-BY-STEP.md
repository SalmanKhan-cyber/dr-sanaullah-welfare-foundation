# 👤 Create All 7 User Roles - Complete Step-by-Step Guide

Follow these exact steps to create all 7 user types for testing.

---

## 🎯 Quick Overview

You'll create 7 accounts in this order:
1. **Admin** (most important - do this first!)
2. **Patient**
3. **Donor**
4. **Lab**
5. **Student**
6. **Teacher**
7. **Pharmacy**

---

## 📍 Before You Start

Make sure:
- ✅ Frontend is running: http://localhost:5173
- ✅ Backend is running: http://localhost:4000
- ✅ Supabase dashboard open: https://supabase.com/dashboard/project/qudebdejubackprbarvc

---

## 1️⃣ CREATE ADMIN USER (DO THIS FIRST!)

### Step 1: Sign Up
1. Go to http://localhost:5173/login
2. Enter:
   - **Email**: `admin@dswf.org`
   - **Password**: `Admin123!`
3. Click **"Login with Email"** (it will create the account)

### Step 2: Get User ID
1. Open Supabase: https://supabase.com/dashboard/project/qudebdejubackprbarvc
2. Click **"Authentication"** in left sidebar
3. Click **"Users"**
4. You should see your new user
5. Click on the user
6. **Copy the User ID** (something like: `a1b2c3d4-...`)

### Step 3: Set Admin Role
1. On the same page, scroll down to **"User Metadata"**
2. Click the **Edit** button (pencil icon)
3. You'll see a text box with `{}`
4. Replace it with:
   ```json
   {
     "role": "admin"
   }
   ```
5. Click **"Save"**

### Step 4: Test Admin Access
1. Go back to http://localhost:5173
2. Refresh the page
3. Click on your user name or profile
4. Go to: http://localhost:5173/dashboard/admin
5. You should see the Admin Dashboard ✅

---

## 2️⃣ CREATE PATIENT USER

### Step 1: Sign Up
1. **Log out** from admin account (or use incognito window)
2. Go to http://localhost:5173/login
3. Enter:
   - **Email**: `patient@dswf.org`
   - **Password**: `Patient123!`
4. Sign up

### Step 2: Set Patient Role
1. Go to Supabase → Authentication → Users
2. Find the new user (`patient@dswf.org`)
3. Click on it
4. Edit **User Metadata**:
   ```json
   {
     "role": "patient"
   }
   ```
5. Save

### Step 3: Add Patient Details (Optional)
1. Go to Supabase → **Table Editor** → **patients** table
2. Click **"Insert"** → **"Insert row"**
3. Fill in:
   - **user_id**: (paste patient's user ID)
   - **gender**: `male` or `female`
   - **age**: `35`
   - **cnic**: `12345-6789012-3`
   - **history**: `No known allergies`
4. Save

### Step 4: Test Patient Access
1. Log in as patient@dswf.org
2. Go to: http://localhost:5173/dashboard/patient
3. Should see Patient Dashboard ✅

---

## 3️⃣ CREATE DONOR USER

### Repeat the Process
1. **Email**: `donor@dswf.org`
2. **Password**: `Donor123!`
3. **Set role**: `"donor"`
4. **Test**: http://localhost:5173/dashboard/donor

---

## 4️⃣ CREATE LAB STAFF USER

1. **Email**: `lab@dswf.org`
2. **Password**: `Lab123!`
3. **Set role**: `"lab"`
4. **Test**: http://localhost:5173/dashboard/lab

---

## 5️⃣ CREATE STUDENT USER

1. **Email**: `student@dswf.org`
2. **Password**: `Student123!`
3. **Set role**: `"student"`
4. **Test**: http://localhost:5173/dashboard/student

---

## 6️⃣ CREATE TEACHER USER

1. **Email**: `teacher@dswf.org`
2. **Password**: `Teacher123!`
3. **Set role**: `"teacher"`
4. **Test**: http://localhost:5173/dashboard/teacher

---

## 7️⃣ CREATE PHARMACY STAFF USER

1. **Email**: `pharmacy@dswf.org`
2. **Password**: `Pharmacy123!`
3. **Set role**: `"pharmacy"`
4. **Test**: http://localhost:5173/dashboard/pharmacy

---

## ✅ VERIFICATION CHECKLIST

After creating all users, verify:

- [ ] Admin can access: http://localhost:5173/dashboard/admin
- [ ] Patient can access: http://localhost:5173/dashboard/patient
- [ ] Donor can access: http://localhost:5173/dashboard/donor
- [ ] Lab can access: http://localhost:5173/dashboard/lab
- [ ] Student can access: http://localhost:5173/dashboard/student
- [ ] Teacher can access: http://localhost:5173/dashboard/teacher
- [ ] Pharmacy can access: http://localhost:5173/dashboard/pharmacy

---

## 📊 Your Test Accounts Summary

| Email | Password | Role | Dashboard URL |
|-------|----------|------|---------------|
| admin@dswf.org | Admin123! | admin | /dashboard/admin |
| patient@dswf.org | Patient123! | patient | /dashboard/patient |
| donor@dswf.org | Donor123! | donor | /dashboard/donor |
| lab@dswf.org | Lab123! | lab | /dashboard/lab |
| student@dswf.org | Student123! | student | /dashboard/student |
| teacher@dswf.org | Teacher123! | teacher | /dashboard/teacher |
| pharmacy@dswf.org | Pharmacy123! | pharmacy | /dashboard/pharmacy |

---

## 🎯 NEXT: ADD SAMPLE DATA

### 1. Add Doctors (as Admin)

Go to Supabase → SQL Editor and run:

```sql
INSERT INTO public.doctors (name, specialization, discount_rate) VALUES
  ('Dr. Ahmed Khan', 'General Physician', 50.00),
  ('Dr. Fatima Ali', 'Pediatrician', 50.00),
  ('Dr. Hassan Raza', 'Cardiologist', 50.00);
```

### 2. Add Medicines (as Pharmacy)

You can use the API or Supabase SQL Editor:

```sql
INSERT INTO public.pharmacy_items (name, stock, expiry, discount_rate) VALUES
  ('Paracetamol 500mg', 1000, '2025-12-31', 50.00),
  ('Ibuprofen 400mg', 800, '2025-11-30', 50.00);
```

### 3. Add Courses (as Teacher)

Log in as teacher and use this API call (via Postman or curl):

```bash
curl -X POST http://localhost:4000/api/courses \
  -H "Authorization: Bearer YOUR_TEACHER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Ultrasound Training",
    "description": "Complete ultrasound technician training",
    "duration": "3 months",
    "discount_rate": 70
  }'
```

Or via SQL:

```sql
-- Get teacher's user ID first from auth.users
INSERT INTO public.courses (title, description, trainer_id, discount_rate, duration) VALUES
  ('Ultrasound Training', 'Complete ultrasound technician course', 'TEACHER_USER_ID', 70.00, '3 months');
```

---

## 🧪 TEST SCENARIOS

### Test 1: Make a Donation (as Donor)
1. Log in as `donor@dswf.org`
2. Go to http://localhost:5173/donation
3. Select purpose: "Medical Support"
4. Amount: 5000
5. Click "Donate Now"
6. Check dashboard for donation history

### Test 2: Enroll in Course (as Student)
1. Log in as `student@dswf.org`
2. View available courses
3. Enroll in "Ultrasound Training"
4. Verify 70% discount applied

### Test 3: Add Medicine (as Pharmacy)
1. Log in as `pharmacy@dswf.org`
2. Use API or add via Supabase
3. View inventory in dashboard

### Test 4: Upload Lab Report (as Lab)
1. Log in as `lab@dswf.org`
2. Upload a PDF file
3. Select patient
4. Add remarks
5. Submit
6. Patient receives notification

---

## 🔧 TROUBLESHOOTING

### "Cannot access dashboard"
- Make sure you set the role in Supabase
- Log out and log back in
- Check browser console for errors

### "User not found"
- Sign up first before setting role
- Check spelling of email

### "Invalid token"
- Log out and log in again
- Check that backend is running

### "Role not allowed"
- Verify role spelling is exact: `"patient"` not `"Patient"`
- Must be one of: patient, donor, admin, lab, student, teacher, pharmacy

---

## 📱 QUICK TIPS

### Use Multiple Browser Profiles
- Chrome Profile 1: Admin
- Chrome Profile 2: Patient
- Chrome Profile 3: Donor
- Incognito: For testing

### Keep Supabase Open
Have these tabs open:
1. Frontend: http://localhost:5173
2. Supabase Users: https://supabase.com/dashboard/project/qudebdejubackprbarvc/auth/users
3. Supabase Tables: https://supabase.com/dashboard/project/qudebdejubackprbarvc/editor

### Use Postman for API Testing
Import `postman-collection.json` to test APIs easily.

---

## 🎉 YOU'RE DONE!

You now have all 7 user types ready for testing!

**Next steps:**
1. ✅ Test each dashboard
2. ✅ Add sample data (doctors, courses, medicines)
3. ✅ Test integrations (donations, enrollments, uploads)
4. ✅ Follow TESTING-CHECKLIST.md for complete testing

---

**Happy testing!** 🚀

If you get stuck, refer to:
- **USER-ROLES-GUIDE.md** - Detailed role information
- **TESTING-CHECKLIST.md** - Complete testing guide
- **START-HERE.md** - General setup help

