# 🚨 Quick Setup: In-App Card Purchasing

## Step 1: Run SQL Script

1. Open **Supabase SQL Editor**
2. Copy and paste the contents of: **`supabase/create-payment-methods-table.sql`**
3. Click **Run**
4. ✅ Done!

---

## Step 2: Restart Backend

Restart your backend server to load the new payment endpoints:

```bash
# Stop the backend (Ctrl+C)
# Then restart:
cd apps/backend
npm run dev
```

---

## Step 3: Test It!

1. Go to **Pharmacy page**
2. Add medicines to cart
3. Click **"Checkout"** button
4. Fill in:
   - Shipping address
   - Contact phone
   - **Card details** (or select saved card)
5. Click **"Pay PKR XXX"**
6. Payment processes → Order confirmed! 🎉

---

## ✅ What You Can Do Now

- ✅ Enter card details during checkout
- ✅ Save cards for future use (checkbox option)
- ✅ Use saved cards for quick checkout
- ✅ See payment status in orders

---

**That's it! The feature is ready to use!** 🎉

