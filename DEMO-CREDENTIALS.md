# 🔑 Demo Credentials - Dr. Sanaullah Welfare Foundation

Use these credentials to login and test all features!

---

## 📋 **ALL DEMO ACCOUNTS:**

| Role | Email | Password | Dashboard URL |
|------|-------|----------|---------------|
| **Admin** | admin@dswf.org | Admin123! | /dashboard/admin |
| **Patient** | patient@dswf.org | Patient123! | /dashboard/patient |
| **Donor** | donor@dswf.org | Donor123! | /dashboard/donor |
| **Lab Staff** | lab@dswf.org | Lab123! | /dashboard/lab |
| **Student** | student@dswf.org | Student123! | /dashboard/student |
| **Teacher** | teacher@dswf.org | Teacher123! | /dashboard/teacher |
| **Pharmacy** | pharmacy@dswf.org | Pharmacy123! | /dashboard/pharmacy |

---

## 🚀 **QUICK LOGIN:**

### **1. Admin (Full System Access)**
```
Email:    admin@dswf.org
Password: Admin123!
URL:      http://localhost:5173/dashboard/admin
```

**Features:**
- Manage all users
- View all donations
- Add doctors
- Manage courses
- Content management
- Full analytics

---

### **2. Patient (Medical Services)**
```
Email:    patient@dswf.org
Password: Patient123!
URL:      http://localhost:5173/dashboard/patient
```

**Features:**
- Edit profile
- View doctors (50% discount)
- Book appointments
- View lab reports (60% discount)
- View prescriptions
- Check notifications

---

### **3. Donor (Make Donations)**
```
Email:    donor@dswf.org
Password: Donor123!
URL:      http://localhost:5173/dashboard/donor
```

**Features:**
- Make donations
- View donation history
- Download receipts
- Track impact

---

### **4. Lab Staff (Upload Reports)**
```
Email:    lab@dswf.org
Password: Lab123!
URL:      http://localhost:5173/dashboard/lab
```

**Features:**
- View test requests
- Upload lab reports
- Manage pricing
- Send notifications

---

### **5. Student (Course Enrollment)**
```
Email:    student@dswf.org
Password: Student123!
URL:      http://localhost:5173/dashboard/student
```

**Features:**
- Browse courses
- Enroll with 70% discount
- Track progress
- Download certificates

---

### **6. Teacher (Create Courses)**
```
Email:    teacher@dswf.org
Password: Teacher123!
URL:      http://localhost:5173/dashboard/teacher
```

**Features:**
- Create courses
- Upload materials
- Manage students
- Mark attendance

---

### **7. Pharmacy (Manage Inventory)**
```
Email:    pharmacy@dswf.org
Password: Pharmacy123!
URL:      http://localhost:5173/dashboard/pharmacy
```

**Features:**
- Manage inventory
- Process prescriptions (50% discount)
- Track stock
- Generate reports

---

## 🎯 **HOW TO USE:**

### **Step 1: Go to Login**
Visit: http://localhost:5173/login

### **Step 2: Choose a Role**
Pick one of the demo accounts above

### **Step 3: Login**
1. Enter email
2. Enter password
3. Click "Login with Email"

### **Step 4: Set Role (First Time Only)**
If the account doesn't exist yet:
1. Sign up with the credentials
2. Go to Supabase Dashboard
3. Set the role in user metadata

---

## ⚡ **QUICK SETUP FOR ALL ACCOUNTS:**

### **Option 1: Manual Signup (Recommended)**

For each account:
1. Go to http://localhost:5173/login
2. Enter email and password
3. Click signup
4. Go to Supabase: https://supabase.com/dashboard/project/qudebdejubackprbarvc
5. Authentication → Users → Click user → Edit User Metadata
6. Add: `{"role": "admin"}` (or patient, donor, etc.)
7. Save

### **Option 2: Use Supabase Auth (Advanced)**

Create all users via Supabase Dashboard directly.

---

## 🎨 **WHAT TO TEST:**

### **As Admin:**
- ✅ View user management table
- ✅ See donation statistics
- ✅ Add a doctor (click "Add Doctor" button)
- ✅ Approve users
- ✅ Manage content

### **As Patient:**
- ✅ Edit your profile
- ✅ Browse doctors with discounts
- ✅ View discount cards (50-60% off)
- ✅ Check notifications

### **As Donor:**
- ✅ Make a donation
- ✅ View donation history
- ✅ Download receipt

### **As Lab:**
- ✅ Upload lab reports (via API/future UI)
- ✅ View test requests

### **As Student:**
- ✅ Browse courses
- ✅ Enroll with 70% discount
- ✅ View progress

### **As Teacher:**
- ✅ Create courses
- ✅ View students
- ✅ Manage materials

### **As Pharmacy:**
- ✅ Manage medicines
- ✅ Process prescriptions
- ✅ Check low stock

---

## 📊 **CURRENT STATUS:**

```
✅ Admin Panel    - FULLY BUILT (6 tabs, full features)
✅ Patient Panel  - FULLY BUILT (6 tabs, full features)
⏳ Donor Panel    - Basic (needs enhancement)
⏳ Lab Panel      - Basic (needs enhancement)
⏳ Student Panel  - Basic (needs enhancement)
⏳ Teacher Panel  - Basic (needs enhancement)
⏳ Pharmacy Panel - Basic (needs enhancement)
```

---

## 🔐 **SECURITY NOTES:**

- These are **DEMO credentials** for testing
- In production, use real emails and strong passwords
- Never commit real credentials to Git
- Use environment variables for sensitive data

---

## 💡 **TIPS:**

### **Easy Testing:**
1. Use different browser profiles for each role
2. Or use incognito windows
3. Keep Supabase dashboard open

### **For Quick Access:**
Bookmark these URLs:
- Admin: http://localhost:5173/dashboard/admin
- Patient: http://localhost:5173/dashboard/patient
- Donor: http://localhost:5173/dashboard/donor

---

## 🎉 **READY TO TEST!**

**Start with Admin account to see the most features!**

```
http://localhost:5173/login
↓
Email: admin@dswf.org
Password: Admin123!
↓
Dashboard with full features!
```

---

**All demo credentials are ready!** 🚀

**Note:** You may need to create these accounts and set roles in Supabase first (see CREATE-USERS-STEP-BY-STEP.md for details).

