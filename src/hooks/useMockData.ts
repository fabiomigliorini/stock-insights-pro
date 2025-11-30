import { useMemo } from "react";
import { generateLocalData, MonthlySale } from "@/lib/mockData";

export interface MockProduct {
  sku: string;
  produto: string;
  familia: string;
  classe: string;
  subclasse: string;
  cor: string;
  tamanho: string;
  local: string;
  cidade: string;
  demanda_media: number;
  estoque_atual: number;
  volatilidade: string;
}

export const useMockData = () => {
  const mockData = useMemo(() => generateLocalData(), []);

  const products = useMemo(() => {
    const productMap = new Map<string, MockProduct>();

    mockData.forEach((sale) => {
      const key = `${sale.sku}-${sale.local}`;
      
      if (!productMap.has(key)) {
        // Calcula demanda média dos últimos 6 meses
        const recentSales = mockData.filter(
          s => s.sku === sale.sku && 
          s.local === sale.local &&
          (s.ano === 2024 && s.mes >= 7) || (s.ano === 2024 && s.mes <= 12)
        );
        
        const avgDemand = recentSales.length > 0
          ? recentSales.reduce((sum, s) => sum + s.qtde_vendida, 0) / recentSales.length
          : 0;

        const stdDev = recentSales.length > 0
          ? Math.sqrt(
              recentSales.reduce((sum, s) => sum + Math.pow(s.qtde_vendida - avgDemand, 2), 0) / 
              recentSales.length
            )
          : 0;

        const cv = avgDemand > 0 ? stdDev / avgDemand : 0;
        
        let volatilidade = "Baixa";
        if (cv > 0.5) volatilidade = "Alta";
        else if (cv > 0.3) volatilidade = "Média";

        productMap.set(key, {
          sku: sale.sku,
          produto: sale.produto,
          familia: sale.familia,
          classe: sale.classe,
          subclasse: sale.subclasse,
          cor: sale.cor,
          tamanho: sale.tamanho,
          local: sale.local,
          cidade: sale.cidade,
          demanda_media: avgDemand,
          estoque_atual: sale.estoque_final_mes,
          volatilidade,
        });
      }
    });

    return Array.from(productMap.values());
  }, [mockData]);

  return {
    mockData,
    products,
    isLoading: false,
  };
};
