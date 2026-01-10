# ⚡ Fix Email Confirmation Issue

**Problem:** "Email not confirmed" error when trying to login.

**Solution:** Disable email verification in development OR manually confirm your email.

---

## 🚀 **Quick Fix: Disable Email Verification (For Development)**

### **Step 1: Open Supabase Dashboard**
1. Go to: https://supabase.com/dashboard
2. Select your project

### **Step 2: Navigate to Authentication Settings**
1. Click **"Authentication"** in the left sidebar
2. Click **"Providers"** in the submenu
3. Scroll down to **"Email"** section

### **Step 3: Disable Email Confirmation**
1. Find **"Confirm email"** toggle
2. **Turn it OFF** (slide to left)
3. Click **"Save"**

### **Step 4: Test Login**
1. Go to: http://localhost:5173/login
2. Enter: `admin@dswf.org` / `Admin123!`
3. Click **"Sign In"**
4. ✅ Should work now!

---

## 🎯 **Alternative: Manually Confirm Email**

If you want to keep email verification enabled:

### **Step 1: Open Supabase Dashboard**
1. Go to: https://supabase.com/dashboard
2. Select your project

### **Step 2: Find Your User**
1. Click **"Authentication"** → **"Users"**
2. Find `admin@dswf.org` in the list
3. Click on the user

### **Step 3: Confirm Email**
1. Look for **"Email Confirmed"** section
2. Click **"Confirm Email"** or **"Send Confirmation Email"**
3. Or simply set `email_confirmed_at` to current timestamp

### **Step 4: Test Login**
1. Go back to: http://localhost:5173/login
2. Enter credentials
3. Click **"Sign In"**
4. ✅ Should work now!

---

## ✅ **Recommended for Development**

**Use the first method (disable email confirmation)** - it's faster and better for testing.

**For Production:**
- Keep email verification ON
- Users will receive confirmation emails
- More secure setup

---

## 🎉 **After Fixing**

Once email is confirmed (or verification is disabled), you can:
- ✅ Login to admin dashboard
- ✅ Access all CRUD features
- ✅ Manage the entire system

**Try logging in now!** 🚀

