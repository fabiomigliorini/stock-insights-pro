-- Criar tabela de filiais
CREATE TABLE IF NOT EXISTS public.branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  local TEXT NOT NULL,
  cidade TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(local)
);

-- Criar tabela de produtos
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT NOT NULL,
  produto TEXT NOT NULL,
  familia TEXT,
  classe TEXT,
  subclasse TEXT,
  cor TEXT,
  tamanho TEXT,
  local TEXT NOT NULL,
  cidade TEXT,
  demanda_media NUMERIC DEFAULT 0,
  demanda_std NUMERIC DEFAULT 0,
  cv_demanda NUMERIC DEFAULT 0,
  volatilidade TEXT CHECK (volatilidade IN ('Alta', 'Media', 'Baixa')),
  estoque_seguranca NUMERIC DEFAULT 0,
  estoque_min_sugerido NUMERIC DEFAULT 0,
  estoque_max_sugerido NUMERIC DEFAULT 0,
  ponto_pedido NUMERIC DEFAULT 0,
  qtd_pedido_sugerida NUMERIC DEFAULT 0,
  stock NUMERIC DEFAULT 0,
  status TEXT CHECK (status IN ('low', 'normal', 'high')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(sku, local)
);

-- Criar tabela de movimentações
CREATE TABLE IF NOT EXISTS public.movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_sku TEXT NOT NULL,
  from_location TEXT,
  to_location TEXT,
  quantity NUMERIC NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  type TEXT CHECK (type IN ('transfer', 'adjustment', 'sale', 'purchase')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_local ON public.products(local);
CREATE INDEX IF NOT EXISTS idx_products_volatilidade ON public.products(volatilidade);
CREATE INDEX IF NOT EXISTS idx_movements_product_sku ON public.movements(product_sku);
CREATE INDEX IF NOT EXISTS idx_movements_date ON public.movements(date);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();