# 🚨 URGENT: Backend Server Not Running!

## Problem
You're seeing **"Failed to place order: Failed to fetch"** because the backend server is **NOT running** on port 4000.

---

## ✅ IMMEDIATE SOLUTION

### Step 1: Open a New Terminal/Command Prompt

**Press:** `Windows Key + R`, type `cmd` or `powershell`, press Enter

OR

**In VS Code:** Press `Ctrl + ~` (tilde key) to open terminal

---

### Step 2: Navigate to Backend Folder

Copy and paste this command:

```powershell
cd C:\Users\faaaaaast\Desktop\foundation\apps\backend
```

Press Enter.

---

### Step 3: Start the Backend Server

Copy and paste this command:

```powershell
npm run dev
```

Press Enter.

---

### Step 4: Look for This Message

You should see:
```
Backend running on http://localhost:4000
```

If you see this, the backend is running! ✅

---

### Step 5: Keep Terminal Open

**DO NOT CLOSE THE TERMINAL!** The backend must keep running.

---

## ❌ If You See Errors

### Error: "Missing environment variables"
- Your `.env` file might be missing or incomplete
- Check if `apps/backend/.env` exists
- Make sure it has all required values (see below)

### Error: "Cannot find module"
- Run: `npm install` first, then `npm run dev`

### Error: "Port 4000 already in use"
- Another process is using port 4000
- Find and kill it (see troubleshooting below)

---

## 🔧 Required Environment Variables

Your `apps/backend/.env` file should have:

```env
PORT=4000
NODE_ENV=development

# Supabase - REQUIRED
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT Secret - REQUIRED
JWT_SECRET=your_jwt_secret_key

# CORS - REQUIRED
CORS_ORIGIN=http://localhost:5173
```

**Get these values from:**
- Supabase Dashboard → Project Settings → API

---

## ✅ Once Backend Starts

1. **Refresh your browser** (F5)
2. **Try checkout again**
3. **It should work now!** 🎉

---

## 🆘 Still Having Issues?

1. **Copy the error message** from the terminal
2. **Share it with me** and I'll help fix it

---

**START THE BACKEND NOW AND KEEP THE TERMINAL OPEN!** 🚀

