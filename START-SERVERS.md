# How to Start the Application Servers

## Quick Start Guide

You need to run **both** the frontend and backend servers for the application to work properly.

---

## 1. Start Backend Server (Port 4000)

Open a **new terminal window** and run:

```bash
cd apps/backend
npm run dev
```

**Expected output:**
```
Backend running on http://localhost:4000
```

**Keep this terminal open!** The backend must stay running.

---

## 2. Start Frontend Server (Port 5173)

Open **another new terminal window** and run:

```bash
cd apps/frontend
npm run dev
```

**Expected output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**Keep this terminal open too!** The frontend must stay running.

---

## 3. Open the Application

Once both servers are running, open your browser and go to:

**http://localhost:5173**

---

## Troubleshooting

### Port Already in Use

If you see an error like "port already in use":

**For Backend (port 4000):**
```bash
# Windows PowerShell
netstat -ano | findstr :4000
# Then kill the process using the PID
taskkill /PID <PID> /F
```

**For Frontend (port 5173):**
```bash
# Windows PowerShell
netstat -ano | findstr :5173
# Then kill the process using the PID
taskkill /PID <PID> /F
```

### Missing Dependencies

If you see errors about missing modules:

**Backend:**
```bash
cd apps/backend
npm install
```

**Frontend:**
```bash
cd apps/frontend
npm install
```

### Backend Not Connecting

- Check if backend is running on `http://localhost:4000`
- Check backend console for errors
- Verify environment variables in `apps/backend/.env`

### Frontend Not Loading

- Check if frontend is running on `http://localhost:5173`
- Check frontend console for errors
- Verify environment variables in `apps/frontend/.env`
- Check browser console (F12) for errors

---

## Important Notes

1. **Both servers must be running simultaneously**
2. **Keep both terminal windows open** while developing
3. **Backend must be running before frontend** can make API calls
4. **Database tables must exist** - Run SQL scripts in Supabase if needed

---

## Stopping Servers

To stop the servers:
- Press `Ctrl + C` in each terminal window
- Or close the terminal windows

---

## Quick Checklist

Before testing the checkout feature:

- [ ] Backend server is running (port 4000)
- [ ] Frontend server is running (port 5173)
- [ ] SQL script for pharmacy orders has been run (`supabase/create-pharmacy-orders-table.sql`)
- [ ] User is logged in
- [ ] Browser console shows no errors (F12)
