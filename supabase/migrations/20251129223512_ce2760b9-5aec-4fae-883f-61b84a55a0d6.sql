-- Drop existing tables to recreate with new structure
DROP TABLE IF EXISTS public.movements CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.branches CASCADE;

-- Create branches table (locations)
CREATE TABLE public.branches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  local TEXT NOT NULL,
  cidade TEXT NOT NULL,
  UNIQUE(local, cidade)
);

-- Enable RLS on branches
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

-- Create policies for branches
CREATE POLICY "All authenticated users can view branches" 
  ON public.branches FOR SELECT USING (true);

CREATE POLICY "Only admins can insert branches" 
  ON public.branches FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update branches" 
  ON public.branches FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete branches" 
  ON public.branches FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Create monthly sales history table
CREATE TABLE public.monthly_sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ano INTEGER NOT NULL,
  mes INTEGER NOT NULL,
  sku TEXT NOT NULL,
  produto TEXT NOT NULL,
  familia TEXT,
  classe TEXT,
  subclasse TEXT,
  cor TEXT,
  tamanho TEXT,
  local TEXT NOT NULL,
  cidade TEXT,
  estoque_inicio_mes NUMERIC DEFAULT 0,
  qtde_vendida NUMERIC DEFAULT 0,
  qtde_reposicao NUMERIC DEFAULT 0,
  estoque_final_mes NUMERIC DEFAULT 0,
  estoque_minimo_mes NUMERIC DEFAULT 0,
  estoque_maximo_mes NUMERIC DEFAULT 0,
  estoque_seguranca_mes NUMERIC DEFAULT 0,
  ponto_pedido_mes NUMERIC DEFAULT 0,
  UNIQUE(ano, mes, sku, local)
);

-- Enable RLS on monthly_sales
ALTER TABLE public.monthly_sales ENABLE ROW LEVEL SECURITY;

-- Create policies for monthly_sales
CREATE POLICY "All authenticated users can view monthly_sales" 
  ON public.monthly_sales FOR SELECT USING (true);

CREATE POLICY "Only admins can insert monthly_sales" 
  ON public.monthly_sales FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update monthly_sales" 
  ON public.monthly_sales FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete monthly_sales" 
  ON public.monthly_sales FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for better query performance
CREATE INDEX idx_monthly_sales_sku ON public.monthly_sales(sku);
CREATE INDEX idx_monthly_sales_local ON public.monthly_sales(local);
CREATE INDEX idx_monthly_sales_classe ON public.monthly_sales(classe);
CREATE INDEX idx_monthly_sales_ano_mes ON public.monthly_sales(ano, mes);

-- Create a view for aggregated product statistics
CREATE OR REPLACE VIEW public.product_stats AS
SELECT 
  sku,
  produto,
  familia,
  classe,
  subclasse,
  cor,
  tamanho,
  local,
  cidade,
  AVG(qtde_vendida) as demanda_media,
  STDDEV(qtde_vendida) as demanda_std,
  CASE 
    WHEN AVG(qtde_vendida) > 0 THEN STDDEV(qtde_vendida) / AVG(qtde_vendida)
    ELSE 0 
  END as cv_demanda,
  CASE 
    WHEN (CASE WHEN AVG(qtde_vendida) > 0 THEN STDDEV(qtde_vendida) / AVG(qtde_vendida) ELSE 0 END) > 0.5 THEN 'Alta'
    WHEN (CASE WHEN AVG(qtde_vendida) > 0 THEN STDDEV(qtde_vendida) / AVG(qtde_vendida) ELSE 0 END) > 0.3 THEN 'Média'
    ELSE 'Baixa'
  END as volatilidade,
  MAX(estoque_final_mes) as estoque_atual,
  AVG(estoque_minimo_mes) as estoque_minimo,
  AVG(estoque_maximo_mes) as estoque_maximo,
  AVG(estoque_seguranca_mes) as estoque_seguranca,
  AVG(ponto_pedido_mes) as ponto_pedido
FROM public.monthly_sales
GROUP BY sku, produto, familia, classe, subclasse, cor, tamanho, local, cidade;