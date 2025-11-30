-- Atualizar estrutura da tabela monthly_sales para nova modelagem
-- Primeiro remove a view que depende das colunas
DROP VIEW IF EXISTS public.product_stats;

-- Remove campos antigos de controle de estoque
ALTER TABLE public.monthly_sales 
  DROP COLUMN IF EXISTS estoque_inicio_mes,
  DROP COLUMN IF EXISTS qtde_reposicao,
  DROP COLUMN IF EXISTS estoque_minimo_mes,
  DROP COLUMN IF EXISTS estoque_maximo_mes,
  DROP COLUMN IF EXISTS estoque_seguranca_mes,
  DROP COLUMN IF EXISTS ponto_pedido_mes;

-- Adiciona novo campo qtde_entregue
ALTER TABLE public.monthly_sales 
  ADD COLUMN IF NOT EXISTS qtde_entregue numeric DEFAULT 0;

-- Recria view product_stats com nova modelagem (sem min/max/ponto_pedido)
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
    WHEN AVG(qtde_vendida) > 0 
    THEN STDDEV(qtde_vendida) / AVG(qtde_vendida)
    ELSE 0 
  END as cv_demanda,
  MAX(estoque_final_mes) as estoque_atual,
  CASE 
    WHEN STDDEV(qtde_vendida) / NULLIF(AVG(qtde_vendida), 0) > 0.5 THEN 'Alta'
    WHEN STDDEV(qtde_vendida) / NULLIF(AVG(qtde_vendida), 0) > 0.25 THEN 'Média'
    ELSE 'Baixa'
  END as volatilidade
FROM public.monthly_sales
GROUP BY sku, produto, familia, classe, subclasse, cor, tamanho, local, cidade;