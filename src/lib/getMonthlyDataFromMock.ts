import { MonthlySale } from "./mockData";

export interface MonthlyDataPoint {
  month: string;
  year: number;
  sales: number;
  stock: number;
  purchases: number;
  minStock: number;
  maxStock: number;
}

export const getMonthlyDataFromMock = (
  mockData: MonthlySale[],
  classe: string,
  familia?: string,
  cor?: string,
  tamanho?: string
): MonthlyDataPoint[] => {
  // Filtra dados pela classe e filtros opcionais
  let filteredData = mockData.filter(item => item.classe === classe);
  
  if (familia && familia !== "todos") {
    filteredData = filteredData.filter(item => item.familia === familia);
  }
  
  if (cor && cor !== "todos") {
    filteredData = filteredData.filter(item => item.cor === cor);
  }
  
  if (tamanho && tamanho !== "todos") {
    filteredData = filteredData.filter(item => item.tamanho === tamanho);
  }

  // Agrupa por ano e mês
  const monthlyMap = new Map<string, {
    sales: number;
    stock: number;
    purchases: number;
    year: number;
    month: number;
  }>();

  filteredData.forEach(item => {
    const key = `${item.ano}-${item.mes}`;
    
    if (!monthlyMap.has(key)) {
      monthlyMap.set(key, {
        sales: 0,
        stock: 0,
        purchases: 0,
        year: item.ano,
        month: item.mes,
      });
    }

    const current = monthlyMap.get(key)!;
    current.sales += item.qtde_vendida;
    current.purchases += item.qtde_entregue;
    current.stock += item.estoque_final_mes;
  });

  // Calcula estoque mínimo e máximo baseado nas vendas médias
  const salesValues = Array.from(monthlyMap.values()).map(m => m.sales);
  const avgSales = salesValues.length > 0 
    ? salesValues.reduce((sum, val) => sum + val, 0) / salesValues.length 
    : 0;

  const minStock = avgSales * 0.5;  // 50% da venda média
  const maxStock = avgSales * 2.0;  // 200% da venda média

  // Converte para array e ordena
  const monthlyData = Array.from(monthlyMap.entries())
    .map(([key, data]) => ({
      month: `${data.year}-${String(data.month).padStart(2, '0')}`,
      year: data.year,
      sales: data.sales,
      stock: data.stock,
      purchases: data.purchases,
      minStock,
      maxStock,
    }))
    .sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return parseInt(a.month.split('-')[1]) - parseInt(b.month.split('-')[1]);
    });

  return monthlyData;
};
