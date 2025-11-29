-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Users can view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Update branches policies
DROP POLICY IF EXISTS "Authenticated users can view branches" ON public.branches;
DROP POLICY IF EXISTS "Authenticated users can insert branches" ON public.branches;
DROP POLICY IF EXISTS "Authenticated users can update branches" ON public.branches;
DROP POLICY IF EXISTS "Authenticated users can delete branches" ON public.branches;

CREATE POLICY "All authenticated users can view branches"
ON public.branches
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Only admins can insert branches"
ON public.branches
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update branches"
ON public.branches
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete branches"
ON public.branches
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Update products policies
DROP POLICY IF EXISTS "Authenticated users can view products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can insert products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can update products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can delete products" ON public.products;

CREATE POLICY "All authenticated users can view products"
ON public.products
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Only admins can insert products"
ON public.products
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update products"
ON public.products
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete products"
ON public.products
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Update movements policies
DROP POLICY IF EXISTS "Authenticated users can view movements" ON public.movements;
DROP POLICY IF EXISTS "Authenticated users can insert movements" ON public.movements;
DROP POLICY IF EXISTS "Authenticated users can update movements" ON public.movements;
DROP POLICY IF EXISTS "Authenticated users can delete movements" ON public.movements;

CREATE POLICY "All authenticated users can view movements"
ON public.movements
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Only admins can insert movements"
ON public.movements
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update movements"
ON public.movements
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete movements"
ON public.movements
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));