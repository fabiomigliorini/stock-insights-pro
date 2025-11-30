import * as XLSX from 'xlsx';

export interface MonthlySale {
  ano: number;
  mes: number;
  sku: string;
  produto: string;
  familia: string | null;
  classe: string | null;
  subclasse: string | null;
  cor: string | null;
  tamanho: string | null;
  local: string;
  cidade: string | null;
  qtde_vendida: number;
  qtde_entregue: number;
  estoque_final_mes: number;
}

export interface ProductStats {
  sku: string;
  produto: string;
  familia: string | null;
  classe: string | null;
  subclasse: string | null;
  cor: string | null;
  tamanho: string | null;
  local: string;
  cidade: string | null;
  demanda_media: number;
  demanda_std: number;
  cv_demanda: number;
  volatilidade: string;
  estoque_atual: number;
}

export const importHistoricalData = async (): Promise<{
  success: boolean;
  data?: { monthlySales: MonthlySale[] };
  error?: string;
}> => {
  try {
    const response = await fetch('/data/historico-vendas-estoque.xlsx');
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(firstSheet);

    const monthlySales: MonthlySale[] = jsonData.map((row: any) => ({
      ano: Number(row['Ano']) || 0,
      mes: Number(row['Mes']) || 0,
      sku: String(row['SKU'] || ''),
      produto: String(row['Produto'] || ''),
      familia: row['Familia'] || null,
      classe: row['Classe'] || null,
      subclasse: row['Subclasse'] || null,
      cor: row['Cor'] || null,
      tamanho: String(row['Tamanho'] || ''),
      local: String(row['Local'] || ''),
      cidade: row['Cidade'] || null,
      qtde_vendida: Number(row['Qtde_Vendida']) || 0,
      qtde_entregue: Number(row['Qtde_Entregue']) || 0,
      estoque_final_mes: Number(row['Estoque_Final_Mes']) || 0,
    }));

    return {
      success: true,
      data: { monthlySales }
    };
  } catch (error) {
    console.error('Erro ao importar dados:', error);
    return {
      success: false,
      error: String(error)
    };
  }
};
