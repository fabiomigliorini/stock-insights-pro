import { ProductStats } from "./importHistoricalData";

// Interface compatível com o formato antigo
export interface ProductDisplay {
  id: string;
  sku: string;
  name: string;
  category: string;
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
    
    // Sem min/max na nova modelagem, usar valores padrão baseados na demanda
    const demandaMedia = p.demanda_media || 0;
    const min = demandaMedia * 0.5; // Estimativa: 50% da demanda média
    const max = demandaMedia * 2;   // Estimativa: 200% da demanda média
    
    let status: 'low' | 'ok' | 'high' = 'ok';
    if (stock < min) status = 'low';
    else if (stock > max) status = 'high';

    return {
      id: `${p.sku}-${p.local}`,
      sku: p.sku,
      name: p.produto,
      category: p.classe || p.familia || 'Geral',
      categoria: p.classe || p.familia || 'Geral',
      stock,
      min,
      max,
      reorderPoint: demandaMedia * 0.75, // Estimativa: 75% da demanda média
      safetyStock: demandaMedia * 0.25,  // Estimativa: 25% da demanda média
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
      estoqueSeguranca: demandaMedia * 0.25,
      estoqueMinSugerido: demandaMedia * 0.5,
      estoqueMaxSugerido: demandaMedia * 2,
      pontoPedido: demandaMedia * 0.75,
      qtdPedidoSugerida: 0,
    };
  });
}
