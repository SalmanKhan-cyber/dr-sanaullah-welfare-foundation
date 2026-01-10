-- Check if policies already exist and drop them if they do
DROP POLICY IF EXISTS "Allow all operations on labs" ON public.labs;
DROP POLICY IF EXISTS "Allow all operations on lab_users" ON public.lab_users;

-- Now create them fresh
CREATE POLICY "Allow all operations on labs" ON public.labs
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on lab_users" ON public.lab_users
  FOR ALL USING (true) WITH CHECK (true);

-- Verify labs table has data
SELECT * FROM public.labs;

