-- Corrigir a função para ter search_path seguro
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Habilitar RLS nas tabelas
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movements ENABLE ROW LEVEL SECURITY;

-- Criar políticas públicas para acesso total (sistema interno sem autenticação)
CREATE POLICY "Acesso público total" ON public.branches FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso público total" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acesso público total" ON public.movements FOR ALL USING (true) WITH CHECK (true);