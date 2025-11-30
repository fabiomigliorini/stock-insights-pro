import { supabase } from "@/integrations/supabase/client";
import { MonthlySale } from "./importHistoricalData";

export interface MonthlyDataPoint {
  mes: string;
  ano: number;
  mesNum: number;
  vendas: number;
  estoque: number;
  compras: number;
  estoqueMin: number;
  estoqueMax: number;
}

/**
 * Busca dados mensais históricos para um SKU específico
 */
export async function getMonthlyDataForSKU(
  sku: string,
  local?: string,
  cor?: string,
  tamanho?: string
): Promise<MonthlyDataPoint[]> {
  try {
    let query = supabase
      .from('monthly_sales')
      .select('*')
      .eq('sku', sku)
      .order('ano', { ascending: true })
      .order('mes', { ascending: true });

    if (local && local !== 'todos') {
      query = query.eq('local', local);
    }
    if (cor && cor !== 'todos') {
      query = query.eq('cor', cor);
    }
    if (tamanho && tamanho !== 'todos') {
      query = query.eq('tamanho', tamanho);
    }

    const { data, error } = await query;

    if (error) throw error;

    if (!data || data.length === 0) return [];

    // Agrupar por ano-mês e somar valores
    const grouped = data.reduce((acc: Record<string, any>, row: MonthlySale) => {
      const key = `${row.ano}-${row.mes}`;
      if (!acc[key]) {
        acc[key] = {
          ano: row.ano,
          mes: row.mes,
          vendas: 0,
          estoque: 0,
          compras: 0,
        };
      }
      acc[key].vendas += row.qtde_vendida || 0;
      acc[key].estoque += row.estoque_final_mes || 0;
      acc[key].compras += row.qtde_entregue || 0;
      return acc;
    }, {});

    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

    return Object.values(grouped)
      .sort((a: any, b: any) => a.ano - b.ano || a.mes - b.mes)
      .map((group: any) => {
        // Calcular estoque mín/máx baseado na demanda do mês
        const estoqueMin = group.vendas * 0.5;  // 50% das vendas
        const estoqueMax = group.vendas * 2;     // 200% das vendas
        
        return {
          mes: `${monthNames[group.mes - 1]}/${group.ano.toString().slice(-2)}`,
          ano: group.ano,
          mesNum: group.mes,
          vendas: group.vendas,
          estoque: group.estoque,
          compras: group.compras,
          estoqueMin,
          estoqueMax,
        };
      });
  } catch (error) {
    console.error('Erro ao buscar dados mensais:', error);
    return [];
  }
}

/**
 * Busca dados mensais agregados para uma classe de produtos
 */
export async function getMonthlyDataForClass(
  classe: string,
  familia?: string,
  cor?: string,
  tamanho?: string
): Promise<MonthlyDataPoint[]> {
  try {
    let query = supabase
      .from('monthly_sales')
      .select('*')
      .eq('classe', classe)
      .order('ano', { ascending: true })
      .order('mes', { ascending: true });

    if (familia && familia !== 'todos') {
      query = query.eq('familia', familia);
    }
    if (cor && cor !== 'todos') {
      query = query.eq('cor', cor);
    }
    if (tamanho && tamanho !== 'todos') {
      query = query.eq('tamanho', tamanho);
    }

    console.log('[getMonthlyDataForClass] Filtros:', { classe, familia, cor, tamanho });

    const { data, error } = await query;

    if (error) throw error;

    if (!data || data.length === 0) {
      console.log('[getMonthlyDataForClass] Nenhum dado retornado');
      return [];
    }

    console.log('[getMonthlyDataForClass] Registros brutos retornados:', data.length);
    console.log('[getMonthlyDataForClass] Anos únicos:', [...new Set(data.map(d => d.ano))].sort());
    console.log('[getMonthlyDataForClass] Primeiros 5 registros:', data.slice(0, 5).map(d => ({ ano: d.ano, mes: d.mes, local: d.local })));

    // Agrupar por ano-mês
    const grouped = data.reduce((acc: Record<string, any>, row: MonthlySale) => {
      const key = `${row.ano}-${row.mes}`;
      if (!acc[key]) {
        acc[key] = {
          ano: row.ano,
          mes: row.mes,
          vendas: 0,
          estoque: 0,
          compras: 0,
          count: 0,
        };
      }
      acc[key].vendas += row.qtde_vendida || 0;
      acc[key].estoque += row.estoque_final_mes || 0;
      acc[key].compras += row.qtde_entregue || 0;
      acc[key].count += 1;
      return acc;
    }, {});

    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

    const result = Object.values(grouped)
      .sort((a: any, b: any) => a.ano - b.ano || a.mes - b.mes)
      .map((group: any) => {
        // Calcular estoque mín/máx baseado na demanda agregada do mês
        const estoqueMin = group.vendas * 0.5;  // 50% das vendas
        const estoqueMax = group.vendas * 2;     // 200% das vendas
        
        return {
          mes: `${monthNames[group.mes - 1]}/${group.ano.toString().slice(-2)}`,
          ano: group.ano,
          mesNum: group.mes,
          vendas: group.vendas,
          estoque: group.estoque,
          compras: group.compras,
          estoqueMin,
          estoqueMax,
        };
      });

    console.log('[getMonthlyDataForClass] Total de pontos mensais após agrupamento:', result.length);
    console.log('[getMonthlyDataForClass] Anos únicos no resultado:', [...new Set(result.map(d => d.ano))].sort());
    console.log('[getMonthlyDataForClass] Intervalo:', result[0]?.mes, 'até', result[result.length - 1]?.mes);

    return result;
  } catch (error) {
    console.error('Erro ao buscar dados mensais da classe:', error);
    return [];
  }
}
