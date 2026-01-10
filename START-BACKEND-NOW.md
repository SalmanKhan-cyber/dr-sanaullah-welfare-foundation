# 🚨 Backend Server Not Running - Quick Fix

## Problem
The console shows `ERR_CONNECTION_REFUSED` errors because the **backend server is not running** on port 4000.

---

## ✅ Solution: Start the Backend Server

### Option 1: Using Terminal (Recommended)

1. **Open a NEW terminal/command prompt**
2. **Navigate to backend folder:**
   ```powershell
   cd C:\Users\faaaaaast\Desktop\foundation\apps\backend
   ```
3. **Start the server:**
   ```powershell
   npm run dev
   ```
4. **Wait for this message:**
   ```
   Backend running on http://localhost:4000
   ```
5. **Keep this terminal open!** Don't close it.

---

### Option 2: Using VSCode Terminal

1. **Open VSCode Terminal** (Ctrl + ` or Terminal → New Terminal)
2. **Navigate to backend:**
   ```powershell
   cd apps/backend
   ```
3. **Start the server:**
   ```powershell
   npm run dev
   ```
4. **Keep the terminal open!**

---

## ⚠️ Common Issues

### Missing .env File

If you see errors about environment variables:

1. **Check if `.env` file exists:**
   ```powershell
   cd apps/backend
   dir .env
   ```

2. **If missing, create it from example:**
   ```powershell
   copy env.example .env
   ```

3. **Edit `.env` file** and add your Supabase credentials:
   ```env
   PORT=4000
   NODE_ENV=development
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   JWT_SECRET=your_jwt_secret
   CORS_ORIGIN=http://localhost:5173
   ```

### Port Already in Use

If you see "port 4000 already in use":

1. **Find the process:**
   ```powershell
   netstat -ano | findstr :4000
   ```

2. **Kill the process** (replace `<PID>` with the number from step 1):
   ```powershell
   taskkill /PID <PID> /F
   ```

3. **Try starting again:**
   ```powershell
   npm run dev
   ```

### Missing Dependencies

If you see module errors:

1. **Install dependencies:**
   ```powershell
   cd apps/backend
   npm install
   ```

2. **Then start:**
   ```powershell
   npm run dev
   ```

---

## ✅ Verify Backend is Running

Once started, you should see:
- ✅ Terminal shows: `Backend running on http://localhost:4000`
- ✅ No error messages in terminal
- ✅ Frontend console errors should disappear
- ✅ Checkout should work

---

## 🎯 After Backend Starts

1. **Refresh your browser** (F5)
2. **Try checkout again** - it should work now!
3. **If still errors**, check:
   - Backend terminal for error messages
   - Browser console (F12) for new errors
   - Make sure you ran the SQL script for pharmacy orders

---

## 📝 Remember

- **Keep the backend terminal open** while developing
- **Both servers must run simultaneously:**
  - Backend: `localhost:4000`
  - Frontend: `localhost:5173`

