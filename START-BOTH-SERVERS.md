# 🚀 Start Both Servers - Simple Instructions

## Problem
Your console shows `ERR_CONNECTION_REFUSED` because the **backend server is not running**.

---

## ✅ Quick Solution

I've created 2 batch files for you. Here's what to do:

### Step 1: Start Backend Server

1. **Double-click** `start-backend.bat` in your project folder
2. **Wait for:** `Backend running on http://localhost:4000`
3. **Keep this window open!** Don't close it.

### Step 2: Start Frontend Server (if not already running)

1. **Double-click** `start-frontend.bat` in your project folder
2. **Wait for:** `Local: http://localhost:5173/`
3. **Keep this window open too!**

---

## 🎯 Alternative: Manual Start

If the batch files don't work, use these commands:

### Backend (Open NEW Terminal):
```powershell
cd C:\Users\faaaaaast\Desktop\foundation\apps\backend
npm run dev
```

### Frontend (Open ANOTHER NEW Terminal):
```powershell
cd C:\Users\faaaaaast\Desktop\foundation\apps\frontend
npm run dev
```

---

## ✅ Verify Everything is Working

After starting both servers:

1. **Backend Terminal** should show:
   ```
   Backend running on http://localhost:4000
   ```

2. **Frontend Terminal** should show:
   ```
   Local: http://localhost:5173/
   ```

3. **Refresh your browser** (F5) at `http://localhost:5173`

4. **Console errors should disappear!** ✅

5. **Try checkout again** - it should work now! ✅

---

## ⚠️ Important Notes

- **Keep BOTH terminal windows open** while using the site
- **Backend MUST be running** for checkout to work
- **Both servers must run at the same time**

---

## 🐛 If You See Errors

### Backend Errors:
- Check if `.env` file exists in `apps/backend/`
- Check if Supabase credentials are correct in `.env`
- Look at the error message in the backend terminal

### Frontend Errors:
- Check browser console (F12)
- Check if frontend `.env` file exists in `apps/frontend/`
- Make sure backend is running first

---

## 📋 Checklist

- [ ] Backend server running (`localhost:4000`)
- [ ] Frontend server running (`localhost:5173`)
- [ ] Both terminals showing success messages
- [ ] Browser refreshed
- [ ] No console errors (F12)
- [ ] Checkout feature works

---

**Once both servers are running, your checkout feature will work! 🎉**

