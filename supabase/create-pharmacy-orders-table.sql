-- Create pharmacy_orders table for managing medicine orders
-- Execute in Supabase SQL editor

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

-- Drop existing policies if they exist (to allow re-running this script)
-- Only drop policies if tables exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pharmacy_orders') THEN
        DROP POLICY IF EXISTS "Users can view their own orders" ON public.pharmacy_orders;
        DROP POLICY IF EXISTS "Users can create their own orders" ON public.pharmacy_orders;
        DROP POLICY IF EXISTS "Admins can view all orders" ON public.pharmacy_orders;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pharmacy_order_items') THEN
        DROP POLICY IF EXISTS "Users can view their own order items" ON public.pharmacy_order_items;
        DROP POLICY IF EXISTS "Users can create items for their own orders" ON public.pharmacy_order_items;
        DROP POLICY IF EXISTS "Admins can view all order items" ON public.pharmacy_order_items;
    END IF;
END $$;

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

