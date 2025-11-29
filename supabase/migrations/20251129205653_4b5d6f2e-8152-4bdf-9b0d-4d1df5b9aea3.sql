-- Drop existing public policies
DROP POLICY IF EXISTS "Acesso público total" ON public.products;
DROP POLICY IF EXISTS "Acesso público total" ON public.movements;
DROP POLICY IF EXISTS "Acesso público total" ON public.branches;

-- Products table: Authenticated users can read and write
CREATE POLICY "Authenticated users can view products"
ON public.products
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert products"
ON public.products
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update products"
ON public.products
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete products"
ON public.products
FOR DELETE
TO authenticated
USING (true);

-- Movements table: Authenticated users can read and write
CREATE POLICY "Authenticated users can view movements"
ON public.movements
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert movements"
ON public.movements
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update movements"
ON public.movements
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete movements"
ON public.movements
FOR DELETE
TO authenticated
USING (true);

-- Branches table: Authenticated users can read and write
CREATE POLICY "Authenticated users can view branches"
ON public.branches
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert branches"
ON public.branches
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update branches"
ON public.branches
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete branches"
ON public.branches
FOR DELETE
TO authenticated
USING (true);