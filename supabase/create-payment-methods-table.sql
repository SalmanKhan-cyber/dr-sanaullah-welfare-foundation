-- Create payment_methods table for storing saved cards
-- Execute in Supabase SQL editor

CREATE TABLE IF NOT EXISTS public.payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  card_number_last4 text NOT NULL,
  card_brand text, -- 'visa', 'mastercard', 'amex', etc.
  expiry_month integer NOT NULL CHECK (expiry_month >= 1 AND expiry_month <= 12),
  expiry_year integer NOT NULL CHECK (expiry_year >= 2024),
  cardholder_name text,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add payment columns to pharmacy_orders table
ALTER TABLE public.pharmacy_orders 
ADD COLUMN IF NOT EXISTS payment_method_id uuid REFERENCES public.payment_methods(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'paid', 'failed', 'refunded')),
ADD COLUMN IF NOT EXISTS payment_transaction_id text,
ADD COLUMN IF NOT EXISTS paid_at timestamptz;

-- Enable RLS
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'payment_methods') THEN
        DROP POLICY IF EXISTS "Users can view their own payment methods" ON public.payment_methods;
        DROP POLICY IF EXISTS "Users can create their own payment methods" ON public.payment_methods;
        DROP POLICY IF EXISTS "Users can update their own payment methods" ON public.payment_methods;
        DROP POLICY IF EXISTS "Users can delete their own payment methods" ON public.payment_methods;
    END IF;
END $$;

-- RLS Policies for payment_methods
-- Users can view their own payment methods
CREATE POLICY "Users can view their own payment methods"
  ON public.payment_methods FOR SELECT
  USING (user_id = auth.uid());

-- Users can create their own payment methods
CREATE POLICY "Users can create their own payment methods"
  ON public.payment_methods FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own payment methods
CREATE POLICY "Users can update their own payment methods"
  ON public.payment_methods FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own payment methods
CREATE POLICY "Users can delete their own payment methods"
  ON public.payment_methods FOR DELETE
  USING (user_id = auth.uid());

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON public.payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_is_default ON public.payment_methods(user_id, is_default) WHERE is_default = true;
CREATE INDEX IF NOT EXISTS idx_pharmacy_orders_payment_status ON public.pharmacy_orders(payment_status);

