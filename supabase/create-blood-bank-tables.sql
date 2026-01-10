-- Create blood bank related tables
-- Run this in Supabase SQL Editor

-- Create blood_banks table
CREATE TABLE IF NOT EXISTS public.blood_banks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name text,
    location text,
    contact_info text,
    created_at timestamptz DEFAULT now(),
    UNIQUE(user_id)
);

-- Create blood_inventory table
CREATE TABLE IF NOT EXISTS public.blood_inventory (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    blood_bank_id uuid NOT NULL REFERENCES public.blood_banks(id) ON DELETE CASCADE,
    blood_type text NOT NULL CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    quantity integer NOT NULL CHECK (quantity >= 0),
    expiry_date date,
    status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'low_stock', 'out_of_stock')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(blood_bank_id, blood_type)
);

-- Create blood_requests table
CREATE TABLE IF NOT EXISTS public.blood_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    blood_bank_id uuid NOT NULL REFERENCES public.blood_banks(id) ON DELETE CASCADE,
    patient_id uuid, -- References patients.user_id, but no FK constraint to avoid issues (handled in app logic)
    blood_type text NOT NULL CHECK (blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    quantity integer NOT NULL CHECK (quantity > 0),
    urgency text NOT NULL DEFAULT 'normal' CHECK (urgency IN ('normal', 'urgent', 'critical')),
    notes text,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'fulfilled', 'rejected')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_blood_banks_user_id ON public.blood_banks(user_id);
CREATE INDEX IF NOT EXISTS idx_blood_inventory_blood_bank_id ON public.blood_inventory(blood_bank_id);
CREATE INDEX IF NOT EXISTS idx_blood_inventory_blood_type ON public.blood_inventory(blood_type);
CREATE INDEX IF NOT EXISTS idx_blood_inventory_status ON public.blood_inventory(status);
CREATE INDEX IF NOT EXISTS idx_blood_requests_blood_bank_id ON public.blood_requests(blood_bank_id);
CREATE INDEX IF NOT EXISTS idx_blood_requests_patient_id ON public.blood_requests(patient_id);
CREATE INDEX IF NOT EXISTS idx_blood_requests_status ON public.blood_requests(status);
CREATE INDEX IF NOT EXISTS idx_blood_requests_created_at ON public.blood_requests(created_at DESC);

-- Enable Row Level Security (RLS) - adjust policies as needed
ALTER TABLE public.blood_banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for blood_banks (admin can manage all, users can view their own)
CREATE POLICY "Admins can manage all blood banks" ON public.blood_banks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid() AND users.role = 'admin'
        )
    );

CREATE POLICY "Users can view their own blood bank" ON public.blood_banks
    FOR SELECT USING (user_id = auth.uid());

-- Create policies for blood_inventory (admin can manage all, public can view available)
CREATE POLICY "Admins can manage all inventory" ON public.blood_inventory
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid() AND users.role = 'admin'
        )
    );

CREATE POLICY "Blood bank users can manage their inventory" ON public.blood_inventory
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.blood_banks
            WHERE blood_banks.id = blood_inventory.blood_bank_id
            AND blood_banks.user_id = auth.uid()
        )
    );

CREATE POLICY "Public can view available inventory" ON public.blood_inventory
    FOR SELECT USING (status = 'available');

-- Create policies for blood_requests
CREATE POLICY "Admins can manage all requests" ON public.blood_requests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid() AND users.role = 'admin'
        )
    );

CREATE POLICY "Blood bank users can view their requests" ON public.blood_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.blood_banks
            WHERE blood_banks.id = blood_requests.blood_bank_id
            AND blood_banks.user_id = auth.uid()
        )
    );

CREATE POLICY "Patients can create requests" ON public.blood_requests
    FOR INSERT WITH CHECK (
        -- Allow authenticated users to create requests
        -- patient_id will be set by the backend based on user's patient profile
        auth.uid() IS NOT NULL
    );

CREATE POLICY "Patients can view their own requests" ON public.blood_requests
    FOR SELECT USING (
        -- Allow if patient_id matches the authenticated user's ID
        -- patient_id stores the user_id from the patients table
        patient_id = auth.uid()
    );

