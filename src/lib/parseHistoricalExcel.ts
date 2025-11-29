import * as XLSX from 'xlsx';
import { MonthlySale } from './importHistoricalData';

export const parseHistoricalExcel = async (file: File): Promise<MonthlySale[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        
        // Get the first sheet
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
          estoque_inicio_mes: Number(row['Estoque_Inicio_Mes']) || 0,
          qtde_vendida: Number(row['Qtde_Vendida']) || 0,
          qtde_reposicao: Number(row['Qtde_Reposicao']) || 0,
          estoque_final_mes: Number(row['Estoque_Final_Mes']) || 0,
          estoque_minimo_mes: Number(row['Estoque_Minimo_Mes']) || 0,
          estoque_maximo_mes: Number(row['Estoque_Maximo_Mes']) || 0,
          estoque_seguranca_mes: Number(row['Estoque_Seguranca_Mes']) || 0,
          ponto_pedido_mes: Number(row['Ponto_Pedido_Mes']) || 0,
        }));

        resolve(monthlySales);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsBinaryString(file);
  });
};
