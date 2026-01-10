# Checkout Feature Troubleshooting Guide

## Current Issue: "Failed to fetch" Error

The checkout feature is showing "Failed to place order: Failed to fetch". This error typically means one of the following:

### 1. ✅ Database Tables Not Created (MOST LIKELY)

**Solution:** Run the SQL script to create the required tables:

1. Open Supabase Dashboard → SQL Editor
2. Copy and paste the entire contents of `supabase/create-pharmacy-orders-table.sql`
3. Click "Run"
4. You should see "Success" message

The script creates:
- `pharmacy_orders` table
- `pharmacy_order_items` table
- RLS policies
- Indexes for performance

### 2. Backend Server Not Running

**Check if backend is running:**
- Open a terminal/command prompt
- Navigate to `apps/backend` folder
- Run: `npm run dev` (or `npm start`)
- You should see: `Backend running on http://localhost:4000`

**If not running:**
```bash
cd apps/backend
npm run dev
```

### 3. Backend Crashed

**Check backend console for errors:**
- Look for any error messages in the backend terminal
- Common errors:
  - Database connection issues
  - Missing environment variables
  - Table not found errors

### 4. Network/CORS Issues

**Verify:**
- Backend is running on `http://localhost:4000`
- Frontend is running on `http://localhost:5173`
- Check browser console (F12) for CORS errors

### 5. Authentication Issues

**Ensure:**
- User is logged in
- Auth token is valid
- Check browser console for 401/403 errors

---

## Quick Fix Checklist

- [ ] Run SQL script: `supabase/create-pharmacy-orders-table.sql`
- [ ] Backend server is running on port 4000
- [ ] Frontend server is running on port 5173
- [ ] User is logged in
- [ ] Check backend console for errors
- [ ] Check browser console (F12) for errors

---

## Testing the Fix

1. Make sure backend is running
2. Make sure SQL script has been run
3. Refresh the pharmacy page
4. Add items to cart
5. Click "Proceed to Checkout"
6. Fill in shipping details
7. Click "Place Order"

If it still fails, check:
- Browser console (F12 → Console tab)
- Backend console for error messages
- Network tab in browser DevTools to see the actual request/response

