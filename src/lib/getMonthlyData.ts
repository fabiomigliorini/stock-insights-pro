import { supabase } from "@/integrations/supabase/client";
import { MonthlySale } from "./importHistoricalData";

export interface MonthlyDataPoint {
  mes: string;
  ano: number;
  mesNum: number;
  vendas: number;
  estoque: number;
  min: number;
  max: number;
  seguranca: number;
  pontoPedido: number;
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
          min: 0,
          max: 0,
          seguranca: 0,
          pontoPedido: 0,
        };
      }
      acc[key].vendas += row.qtde_vendida || 0;
      acc[key].estoque += row.estoque_final_mes || 0;
      acc[key].min += row.estoque_minimo_mes || 0;
      acc[key].max += row.estoque_maximo_mes || 0;
      acc[key].seguranca += row.estoque_seguranca_mes || 0;
      acc[key].pontoPedido += row.ponto_pedido_mes || 0;
      return acc;
    }, {});

    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

    return Object.values(grouped)
      .sort((a: any, b: any) => a.ano - b.ano || a.mes - b.mes)
      .map((group: any) => ({
        mes: `${monthNames[group.mes - 1]}/${group.ano.toString().slice(-2)}`,
        ano: group.ano,
        mesNum: group.mes,
        vendas: group.vendas,
        estoque: group.estoque,
        min: group.min,
        max: group.max,
        seguranca: group.seguranca,
        pontoPedido: group.pontoPedido,
      }));
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

    const { data, error } = await query;

    if (error) throw error;

    if (!data || data.length === 0) return [];

    // Agrupar por ano-mês
    const grouped = data.reduce((acc: Record<string, any>, row: MonthlySale) => {
      const key = `${row.ano}-${row.mes}`;
      if (!acc[key]) {
        acc[key] = {
          ano: row.ano,
          mes: row.mes,
          vendas: 0,
          estoque: 0,
          min: 0,
          max: 0,
          seguranca: 0,
          pontoPedido: 0,
          count: 0,
        };
      }
      acc[key].vendas += row.qtde_vendida || 0;
      acc[key].estoque += row.estoque_final_mes || 0;
      acc[key].min += row.estoque_minimo_mes || 0;
      acc[key].max += row.estoque_maximo_mes || 0;
      acc[key].seguranca += row.estoque_seguranca_mes || 0;
      acc[key].pontoPedido += row.ponto_pedido_mes || 0;
      acc[key].count += 1;
      return acc;
    }, {});

    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

    return Object.values(grouped)
      .sort((a: any, b: any) => a.ano - b.ano || a.mes - b.mes)
      .map((group: any) => ({
        mes: `${monthNames[group.mes - 1]}/${group.ano.toString().slice(-2)}`,
        ano: group.ano,
        mesNum: group.mes,
        vendas: group.vendas,
        estoque: group.estoque,
        min: group.min,
        max: group.max,
        seguranca: group.seguranca,
        pontoPedido: group.pontoPedido,
      }));
  } catch (error) {
    console.error('Erro ao buscar dados mensais da classe:', error);
    return [];
  }
}
