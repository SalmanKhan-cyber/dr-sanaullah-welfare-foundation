# 🚀 Launch Site - Quick Guide

## ✅ Servers Started

I've started both servers for you:

### Backend Server (Port 4000)
- ✅ Starting in background
- Location: `apps/backend`
- URL: `http://localhost:4000`

### Frontend Server (Port 5173)
- ✅ Starting in background  
- Location: `apps/frontend`
- URL: `http://localhost:5173`

---

## 🌐 Access Your Site

**Open your browser and go to:**

### 👉 http://localhost:5173

The site should load in a few seconds!

---

## ⚠️ Important Notes

### Environment Variables Required

Make sure you have `.env` files configured:

**Backend (`apps/backend/.env`):**
```env
PORT=4000
NODE_ENV=development
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=http://localhost:5173
```

**Frontend (`apps/frontend/.env`):**
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_URL=http://localhost:4000
```

If you don't have `.env` files, copy from `.env.example`:
```bash
# Backend
cd apps/backend
copy env.example .env
# Then edit .env and add your values

# Frontend
cd apps/frontend
copy env.example .env
# Then edit .env and add your values
```

---

## 🔍 Check Server Status

### Backend Status
- Check terminal for: `Backend running on http://localhost:4000`
- If you see errors, check environment variables

### Frontend Status
- Check terminal for: `Local: http://localhost:5173/`
- If you see errors, check environment variables

---

## 🛑 Stop Servers

To stop the servers:
1. Find the terminal windows running the servers
2. Press `Ctrl + C` in each terminal
3. Or close the terminal windows

---

## 🐛 Troubleshooting

### Port Already in Use

If you see "port already in use" error:

**Kill process on port 4000 (Backend):**
```powershell
netstat -ano | findstr :4000
# Note the PID number, then:
taskkill /PID <PID> /F
```

**Kill process on port 5173 (Frontend):**
```powershell
netstat -ano | findstr :5173
# Note the PID number, then:
taskkill /PID <PID> /F
```

### Site Not Loading

1. **Check both servers are running:**
   - Backend: http://localhost:4000 (should show JSON response or error page)
   - Frontend: http://localhost:5173 (should show your site)

2. **Check browser console (F12)** for errors

3. **Check terminal outputs** for error messages

4. **Verify environment variables** are set correctly

---

## ✅ Success Indicators

You'll know everything is working when:

- ✅ Backend terminal shows: `Backend running on http://localhost:4000`
- ✅ Frontend terminal shows: `Local: http://localhost:5173/`
- ✅ Browser at `http://localhost:5173` shows your site
- ✅ No errors in browser console (F12)
- ✅ No errors in server terminals

---

**🎉 Enjoy your site!**

