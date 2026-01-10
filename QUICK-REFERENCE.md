# 🚀 QUICK REFERENCE CARD

## 🌐 Main URLs

| Page | URL | What's There |
|------|-----|--------------|
| **Home** | http://localhost:5173 | Landing page |
| **Login/Signup** | http://localhost:5173/login | ⭐ NEW! Beautiful auth page |
| **Demo Credentials** | http://localhost:5173/demo | All test accounts |
| **About** | http://localhost:5173/about | About the foundation |
| **Contact** | http://localhost:5173/contact | Contact info |
| **Donate** | http://localhost:5173/donation | Make donations |

---

## 👥 Demo Credentials (For Testing)

### **Patient**
- Email: `patient@dswf.org`
- Password: `Patient123!`
- Dashboard: http://localhost:5173/dashboard/patient

### **Donor**
- Email: `donor@dswf.org`
- Password: `Donor123!`
- Dashboard: http://localhost:5173/dashboard/donor

### **Admin**
- Email: `admin@dswf.org`
- Password: `Admin123!`
- Dashboard: http://localhost:5173/dashboard/admin

### **Lab Staff**
- Email: `lab@dswf.org`
- Password: `Lab123!`
- Dashboard: http://localhost:5173/dashboard/lab

### **Student**
- Email: `student@dswf.org`
- Password: `Student123!`
- Dashboard: http://localhost:5173/dashboard/student

### **Teacher**
- Email: `teacher@dswf.org`
- Password: `Teacher123!`
- Dashboard: http://localhost:5173/dashboard/teacher

### **Pharmacy**
- Email: `pharmacy@dswf.org`
- Password: `Pharmacy123!`
- Dashboard: http://localhost:5173/dashboard/pharmacy

---

## 🎯 Quick Test Flows

### **Test New Patient Signup (3 Steps):**
1. Go to: http://localhost:5173/login
2. Click: "Sign Up" tab
3. **Step 1:** Fill Name, Email, Password → Click "Next"
4. **Step 2:** Select Patient 🩺 → Click "Next: Complete Profile"
5. **Step 3:** Fill Age, Gender, CNIC, Medical History → Click "Complete Registration"
6. ✅ Auto-redirected to dashboard with complete profile!

### **Test Other Role Signup (2 Steps):**
1. Go to: http://localhost:5173/login
2. Click: "Sign Up" tab
3. **Step 1:** Fill Name, Email, Password → Click "Next"
4. **Step 2:** Select any non-patient role → Click "Create Account"
5. ✅ Auto-redirected to dashboard!

### **Test Existing Login:**
1. Go to: http://localhost:5173/login
2. Use: `patient@dswf.org` / `Patient123!`
3. Click: "Sign In"
4. ✅ Auto-redirected to Patient dashboard!

---

## 🎨 What's New?

### **✨ Beautiful Login/Signup Page**
- Gradient background
- Role selection with icons
- Two-step signup process
- Email/Phone toggle
- Auto-routing to dashboards
- Success/error messages

---

## 🛠 Server Commands

### **Start Backend:**
```bash
cd apps/backend
npm run dev
```
Runs on: http://localhost:4000

### **Start Frontend:**
```bash
cd apps/frontend
npm run dev
```
Runs on: http://localhost:5173

---

## 📊 Panel Status

| Panel | Status | Features |
|-------|--------|----------|
| Patient | ✅ Complete | Profile, Doctors, Reports, Prescriptions |
| Admin | ✅ Complete | Users, Donations, Doctors, Analytics |
| Donor | ⚠️ Basic | View donations, receipts |
| Lab | ⚠️ Basic | Upload reports |
| Student | ⚠️ Basic | View courses |
| Teacher | ⚠️ Basic | Create courses |
| Pharmacy | ⚠️ Basic | Manage inventory |

---

## 🎁 Role Features

### **Patient (🩺)**
- View doctors with discounts
- Book appointments
- Download lab reports
- View prescriptions
- Edit profile

### **Donor (💰)**
- Make donations
- Download receipts
- View donation history

### **Admin (👑)**
- Manage all users
- View all donations
- Add doctors
- System analytics

### **Lab (🧪)**
- Upload lab reports
- Manage test requests
- Send notifications

### **Student (🎓)**
- Enroll in courses (70% discount)
- Track progress
- Download certificates

### **Teacher (👨‍🏫)**
- Create courses
- Upload materials
- Manage students

### **Pharmacy (💊)**
- Manage inventory
- Process prescriptions
- Stock alerts

---

## 📚 Documentation Files

- `README.md` - Project overview
- `SETUP.md` - Setup instructions
- `START-HERE.md` - Getting started guide
- `LOGIN-SIGNUP-GUIDE.md` - Auth system guide
- `NEW-LOGIN-FEATURES.md` - What's new in login
- `🎉-LOGIN-PAGE-COMPLETE.md` - Login completion summary
- `DEMO-CREDENTIALS.md` - All test accounts
- `QUICK-REFERENCE.md` - This file!

---

## 🎯 Common Tasks

### **Create a New User:**
1. Go to /login
2. Click "Sign Up"
3. Fill form + select role
4. Submit

### **Login as Patient:**
1. Go to /login
2. Use patient@dswf.org / Patient123!
3. Submit

### **View Demo Accounts:**
1. Go to /demo
2. Copy credentials
3. Use for login

### **Make a Donation:**
1. Login as donor
2. Go to /donation
3. Fill form
4. Submit

---

## 🚨 Troubleshooting

### **Backend Not Running:**
```bash
cd apps/backend
npm install
npm run dev
```

### **Frontend Not Running:**
```bash
cd apps/frontend
npm install
npm run dev
```

### **Database Issues:**
- Check Supabase connection
- Verify .env files exist
- Run schema.sql in Supabase

### **Login Issues:**
- Check user exists in Supabase
- Verify role is set in user_metadata
- Check browser console for errors

---

## ✅ Quick Checks

- [ ] Backend running on :4000
- [ ] Frontend running on :5173
- [ ] Login page loads
- [ ] Can toggle Login/Signup
- [ ] Can select roles
- [ ] Demo credentials work
- [ ] Auto-redirect works

---

## 🎊 MAIN ACHIEVEMENT

### **✨ BEAUTIFUL LOGIN/SIGNUP PAGE IS COMPLETE!**

**Go see it:** http://localhost:5173/login

Features:
- ✅ Role selection with icons
- ✅ Two-step signup
- ✅ Modern design
- ✅ Auto-routing
- ✅ Mobile responsive

---

**Keep this file handy for quick reference!** 📌

