# Quick Start Guide

Your Supabase credentials are already configured! Follow these steps to get started.

---

## ⚡ Quick Setup (3 Steps)

### Step 1: Run Environment Setup

**On Windows:**
```bash
setup-env.bat
```

**On Mac/Linux:**
```bash
chmod +x setup-env.sh
./setup-env.sh
```

This creates `.env` files with your Supabase credentials.

---

### Step 2: Install Dependencies

```bash
# Backend
cd apps/backend
npm install

# Frontend (open new terminal)
cd apps/frontend
npm install
```

---

### Step 3: Run the Application

**Terminal 1 - Backend:**
```bash
cd apps/backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd apps/frontend
npm run dev
```

---

## 🌐 Access the App

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:4000
- **Supabase Dashboard**: https://supabase.com/dashboard/project/qudebdejubackprbarvc

---

## 🔑 Your Supabase Credentials

Already configured in the setup scripts:

- **URL**: `https://qudebdejubackprbarvc.supabase.co`
- **Anon Key**: `eyJhbGc...Q1Y` (public, safe for frontend)
- **Service Role Key**: `eyJhbGc...4do` (secret, backend only)

---

## ✅ Verify Setup

1. Open http://localhost:5173
2. Click **"Login"**
3. Try signing up with email or phone
4. Check Supabase dashboard for new user

---

## 🎯 Next Steps

1. **Create Admin User** (see below)
2. **Test Features** (donations, lab reports, etc.)
3. **Deploy to Production** (see `DEPLOYMENT.md`)

---

## 👤 Create First Admin User

### Method 1: Via Supabase Dashboard

1. Go to https://supabase.com/dashboard/project/qudebdejubackprbarvc
2. Click **Authentication** → **Users**
3. Click on a user
4. Scroll to **User Metadata**
5. Click **Edit** and add:
   ```json
   {
     "role": "admin"
   }
   ```
6. Save

### Method 2: Via API (After Signup)

```bash
# Get the user ID from Supabase dashboard
# Then run:
curl -X POST http://localhost:4000/api/auth/set-role \
  -H "Content-Type: application/json" \
  -d '{"userId": "YOUR-USER-ID-HERE", "role": "admin"}'
```

---

## 📊 Test Features

Once logged in, test these features:

### As Donor
1. Go to http://localhost:5173/donation
2. Make a test donation
3. View receipt

### As Admin
1. Go to http://localhost:5173/dashboard/admin
2. View all users
3. Approve registrations

### As Patient
1. Go to http://localhost:5173/dashboard/patient
2. View lab reports
3. Check notifications

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if .env file exists
ls apps/backend/.env

# If missing, run setup script again
```

### Frontend shows connection error
```bash
# Make sure backend is running first
# Check VITE_API_URL in apps/frontend/.env
```

### "Missing token" error
- Make sure you're logged in via Supabase Auth
- Check browser console for errors

---

## 📚 Full Documentation

- `SETUP.md` - Complete setup guide
- `DEPLOYMENT.md` - Deploy to Vercel + Render
- `FEATURES.md` - Feature list and API docs
- `README.md` - Project overview

---

**You're all set!** 🚀

Visit http://localhost:5173 to start using the platform.

