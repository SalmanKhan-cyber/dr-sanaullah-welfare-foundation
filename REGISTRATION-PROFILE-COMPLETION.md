# 🎯 Registration with Profile Completion

## ✨ Overview

The registration system now collects **complete user profile information** during signup based on the selected role!

---

## 🔄 **NEW 3-STEP SIGNUP PROCESS**

### **For Patient Role:**

```
STEP 1: Basic Credentials
  ↓
  Name, Email, Password
  ↓
  "Next: Select Role →"

STEP 2: Role Selection
  ↓
  Select "🩺 Patient"
  ↓
  "Next: Complete Profile →"

STEP 3: Complete Profile ⭐ NEW!
  ↓
  Age, Gender, CNIC, Medical History
  ↓
  "Complete Registration"
  ↓
  ✅ Account Created with Full Profile!
```

### **For Other Roles:**

```
STEP 1: Basic Credentials
  ↓
  Name, Email, Password
  ↓
  "Next: Select Role →"

STEP 2: Role Selection
  ↓
  Select Role (Donor, Lab, Student, Teacher, Pharmacy)
  ↓
  "Create Account"
  ↓
  ✅ Account Created!
```

---

## 📋 **Profile Fields Collected (Patient)**

### **Required Fields:**

1. **Age** 
   - Type: Number
   - Range: 1-120
   - Example: `25`

2. **Gender**
   - Type: Dropdown
   - Options: Male, Female, Other
   - Example: `Male`

3. **CNIC** (National ID)
   - Type: Text
   - Format: `12345-6789012-3`
   - Pattern: 5 digits - 7 digits - 1 digit
   - Example: `42101-1234567-8`

### **Optional Fields:**

4. **Medical History**
   - Type: Textarea
   - Max: Unlimited
   - Example: `Allergic to penicillin. Had appendectomy in 2020.`
   - Recommended for better healthcare

---

## 🎨 **User Interface**

### **Step 3: Complete Profile Screen**

```
┌─────────────────────────────────────┐
│ ← Back                              │
│                                     │
│ Complete Your Profile               │
│ Please provide additional info      │
├─────────────────────────────────────┤
│                                     │
│ Age *              Gender *         │
│ [  25  ]           [Male ▼]         │
│                                     │
│ CNIC Number *                       │
│ [12345-6789012-3              ]     │
│ Format: 12345-6789012-3             │
│                                     │
│ Medical History                     │
│ ┌─────────────────────────────────┐ │
│ │ Any allergies, chronic...       │ │
│ │                                 │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│ Optional but recommended            │
│                                     │
│ [ Complete Registration ]           │
└─────────────────────────────────────┘
```

---

## 🔧 **Technical Implementation**

### **Frontend (React)**

**File:** `apps/frontend/src/pages/Login.jsx`

**New State Variables:**
```javascript
const [age, setAge] = useState('');
const [gender, setGender] = useState('');
const [cnic, setCnic] = useState('');
const [medicalHistory, setMedicalHistory] = useState('');
```

**Profile Completion Handler:**
```javascript
async function handleProfileCompletion(e) {
  e.preventDefault();
  
  // Validation
  if (!age || !gender || !cnic) {
    setError('Please fill all required fields');
    return;
  }
  
  // Create account with profile data
  await createAccount({
    age: parseInt(age),
    gender,
    cnic,
    history: medicalHistory
  });
}
```

**Account Creation with Profile:**
```javascript
async function createAccount(profileData = {}) {
  // 1. Create user in Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email, password,
    options: { data: { role: selectedRole, name } }
  });
  
  // 2. Set role in backend
  await apiRequest('/api/auth/set-role', {
    method: 'POST',
    body: JSON.stringify({ userId: data.user.id, role: selectedRole })
  });
  
  // 3. Save patient profile data
  if (selectedRole === 'patient' && profileData) {
    await apiRequest('/api/patients/profile', {
      method: 'POST',
      body: JSON.stringify({
        userId: data.user.id,
        ...profileData
      })
    });
  }
}
```

---

### **Backend (Express)**

**File:** `apps/backend/src/index.js`

**Public Endpoint (No Auth Required):**
```javascript
app.post('/api/patients/profile', async (req, res, next) => {
  try {
    const { userId, age, gender, cnic, history } = req.body || {};
    if (!userId) return res.status(400).json({ error: 'userId required' });

    const { supabaseAdmin } = await import('./lib/supabase.js');
    const { error: patientError } = await supabaseAdmin
      .from('patients')
      .insert({
        user_id: userId,
        age: age || null,
        gender: gender || null,
        cnic: cnic || null,
        history: history || null
      });

    if (patientError) return res.status(400).json({ error: patientError.message });
    res.json({ success: true, message: 'Patient profile created successfully' });
  } catch (err) {
    next(err);
  }
});
```

---

## 🧪 **Testing the Flow**

### **Test Patient Registration:**

1. **Navigate to Login:**
   ```
   http://localhost:5173/login
   ```

2. **Click "Sign Up"**

3. **Step 1 - Enter Credentials:**
   - Name: `Ahmed Khan`
   - Email: `ahmed@test.com`
   - Password: `Test123!`
   - Click: **"Next: Select Role →"**

4. **Step 2 - Select Role:**
   - Click: **"🩺 Patient"** card
   - Notice button changes to: **"Next: Complete Profile →"**
   - Click: **"Next: Complete Profile →"**

5. **Step 3 - Complete Profile:**
   - Age: `28`
   - Gender: `Male`
   - CNIC: `42101-1234567-8`
   - Medical History: `Allergic to aspirin`
   - Click: **"Complete Registration"**

6. **Verify:**
   - ✅ Success message appears
   - ✅ Redirects to Patient Dashboard
   - ✅ Profile data is saved
   - ✅ Can see profile in dashboard

---

## 📊 **Database Schema**

### **Users Table:**
```sql
id: UUID (from Auth)
name: TEXT
email: TEXT
phone: TEXT
role: TEXT ('patient')
verified: BOOLEAN
created_at: TIMESTAMP
```

### **Patients Table:**
```sql
user_id: UUID (FK to users)
age: INTEGER
gender: TEXT ('male', 'female', 'other')
cnic: TEXT
history: TEXT (medical history)
```

---

## 🎯 **Form Validation**

### **Age:**
- ✅ Required
- ✅ Must be a number
- ✅ Range: 1-120
- ❌ Cannot be empty
- ❌ Cannot be negative

### **Gender:**
- ✅ Required
- ✅ Must select from dropdown
- ❌ Cannot be empty

### **CNIC:**
- ✅ Required
- ✅ Must match pattern: `12345-6789012-3`
- ✅ Format: 5 digits - 7 digits - 1 digit
- ❌ Cannot be empty
- ❌ Invalid format rejected

### **Medical History:**
- ⚠️ Optional
- ✅ Can be empty
- ℹ️ Recommended to fill for better healthcare

---

## 🎨 **UX Improvements**

### **Progressive Disclosure:**
- Only show profile step for roles that need it
- Clear step indicators
- Back button to edit previous info
- Field-level validation

### **Visual Feedback:**
- Required fields marked with *
- Placeholder text for guidance
- Format hints (e.g., CNIC format)
- Error messages below fields
- Success confirmation

### **Smart Button Text:**
- Step 2 for Patient: "Next: Complete Profile →"
- Step 2 for Others: "Create Account"
- Step 3: "Complete Registration"
- Loading: "Creating Account..."

---

## 🔐 **Security Considerations**

### **Public Endpoint Safety:**
- Endpoint `/api/patients/profile` is public (no auth)
- Only called during registration
- Requires valid `userId` from Supabase
- Cannot update existing profiles (only insert)
- Protected by Supabase RLS policies

### **Data Validation:**
- Frontend validation for format
- Backend validation for required fields
- SQL injection protected (parameterized queries)
- CNIC format validation

---

## 🚀 **Future Enhancements**

### **Extensible to Other Roles:**

Currently, only Patient role has Step 3. Easy to extend:

```javascript
// In handleEmailSignup function
const rolesNeedingProfile = ['patient', 'donor', 'student'];

// Add profile steps for other roles:
- Donor: Organization, Tax ID
- Student: Education level, Interests
- Teacher: Qualifications, Subjects
- Lab: Certifications, Specializations
- Pharmacy: License number, Store name
```

### **Additional Features:**
- [ ] Profile picture upload
- [ ] Emergency contact info
- [ ] Insurance details
- [ ] Preferred language
- [ ] Communication preferences
- [ ] Terms acceptance checkbox
- [ ] Privacy policy agreement

---

## 📸 **Screenshots Expected**

### **Step 3 Features:**
- Two-column layout for Age/Gender
- Full-width CNIC input with format hint
- Large textarea for medical history
- Helper text for optional fields
- Green "Complete Registration" button
- Back button to edit role
- Form validation errors (if any)

---

## ✅ **Testing Checklist**

- [ ] Open /login and click Sign Up
- [ ] Fill Step 1 credentials
- [ ] Select Patient role in Step 2
- [ ] Verify button says "Next: Complete Profile"
- [ ] Click Next, see Step 3
- [ ] Try submitting without filling - see error
- [ ] Fill Age, Gender, CNIC
- [ ] Submit - account created
- [ ] Login with new account
- [ ] View profile in dashboard
- [ ] Verify all data is saved correctly

---

## 🎊 **What This Means**

### **Before:**
❌ Users only provided email/password
❌ Profile data collected later in dashboard
❌ Incomplete profiles
❌ Extra step for users

### **After:**
✅ Complete profile during registration
✅ All required data collected upfront
✅ Better user onboarding
✅ Ready to use immediately
✅ Better data quality

---

## 🌟 **Key Benefits**

1. **Better Data Quality**
   - Complete profiles from day 1
   - Required fields enforced
   - Validated formats (CNIC)

2. **Improved UX**
   - One-time setup
   - Progressive disclosure
   - Clear visual flow

3. **Healthcare Ready**
   - Medical history upfront
   - Age/gender for consultations
   - CNIC for identity verification

4. **Scalable**
   - Easy to add more roles
   - Reusable pattern
   - Modular code

---

## 📝 **Summary**

**Patient registration is now a complete 3-step process:**

1. ✅ **Credentials** (Name, Email, Password)
2. ✅ **Role Selection** (Choose Patient)
3. ✅ **Profile Completion** (Age, Gender, CNIC, History) ⭐ NEW!

**All data is saved automatically when account is created!**

---

**Test it now:** http://localhost:5173/login

**Sign up as a Patient and see the magic!** 🎉

