# 🚨 Port 4000 Already in Use - Quick Fix

## Problem
The backend can't start because port 4000 is already being used by another process.

**Error:** `EADDRINUSE: address already in use :::4000`

---

## ✅ Solution: Kill the Process Using Port 4000

### Step 1: Find What's Using Port 4000

Run this command in PowerShell:

```powershell
netstat -ano | findstr :4000
```

This will show you something like:
```
TCP    0.0.0.0:4000           0.0.0.0:0              LISTENING       12345
```

The **last number** (like `12345`) is the Process ID (PID).

### Step 2: Kill the Process

Copy the PID number and run:

```powershell
taskkill /PID 12345 /F
```

(Replace `12345` with your actual PID number)

The `/F` flag forces the process to close.

### Step 3: Start Backend Again

After killing the process, try starting the backend again:

```powershell
cd C:\Users\faaaaaast\Desktop\foundation\apps\backend
npm run dev
```

---

## 🎯 Quick One-Line Solution

Or, if you want to do it all at once:

```powershell
$pid = (Get-NetTCPConnection -LocalPort 4000 -ErrorAction SilentlyContinue).OwningProcess; if ($pid) { taskkill /PID $pid /F; Write-Host "✅ Killed process using port 4000" } else { Write-Host "⚠️ No process found on port 4000" }
```

---

## ✅ After Killing the Process

1. **Run the kill command** (see above)
2. **Wait 2 seconds**
3. **Start backend again:**
   ```powershell
   cd C:\Users\faaaaaast\Desktop\foundation\apps\backend
   npm run dev
   ```
4. **You should see:** `Backend running on http://localhost:4000` ✅

---

## 🐛 Still Not Working?

If port 4000 is still in use:

1. **Check if you have another terminal running the backend**
   - Look for other PowerShell/CMD windows
   - Close any that show `npm run dev` or `nodemon`

2. **Check Task Manager:**
   - Press `Ctrl + Shift + Esc`
   - Look for `node.exe` processes
   - End any that might be using port 4000

3. **Restart your computer** (last resort)

---

## 📝 What Caused This?

Port 4000 is already in use because:
- Another instance of the backend is running
- A previous backend didn't shut down properly
- Another application is using port 4000

**Once you kill the process, you can start the backend normally!** 🚀

