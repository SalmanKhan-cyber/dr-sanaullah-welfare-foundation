# 🚀 Start Backend Server - Quick Guide

## Problem: ERR_CONNECTION_REFUSED

The console shows `ERR_CONNECTION_REFUSED` on `localhost:4000`, which means **the backend server is not running**.

## Solution: Start the Backend Server

### Option 1: Using Terminal (Recommended)

1. **Open a new terminal window**
2. **Navigate to backend directory**:
   ```bash
   cd apps/backend
   ```

3. **Start the server**:
   ```bash
   npm run dev
   ```
   Or:
   ```bash
   node src/index.js
   ```

4. **You should see**:
   ```
   Server running on port 4000
   ```
   Or similar message indicating the server started successfully.

### Option 2: Check if Server is Already Running

1. **Check if port 4000 is in use**:
   - Windows: `netstat -ano | findstr :4000`
   - Mac/Linux: `lsof -i :4000`

2. **If something is running on port 4000**, either:
   - Stop it and restart
   - Or change the port in `apps/backend/src/index.js`

### Option 3: Verify Environment Variables

Make sure `apps/backend/.env` exists and has:
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PORT=4000
CORS_ORIGIN=http://localhost:5173
```

## After Starting Backend

1. **Refresh your browser** (the admin dashboard)
2. **Check the console** - errors should be gone
3. **Data should now load** - you should see your 2 courses, patients, doctors, etc.

## Verify Backend is Running

1. **Open in browser**: `http://localhost:4000/health`
2. **Should return**: `{"ok":true}`

If you see this, the backend is running correctly!

## Common Issues

### Issue: "Port 4000 already in use"
**Solution**: 
- Find and stop the process using port 4000
- Or change PORT in `.env` file

### Issue: "Cannot find module"
**Solution**: 
- Run `npm install` in `apps/backend` directory

### Issue: "Environment variables not found"
**Solution**: 
- Make sure `.env` file exists in `apps/backend/`
- Check that it has all required variables

