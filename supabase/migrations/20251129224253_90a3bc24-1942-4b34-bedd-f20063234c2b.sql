-- Drop existing restrictive policy for user_roles INSERT
DROP POLICY IF EXISTS "Users can insert their own roles" ON public.user_roles;

-- Create a more permissive policy that allows users to make themselves admin
-- if there are no existing admins in the system (bootstrap scenario)
CREATE POLICY "Allow first admin creation" 
  ON public.user_roles 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id AND (
      -- Allow if there are no admins yet (bootstrap)
      NOT EXISTS (
        SELECT 1 FROM public.user_roles WHERE role = 'admin'
      )
      -- OR if the current user is already an admin (admins can create roles)
      OR EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() AND role = 'admin'
      )
    )
  );

-- Also update monthly_sales and branches policies to be less restrictive initially
-- Allow authenticated users to insert if there are no admins yet
DROP POLICY IF EXISTS "Only admins can insert monthly_sales" ON public.monthly_sales;
CREATE POLICY "Admins or bootstrap can insert monthly_sales" 
  ON public.monthly_sales 
  FOR INSERT 
  WITH CHECK (
    -- Allow if user is admin
    has_role(auth.uid(), 'admin'::app_role)
    -- OR if there are no admins yet (bootstrap scenario)
    OR NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin')
  );

DROP POLICY IF EXISTS "Only admins can insert branches" ON public.branches;
CREATE POLICY "Admins or bootstrap can insert branches" 
  ON public.branches 
  FOR INSERT 
  WITH CHECK (
    -- Allow if user is admin
    has_role(auth.uid(), 'admin'::app_role)
    -- OR if there are no admins yet (bootstrap scenario)
    OR NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin')
  );