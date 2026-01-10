# 👥 Complete User Roles Guide

Step-by-step guide to create and test all 7 user roles in the system.

---

## 🎯 Overview of All Roles

| Role | Purpose | Key Features |
|------|---------|--------------|
| **Patient** | Medical services | View lab reports, prescriptions, book appointments |
| **Donor** | Make donations | Donate money, view history, download receipts |
| **Admin** | System management | Manage all users, approve registrations, full access |
| **Lab** | Lab services | Upload test reports, manage requests, notify patients |
| **Student** | Education | Enroll in courses, track progress, download certificates |
| **Teacher** | Teaching | Create courses, manage students, upload materials |
| **Pharmacy** | Medicine management | Manage inventory, process prescriptions, track stock |

---

## 📝 How to Create Users for Each Role

### Method 1: Via Website (Recommended)

#### Step 1: Sign Up
1. Go to http://localhost:5173/login
2. Enter email and password (or phone number)
3. Click "Sign Up" or "Send OTP"

#### Step 2: Assign Role in Supabase
1. Go to https://supabase.com/dashboard/project/qudebdejubackprbarvc
2. Click **Authentication** → **Users** (left sidebar)
3. Click on the newly created user
4. Scroll to **User Metadata** section
5. Click **Edit**
6. Add the role (see examples below)
7. Click **Save**

---

## 🔑 Role Assignment Examples

### For Patient
```json
{
  "role": "patient"
}
```

### For Donor
```json
{
  "role": "donor"
}
```

### For Admin
```json
{
  "role": "admin"
}
```

### For Lab Staff
```json
{
  "role": "lab"
}
```

### For Student
```json
{
  "role": "student"
}
```

### For Teacher
```json
{
  "role": "teacher"
}
```

### For Pharmacy Staff
```json
{
  "role": "pharmacy"
}
```

---

## 🧪 Testing Each Role

### 1️⃣ Patient Role

**Create Patient Account:**
1. Sign up with email: `patient@test.com` / password: `Patient123!`
2. Set role to `"patient"` in Supabase
3. Log in and visit: http://localhost:5173/dashboard/patient

**What to Test:**
- ✅ View profile
- ✅ Update patient details (age, CNIC, gender, medical history)
- ✅ View lab reports (after lab uploads one)
- ✅ View prescriptions
- ✅ Check notifications

**Sample Patient Data:**
```json
{
  "name": "Ahmed Ali",
  "email": "patient@test.com",
  "role": "patient",
  "gender": "male",
  "age": 35,
  "cnic": "12345-6789012-3"
}
```

---

### 2️⃣ Donor Role

**Create Donor Account:**
1. Sign up with email: `donor@test.com` / password: `Donor123!`
2. Set role to `"donor"` in Supabase
3. Log in and visit: http://localhost:5173/dashboard/donor

**What to Test:**
- ✅ Make a donation (http://localhost:5173/donation)
- ✅ Select purpose (Medical, Education, Orphan, General)
- ✅ View donation history
- ✅ Download receipts
- ✅ Check total donated amount

**Test Donation:**
1. Go to http://localhost:5173/donation
2. Select purpose: "Medical Support"
3. Enter amount: 5000
4. Click "Donate Now"
5. View receipt

---

### 3️⃣ Admin Role

**Create Admin Account:**
1. Sign up with email: `admin@test.com` / password: `Admin123!`
2. Set role to `"admin"` in Supabase
3. Log in and visit: http://localhost:5173/dashboard/admin

**What to Test:**
- ✅ View all users
- ✅ Approve/reject registrations
- ✅ View all donations (GET /api/donations/all)
- ✅ Manage doctors, courses, inventory
- ✅ Full system access

**Admin Capabilities:**
- Manage all 7 user types
- View donation summaries
- Approve course requests
- Monitor system activity

---

### 4️⃣ Lab Staff Role

**Create Lab Account:**
1. Sign up with email: `lab@test.com` / password: `Lab123!`
2. Set role to `"lab"` in Supabase
3. Log in and visit: http://localhost:5173/dashboard/lab

**What to Test:**
- ✅ View test requests
- ✅ Upload lab reports (PDF/images)
- ✅ Notify patients when results ready
- ✅ Track pending/completed tests

**How to Upload Lab Report:**
You'll need to use the API or create a form. Here's the API call:

```bash
# Upload a lab report
POST http://localhost:4000/api/lab/reports/upload
Headers: Authorization: Bearer YOUR_TOKEN
Body (multipart):
  - file: (PDF or image file)
  - patientId: (patient's user ID from Supabase)
  - remarks: "Blood test results normal"
```

---

### 5️⃣ Student Role

**Create Student Account:**
1. Sign up with email: `student@test.com` / password: `Student123!`
2. Set role to `"student"` in Supabase
3. Log in and visit: http://localhost:5173/dashboard/student

**What to Test:**
- ✅ Browse available courses
- ✅ Enroll in courses (70% discount applied)
- ✅ Track progress
- ✅ Download certificates (when issued)

**Sample Courses to Create (as Teacher or Admin):**
- Ultrasound Training (3 months)
- ECG Technician Course (2 months)
- Lab Technician Training (6 months)
- First Aid & Emergency Care (1 month)

---

### 6️⃣ Teacher Role

**Create Teacher Account:**
1. Sign up with email: `teacher@test.com` / password: `Teacher123!`
2. Set role to `"teacher"` in Supabase
3. Log in and visit: http://localhost:5173/dashboard/teacher

**What to Test:**
- ✅ Create new courses
- ✅ View enrolled students
- ✅ Mark attendance/progress
- ✅ Upload materials and assignments
- ✅ Request admin approval for courses

**Create a Course via API:**
```bash
POST http://localhost:4000/api/courses
Headers: Authorization: Bearer YOUR_TOKEN
Body (JSON):
{
  "title": "Ultrasound Training",
  "description": "Complete ultrasound technician training program",
  "duration": "3 months",
  "discount_rate": 70
}
```

---

### 7️⃣ Pharmacy Staff Role

**Create Pharmacy Account:**
1. Sign up with email: `pharmacy@test.com` / password: `Pharmacy123!`
2. Set role to `"pharmacy"` in Supabase
3. Log in and visit: http://localhost:5173/dashboard/pharmacy

**What to Test:**
- ✅ Add medicines to inventory
- ✅ Set stock levels and expiry dates
- ✅ Process prescriptions (50% discount)
- ✅ Track low stock alerts
- ✅ Generate reports

**Add Medicine via API:**
```bash
POST http://localhost:4000/api/pharmacy/items
Headers: Authorization: Bearer YOUR_TOKEN
Body (JSON):
{
  "name": "Paracetamol 500mg",
  "stock": 1000,
  "expiry": "2025-12-31",
  "discount_rate": 50
}
```

---

## 🎬 Complete Testing Workflow

### Scenario 1: Patient Gets Lab Test

1. **Patient** logs in and books test
2. **Lab Staff** uploads test report
3. **Patient** receives notification
4. **Patient** downloads report

### Scenario 2: Student Enrolls in Course

1. **Teacher** creates course
2. **Admin** approves course
3. **Student** enrolls with 70% discount
4. **Teacher** marks progress
5. **Admin/Teacher** issues certificate
6. **Student** downloads certificate

### Scenario 3: Patient Gets Medicine

1. Doctor prescribes medicine (prescription created)
2. **Pharmacy** receives prescription
3. **Pharmacy** applies 50% discount
4. **Patient** picks up medicine

### Scenario 4: Donation Flow

1. **Donor** selects cause
2. **Donor** enters amount
3. System generates receipt
4. **Admin** views in donation dashboard

---

## 📊 Quick Reference: Dashboard URLs

| Role | Dashboard URL |
|------|--------------|
| Patient | http://localhost:5173/dashboard/patient |
| Donor | http://localhost:5173/dashboard/donor |
| Admin | http://localhost:5173/dashboard/admin |
| Lab | http://localhost:5173/dashboard/lab |
| Student | http://localhost:5173/dashboard/student |
| Teacher | http://localhost:5173/dashboard/teacher |
| Pharmacy | http://localhost:5173/dashboard/pharmacy |

---

## 🔐 Sample Test Accounts

Create these accounts for quick testing:

| Email | Password | Role |
|-------|----------|------|
| admin@dswf.org | Admin123! | admin |
| patient@dswf.org | Patient123! | patient |
| donor@dswf.org | Donor123! | donor |
| lab@dswf.org | Lab123! | lab |
| student@dswf.org | Student123! | student |
| teacher@dswf.org | Teacher123! | teacher |
| pharmacy@dswf.org | Pharmacy123! | pharmacy |

---

## 🛠️ API Endpoints Quick Reference

### Authentication
```
POST /api/auth/signup-email - Sign up with email
POST /api/auth/otp - Send phone OTP
POST /api/auth/set-role - Set user role (admin)
```

### Patient
```
GET /api/patients/me - Get profile
PUT /api/patients/me - Update profile
GET /api/patients/me/reports - Get lab reports
```

### Donations
```
POST /api/donations - Make donation
GET /api/donations/me - My donations
GET /api/donations/all - All donations (admin)
GET /api/donations/:id/receipt - Download receipt
```

### Lab
```
GET /api/lab/tasks - Get test requests
POST /api/lab/reports/upload - Upload report
GET /api/lab/reports/:id/download - Download report
```

### Courses
```
GET /api/courses - List courses
POST /api/courses - Create course (teacher)
POST /api/courses/enroll - Enroll (student)
```

### Pharmacy
```
GET /api/pharmacy/items - List inventory
POST /api/pharmacy/items - Add item
POST /api/pharmacy/prescriptions - Process prescription
```

### Certificates
```
GET /api/certificates/my - My certificates
POST /api/certificates/issue - Issue certificate
GET /api/certificates/:id/download - Download
```

### Notifications
```
GET /api/notifications - Get notifications
POST /api/notifications/read - Mark as read
```

---

## 💡 Pro Tips

1. **Use Postman or Thunder Client** to test API endpoints easily
2. **Keep multiple browser profiles** logged in with different roles
3. **Use Supabase Dashboard** to view database changes in real-time
4. **Check browser console** for API errors
5. **Monitor backend terminal** for server logs

---

## 🎯 Next Steps After Creating Roles

1. ✅ Create all 7 test accounts
2. ✅ Test each dashboard
3. ✅ Create sample data (doctors, courses, medicines)
4. ✅ Test file uploads (lab reports, prescriptions)
5. ✅ Test donation flow with receipts
6. ✅ Deploy to production

---

**You now have a complete guide to test all user roles!** 🚀

For API testing, use Postman with the endpoints above, or build UI forms for each role's specific actions.

