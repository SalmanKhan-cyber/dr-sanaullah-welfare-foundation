-- Disable RLS on labs tables since backend uses service role
ALTER TABLE public.labs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_users DISABLE ROW LEVEL SECURITY;

-- Verify tables exist and have data
SELECT * FROM public.labs LIMIT 5;

