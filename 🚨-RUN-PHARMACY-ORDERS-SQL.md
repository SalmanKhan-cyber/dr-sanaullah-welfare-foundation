# 🚨 IMPORTANT: Run This SQL to Enable Checkout Feature!

## Problem:
The checkout feature is not working because the database tables for orders don't exist yet.

## Solution:
Run the SQL script to create the `pharmacy_orders` and `pharmacy_order_items` tables.

---

## 📋 Steps to Fix:

### 1. Open Supabase SQL Editor
- Go to your Supabase Dashboard: https://supabase.com/dashboard
- Select your project
- Navigate to: **SQL Editor** → **New Query**

### 2. Copy and Run the SQL Script

Open the file: `supabase/create-pharmacy-orders-table.sql`

**OR** copy and paste this complete SQL script:

```sql
-- Create pharmacy_orders table for managing medicine orders
CREATE TABLE IF NOT EXISTS public.pharmacy_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  total_amount numeric(10,2) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'completed', 'cancelled')),
  shipping_address text,
  contact_phone text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create order_items table for individual items in an order
CREATE TABLE IF NOT EXISTS public.pharmacy_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.pharmacy_orders(id) ON DELETE CASCADE,
  medicine_id uuid REFERENCES public.pharmacy_inventory(medicine_id) ON DELETE SET NULL,
  medicine_name text NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric(10,2) NOT NULL,
  discount_percentage numeric(5,2) DEFAULT 0,
  total_price numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pharmacy_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacy_order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for orders
-- Users can view their own orders
CREATE POLICY "Users can view their own orders"
  ON public.pharmacy_orders FOR SELECT
  USING (user_id = auth.uid());

-- Users can create their own orders
CREATE POLICY "Users can create their own orders"
  ON public.pharmacy_orders FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Admins can view all orders
CREATE POLICY "Admins can view all orders"
  ON public.pharmacy_orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for order_items
-- Users can view items from their own orders
CREATE POLICY "Users can view their own order items"
  ON public.pharmacy_order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.pharmacy_orders
      WHERE id = order_id AND user_id = auth.uid()
    )
  );

-- Users can create items for their own orders
CREATE POLICY "Users can create items for their own orders"
  ON public.pharmacy_order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pharmacy_orders
      WHERE id = order_id AND user_id = auth.uid()
    )
  );

-- Admins can view all order items
CREATE POLICY "Admins can view all order items"
  ON public.pharmacy_order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pharmacy_orders_user_id ON public.pharmacy_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_orders_status ON public.pharmacy_orders(status);
CREATE INDEX IF NOT EXISTS idx_pharmacy_orders_created_at ON public.pharmacy_orders(created_at);
CREATE INDEX IF NOT EXISTS idx_pharmacy_order_items_order_id ON public.pharmacy_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_order_items_medicine_id ON public.pharmacy_order_items(medicine_id);
```

### 3. Click "Run" (or press Ctrl+Enter)

### 4. Verify Success
After running the SQL, you should see:
- ✅ "Success. No rows returned" or similar success message
- ✅ The query executed without errors

### 5. Test the Checkout Feature
- Go to the Pharmacy page
- Add items to cart
- Click "Proceed to Checkout"
- Fill in shipping address and contact phone
- Click "Place Order"
- You should see a success message with the order ID!

---

## ✅ What This Enables:

1. **Order Creation**: Users can place orders for medicines
2. **Stock Management**: Stock quantities are automatically updated when orders are placed
3. **Order History**: Users can view their order history (via `/api/pharmacy/orders/me`)
4. **Admin View**: Admins can view all orders (via `/api/pharmacy/orders/all`)
5. **Order Status**: Orders have status tracking (pending, confirmed, processing, completed, cancelled)

---

## 🔍 Verify It Worked:

Run this query in Supabase SQL Editor to verify:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('pharmacy_orders', 'pharmacy_order_items');
```

Expected result: Both tables should be listed.

---

## ⚠️ If It Still Doesn't Work:

1. **Check Browser Console** (F12):
   - Look for any error messages
   - Check Network tab to see if API requests are failing

2. **Check Backend Logs**:
   - Look at your backend terminal
   - Check for any error messages about the tables

3. **Verify Authentication**:
   - Make sure you're logged in before trying to checkout
   - The checkout requires authentication

4. **Restart Backend**:
   - Stop the backend server (Ctrl+C)
   - Start it again: `cd apps/backend && npm run dev`

---

## 📝 Note:

- Users must be logged in to place orders
- Stock quantities are automatically deducted when orders are placed
- Orders are linked to the user who placed them
- Admins can view all orders in the admin panel (you may need to add this view)

