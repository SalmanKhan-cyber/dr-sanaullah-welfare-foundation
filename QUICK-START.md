# 🚀 Quick Start Guide

## Start Both Servers

You need **TWO terminal windows** - one for backend, one for frontend.

### Terminal 1: Backend Server
```bash
cd apps/backend
npm run dev
```
**Wait for**: "Server running on port 4000" or similar message

### Terminal 2: Frontend Server
```bash
cd apps/frontend
npm run dev
```
**Wait for**: "Local: http://localhost:5173" or similar message

### Then Open Browser
- Go to: `http://localhost:5173`
- Or it should open automatically

## Verify Servers Are Running

### Check Backend:
Open: `http://localhost:4000/health`
Should return: `{"ok":true}`

### Check Frontend:
Open: `http://localhost:5173`
Should show the website

## Troubleshooting

### If you see `ERR_CONNECTION_REFUSED`:
1. **Backend not running** - Start it in Terminal 1
2. **Wrong port** - Check if port 4000 is available
3. **Environment variables missing** - Check `apps/backend/.env` exists

### If data doesn't show:
1. **Check browser console** (F12) for errors
2. **Check backend terminal** for errors
3. **Verify you're logged in** as admin
4. **Check database** - Data might not exist yet

## Important Notes

- **Keep both terminals open** - Closing them stops the servers
- **Backend must run first** - Frontend needs backend to work
- **Check .env files** - Both frontend and backend need proper configuration

