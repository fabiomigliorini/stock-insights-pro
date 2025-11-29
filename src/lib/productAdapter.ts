import { ProductStats } from "./importHistoricalData";

// Interface compatível com o formato antigo
export interface ProductDisplay {
  id: string;
  sku: string;
  name: string;
  category: string; // Added to match old Product interface
  categoria: string;
  stock: number;
  min: number;
  max: number;
  reorderPoint: number;
  safetyStock: number;
  status: 'low' | 'ok' | 'high';
  filial: string;
  familia: string | null;
  classe: string | null;
  subclasse: string | null;
  cor: string | null;
  tamanho: string | null;
  local: string;
  cidade: string | null;
  demandaMedia: number;
  demandaStd: number;
  cvDemanda: number;
  volatilidade: string;
  estoqueSeguranca: number;
  estoqueMinSugerido: number;
  estoqueMaxSugerido: number;
  pontoPedido: number;
  qtdPedidoSugerida: number;
}

export function adaptProductStats(stats: ProductStats[]): ProductDisplay[] {
  return stats.map(p => {
    const stock = p.estoque_atual || 0;
    const min = p.estoque_minimo || 0;
    const max = p.estoque_maximo || 0;
    
    let status: 'low' | 'ok' | 'high' = 'ok';
    if (stock < min) status = 'low';
    else if (stock > max) status = 'high';

    return {
      id: `${p.sku}-${p.local}`,
      sku: p.sku,
      name: p.produto,
      category: p.classe || p.familia || 'Geral', // Added
      categoria: p.classe || p.familia || 'Geral',
      stock,
      min,
      max,
      reorderPoint: p.ponto_pedido || 0,
      safetyStock: p.estoque_seguranca || 0,
      status,
      filial: p.local,
      familia: p.familia,
      classe: p.classe,
      subclasse: p.subclasse,
      cor: p.cor,
      tamanho: p.tamanho,
      local: p.local,
      cidade: p.cidade,
      demandaMedia: p.demanda_media || 0,
      demandaStd: p.demanda_std || 0,
      cvDemanda: p.cv_demanda || 0,
      volatilidade: p.volatilidade || 'Baixa',
      estoqueSeguranca: p.estoque_seguranca || 0,
      estoqueMinSugerido: p.estoque_minimo || 0,
      estoqueMaxSugerido: p.estoque_maximo || 0,
      pontoPedido: p.ponto_pedido || 0,
      qtdPedidoSugerida: 0,
    };
  });
}
