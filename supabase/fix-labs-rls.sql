-- Fix labs RLS policies to work with backend service role
-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view active labs" ON public.labs;
DROP POLICY IF EXISTS "Admin can manage labs" ON public.labs;

-- Allow all operations for now (backend uses service role)
CREATE POLICY "Allow all operations on labs" ON public.labs
  FOR ALL USING (true) WITH CHECK (true);

-- Also fix lab_users
DROP POLICY IF EXISTS "Users can view their lab associations" ON public.lab_users;
DROP POLICY IF EXISTS "Admin can manage lab associations" ON public.lab_users;

CREATE POLICY "Allow all operations on lab_users" ON public.lab_users
  FOR ALL USING (true) WITH CHECK (true);

