-- Remove RLS policies that depend on authentication
DROP POLICY IF EXISTS "Admin full access to monthly_sales" ON public.monthly_sales;
DROP POLICY IF EXISTS "Public read access to monthly_sales" ON public.monthly_sales;
DROP POLICY IF EXISTS "Admin full access to branches" ON public.branches;
DROP POLICY IF EXISTS "Public read access to branches" ON public.branches;

-- Disable RLS and enable public access
ALTER TABLE public.monthly_sales DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches DISABLE ROW LEVEL SECURITY;

-- Drop user_roles table
DROP TABLE IF EXISTS public.user_roles CASCADE;

-- Create simple public access policies
ALTER TABLE public.monthly_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access to monthly_sales"
ON public.monthly_sales
FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow public access to branches"
ON public.branches
FOR ALL
USING (true)
WITH CHECK (true);