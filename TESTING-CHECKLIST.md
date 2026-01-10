# ✅ Complete Testing Checklist

Use this checklist to systematically test all features of the Dr. Sanaullah Welfare Foundation platform.

---

## 📋 Pre-Testing Setup

### ✅ Environment Setup
- [ ] Backend server running on port 4000
- [ ] Frontend server running on port 5173
- [ ] Supabase project accessible
- [ ] Database schema executed
- [ ] Storage buckets created (lab-reports, prescriptions, certificates, receipts)
- [ ] Sample data loaded (doctors, courses, pharmacy items)

### ✅ Test Accounts Created
- [ ] Admin account (`admin@test.com`)
- [ ] Patient account (`patient@test.com`)
- [ ] Donor account (`donor@test.com`)
- [ ] Lab account (`lab@test.com`)
- [ ] Student account (`student@test.com`)
- [ ] Teacher account (`teacher@test.com`)
- [ ] Pharmacy account (`pharmacy@test.com`)

---

## 🔐 Authentication Tests

### Email Authentication
- [ ] Sign up with email and password
- [ ] Receive verification email (if configured)
- [ ] Log in with email and password
- [ ] Log out successfully
- [ ] Password reset flow (if configured)

### Phone OTP Authentication
- [ ] Sign up with phone number
- [ ] Receive OTP code
- [ ] Verify OTP and complete signup
- [ ] Log in with phone OTP

### Role Assignment
- [ ] Set user role in Supabase dashboard
- [ ] Verify role appears in user metadata
- [ ] Confirm role-based redirect after login

---

## 👥 User Role Tests

### 1️⃣ Patient Role Tests

#### Profile Management
- [ ] View patient profile
- [ ] Update name, age, gender
- [ ] Add/update CNIC
- [ ] Add medical history
- [ ] Save changes successfully

#### Lab Reports
- [ ] View list of lab reports (empty initially)
- [ ] Download lab report (after lab uploads)
- [ ] View report details and remarks
- [ ] Receive notification when report ready

#### Prescriptions
- [ ] View prescriptions list
- [ ] Download prescription file
- [ ] See prescription details

#### Appointments (Placeholder)
- [ ] View appointment section
- [ ] See available doctors with discounts

---

### 2️⃣ Donor Role Tests

#### Make Donation
- [ ] Navigate to donation page
- [ ] Select purpose (Medical, Education, Orphan, General)
- [ ] Enter donation amount
- [ ] Submit donation
- [ ] See success message
- [ ] Receive confirmation notification

#### Donation History
- [ ] View list of past donations
- [ ] See donation details (amount, purpose, date)
- [ ] Download receipt (HTML)
- [ ] Verify receipt contains correct information

#### Transparency
- [ ] See total donated amount
- [ ] View donation impact/purpose tracking

---

### 3️⃣ Admin Role Tests

#### User Management
- [ ] View list of all users
- [ ] Filter users by role
- [ ] Approve user registration
- [ ] Reject user registration
- [ ] Change user role
- [ ] View user details

#### Donation Management
- [ ] View all donations (GET /api/donations/all)
- [ ] See donation summaries
- [ ] Export donation data
- [ ] Verify donor information

#### Course Management
- [ ] View all courses
- [ ] Approve teacher course requests
- [ ] Edit course details
- [ ] Assign trainers to courses

#### System Overview
- [ ] View dashboard metrics
- [ ] Monitor system activity
- [ ] Access all sections

---

### 4️⃣ Lab Staff Role Tests

#### Test Requests
- [ ] View incoming test requests
- [ ] See pending tests
- [ ] Track completed tests

#### Report Upload
- [ ] Upload PDF lab report
- [ ] Upload image (JPEG/PNG) report
- [ ] Add patient ID
- [ ] Add remarks/notes
- [ ] Submit successfully
- [ ] Verify file stored in Supabase Storage

#### Notifications
- [ ] Patient receives notification after upload
- [ ] Notification shows in patient dashboard

#### Report Access
- [ ] Generate signed URL for report
- [ ] Verify 7-day expiry on signed URL
- [ ] Download report as patient

---

### 5️⃣ Student Role Tests

#### Browse Courses
- [ ] View available courses
- [ ] See course details (title, description, duration)
- [ ] See discount rate (70%)
- [ ] View trainer information

#### Enroll in Course
- [ ] Enroll in a course
- [ ] Verify enrollment success
- [ ] See 70% discount applied
- [ ] Course appears in "My Courses"

#### Track Progress
- [ ] View course progress percentage
- [ ] See completion status
- [ ] Access course materials (if uploaded)

#### Certificates
- [ ] View issued certificates
- [ ] Download certificate (after completion)
- [ ] Verify signed URL works

---

### 6️⃣ Teacher Role Tests

#### Create Course
- [ ] Create new course
- [ ] Add title and description
- [ ] Set duration
- [ ] Set discount rate
- [ ] Submit for admin approval

#### Manage Students
- [ ] View enrolled students in course
- [ ] See student count
- [ ] Mark attendance (if feature added)
- [ ] Update student progress

#### Course Content
- [ ] Upload course materials
- [ ] Post announcements
- [ ] Assign tasks (if feature added)

#### Issue Certificates
- [ ] Issue certificate to student
- [ ] Upload certificate file
- [ ] Student receives notification

---

### 7️⃣ Pharmacy Role Tests

#### Inventory Management
- [ ] View pharmacy inventory
- [ ] Add new medicine
- [ ] Update stock quantity
- [ ] Set expiry date
- [ ] Set discount rate (50%)

#### Low Stock Alerts
- [ ] See low stock items
- [ ] Verify admin notification for low stock

#### Prescription Processing
- [ ] Receive prescription
- [ ] Link prescription to inventory item
- [ ] Apply 50% discount
- [ ] Process prescription

#### Reports
- [ ] Generate inventory report
- [ ] View expiry alerts
- [ ] See sales data

---

## 🔄 Integration Tests

### Patient → Lab Flow
- [ ] Patient books test (placeholder)
- [ ] Lab receives request
- [ ] Lab uploads report
- [ ] Patient receives notification
- [ ] Patient downloads report

### Student → Teacher Flow
- [ ] Student enrolls in course
- [ ] Teacher sees new enrollment
- [ ] Teacher updates progress
- [ ] Teacher issues certificate
- [ ] Student downloads certificate

### Patient → Pharmacy Flow
- [ ] Doctor creates prescription
- [ ] Pharmacy receives prescription
- [ ] Pharmacy applies discount
- [ ] Patient picks up medicine

### Donation → Admin Flow
- [ ] Donor makes donation
- [ ] Admin sees in donation list
- [ ] Admin generates report
- [ ] Transparency maintained

---

## 📁 File Upload/Download Tests

### Lab Reports
- [ ] Upload PDF (< 20MB)
- [ ] Upload JPEG/PNG image
- [ ] File stored in `lab-reports` bucket
- [ ] Signed URL generated (7-day expiry)
- [ ] Download works correctly
- [ ] URL expires after 7 days

### Prescriptions
- [ ] Upload prescription file
- [ ] File stored in `prescriptions` bucket
- [ ] Patient can access via signed URL

### Certificates
- [ ] Upload certificate
- [ ] File stored in `certificates` bucket
- [ ] Student can download

### Receipts
- [ ] Receipt generated as HTML
- [ ] PDF generation (if enabled)
- [ ] File stored in `receipts` bucket

---

## 🔔 Notification Tests

### Notification Triggers
- [ ] Lab report ready → Patient
- [ ] Donation confirmed → Donor
- [ ] Certificate issued → Student
- [ ] New prescription → Patient
- [ ] Low stock → Admin/Pharmacy
- [ ] Course enrollment → Teacher

### Notification Display
- [ ] Notifications appear in user dashboard
- [ ] Unread count shown
- [ ] Mark as read functionality
- [ ] Notification sorted by date

---

## 🔒 Security Tests

### Authentication
- [ ] Unauthenticated users redirected to login
- [ ] Protected routes require valid token
- [ ] Invalid token returns 401 error
- [ ] Token expiry handled correctly

### Authorization (RBAC)
- [ ] Patient cannot access admin routes
- [ ] Donor cannot access lab routes
- [ ] Lab cannot access pharmacy routes
- [ ] Each role only accesses authorized endpoints

### Data Access
- [ ] Users can only view own data
- [ ] Admin can view all data
- [ ] RLS policies enforced in database
- [ ] File uploads restricted by role

### Input Validation
- [ ] SQL injection prevented
- [ ] XSS attacks prevented
- [ ] File upload size limits enforced
- [ ] MIME type validation works

---

## 🌐 Frontend Tests

### Pages Load
- [ ] Home page loads
- [ ] About page loads
- [ ] Contact page loads
- [ ] Donation page loads
- [ ] Login page loads
- [ ] All 7 dashboards load

### Responsive Design
- [ ] Mobile view (< 640px)
- [ ] Tablet view (640px - 1024px)
- [ ] Desktop view (> 1024px)
- [ ] All forms usable on mobile

### Navigation
- [ ] Navbar links work
- [ ] Dashboard navigation works
- [ ] Back button works
- [ ] Logout redirects to home

### Forms
- [ ] Form validation works
- [ ] Error messages display
- [ ] Success messages display
- [ ] Loading states show during submit

---

## 🚀 API Tests

### Health Check
- [ ] GET /health returns 200 OK

### Authentication Endpoints
- [ ] POST /api/auth/signup-email works
- [ ] POST /api/auth/otp works
- [ ] POST /api/auth/set-role works

### Protected Endpoints
- [ ] All require valid Authorization header
- [ ] Return 401 without token
- [ ] Return 403 for wrong role

### Data Endpoints
- [ ] All CRUD operations work
- [ ] Proper error handling
- [ ] Validation errors returned
- [ ] Success responses correct

---

## 📊 Database Tests

### Schema
- [ ] All tables created
- [ ] Foreign keys work
- [ ] Constraints enforced
- [ ] Indexes created (if any)

### RLS Policies
- [ ] Users can view own data
- [ ] Users can update own data
- [ ] Admin can view all data
- [ ] Unauthorized access blocked

### Data Integrity
- [ ] Cascading deletes work
- [ ] Unique constraints enforced
- [ ] Check constraints work
- [ ] Default values set correctly

---

## 🎯 Performance Tests

### Page Load Times
- [ ] Home page < 2 seconds
- [ ] Dashboard < 3 seconds
- [ ] API responses < 500ms

### File Uploads
- [ ] Small files (< 1MB) upload quickly
- [ ] Large files (10-20MB) upload successfully
- [ ] Progress indicator works

### Database Queries
- [ ] List queries paginated
- [ ] Large datasets load efficiently
- [ ] No N+1 query problems

---

## 🐛 Error Handling Tests

### Backend Errors
- [ ] 400 Bad Request for invalid input
- [ ] 401 Unauthorized for missing token
- [ ] 403 Forbidden for wrong role
- [ ] 404 Not Found for missing resources
- [ ] 500 Internal Server Error handled gracefully

### Frontend Errors
- [ ] Network errors shown to user
- [ ] Form validation errors displayed
- [ ] Retry mechanisms work
- [ ] Fallback UI for errors

---

## ✅ Final Checklist

### Documentation
- [ ] README.md accurate
- [ ] SETUP.md complete
- [ ] DEPLOYMENT.md tested
- [ ] FEATURES.md comprehensive
- [ ] API documentation current

### Code Quality
- [ ] No console errors
- [ ] No console warnings
- [ ] Code formatted consistently
- [ ] Comments where needed

### Production Readiness
- [ ] Environment variables set
- [ ] HTTPS enabled
- [ ] CORS configured
- [ ] Rate limiting added (optional)
- [ ] Monitoring setup (optional)
- [ ] Backup strategy defined

---

## 📝 Test Results Template

Copy this for each testing session:

```
Date: ___________
Tester: ___________

Passed: ___ / ___
Failed: ___ / ___
Skipped: ___ / ___

Critical Issues:
-
-

Minor Issues:
-
-

Notes:
-
-
```

---

**Use this checklist to ensure every feature works correctly before deployment!** ✅

Import `postman-collection.json` into Postman for easy API testing.

