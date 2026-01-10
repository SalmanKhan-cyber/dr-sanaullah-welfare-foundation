# ⚡ Quick Admin Setup Guide

**Login is failing because the admin account doesn't exist yet. Create it in 2 minutes!**

---

## 🚀 **Option 1: Create Admin via Sign Up (Easiest)**

### **Step 1: Sign Up**
1. Go to: http://localhost:5173/login
2. Click the "Sign Up" tab at the top
3. Fill in:
   - **Name**: `Admin`
   - **Email**: `admin@dswf.org`
   - **Password**: `Admin123!`
4. Click "Next"

### **Step 2: Select Admin Role**
1. Click on the **Admin** card (🧑‍💼)
2. Click "Create Account"

### **Step 3: That's It!**
✅ Your admin account is created and you'll be redirected to the Admin Dashboard!

**Note:** The signup system automatically sets the role in both Supabase Auth and the database.

---

## 🚀 **Option 2: Create Admin via Supabase Dashboard**

If you prefer to create users manually in Supabase:

### **Step 1: Open Supabase**
1. Go to: https://supabase.com/dashboard
2. Select your project
3. Click "Authentication" in the sidebar
4. Click "Users"

### **Step 2: Add User**
1. Click "Add user" or "Invite user"
2. Enter:
   - **Email**: `admin@dswf.org`
   - **Password**: `Admin123!`
   - **Auto Confirm**: ✅ (check this box)
3. Click "Create user"

### **Step 3: Set Admin Role**
1. Click on the newly created user (`admin@dswf.org`)
2. Scroll to **"User Metadata"** section
3. Click **Edit** (pencil icon)
4. Replace `{}` with:
   ```json
   {
     "role": "admin",
     "name": "Admin"
   }
   ```
5. Click "Save"

### **Step 4: Update Public Users Table**
1. Go to "SQL Editor" in Supabase
2. Run this SQL:
   ```sql
   INSERT INTO public.users (id, email, name, role, verified)
   SELECT id, email, raw_user_meta_data->>'name' as name, raw_user_meta_data->>'role' as role, email_confirmed_at IS NOT NULL as verified
   FROM auth.users
   WHERE email = 'admin@dswf.org'
   ON CONFLICT (id) DO UPDATE
   SET email = EXCLUDED.email, name = EXCLUDED.name, role = EXCLUDED.role, verified = EXCLUDED.verified;
   ```
3. Click "Run"

### **Step 5: Login**
1. Go to: http://localhost:5173/login
2. Enter:
   - **Email**: `admin@dswf.org`
   - **Password**: `Admin123!`
3. Click "Sign In"
4. ✅ You'll be redirected to Admin Dashboard!

---

## 🎯 **Quick Test**

After creating the admin account, you should be able to:

1. **Login** at http://localhost:5173/login
2. **Access** Admin Dashboard at http://localhost:5173/dashboard/admin
3. **See** Global Search feature
4. **Manage** users, doctors, donations, pharmacy, etc.

---

## 💡 **Why This Happens**

Demo accounts are not pre-created in Supabase Auth by default because:
- Each Supabase project is unique
- We can't automatically create accounts in your project
- You need to create them once to get started

Once created, they work permanently!

---

## ✅ **Recommendation**

**Use Option 1 (Sign Up)** - it's faster and automatically handles:
- Creating the account
- Setting the role
- Syncing to database
- Redirecting to dashboard

**Takes 30 seconds!** ⚡

---

**Need help?** Check the Console tab in your browser for any error messages!

