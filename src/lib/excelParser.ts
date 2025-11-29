import * as XLSX from 'xlsx';

export interface Product {
  id: string;
  name: string;
  sku: string;
  stock: number;
  min: number;
  max: number;
  status: 'low' | 'ok' | 'high';
}

export interface BranchConfig {
  name: string;
  stock: number;
  capacity: number;
  status: 'low' | 'ok' | 'high';
}

export interface Movement {
  date: string;
  product: string;
  quantity: number;
  type: 'entrada' | 'saida';
  branch: string;
}

export const parseExcelFile = async (file: File): Promise<{
  products?: Product[];
  branches?: BranchConfig[];
  movements?: Movement[];
}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });

        const result: {
          products?: Product[];
          branches?: BranchConfig[];
          movements?: Movement[];
        } = {};

        // Parse Produtos sheet
        if (workbook.SheetNames.includes('Produtos')) {
          const sheet = workbook.Sheets['Produtos'];
          const jsonData = XLSX.utils.sheet_to_json(sheet);
          
          result.products = jsonData.map((row: any, index) => {
            const stock = Number(row.estoque || row.Estoque || 0);
            const min = Number(row.minimo || row.Mínimo || row.min || 0);
            const max = Number(row.maximo || row.Máximo || row.max || 100);
            
            let status: 'low' | 'ok' | 'high' = 'ok';
            if (stock < min) status = 'low';
            else if (stock > max) status = 'high';

            return {
              id: String(index + 1),
              name: row.nome || row.Nome || row.produto || row.Produto || `Produto ${index + 1}`,
              sku: row.sku || row.SKU || row.codigo || row.Código || `SKU-${index + 1}`,
              stock,
              min,
              max,
              status,
            };
          });
        }

        // Parse Filiais sheet
        if (workbook.SheetNames.includes('Filiais')) {
          const sheet = workbook.Sheets['Filiais'];
          const jsonData = XLSX.utils.sheet_to_json(sheet);
          
          result.branches = jsonData.map((row: any) => {
            const stock = Number(row.estoque || row.Estoque || 0);
            const capacity = Number(row.capacidade || row.Capacidade || 1000);
            const percentage = (stock / capacity) * 100;
            
            let status: 'low' | 'ok' | 'high' = 'ok';
            if (percentage < 40) status = 'low';
            else if (percentage > 85) status = 'high';

            return {
              name: row.nome || row.Nome || row.filial || row.Filial || 'Filial',
              stock,
              capacity,
              status,
            };
          });
        }

        // Parse Movimentação sheet
        if (workbook.SheetNames.includes('Movimentação') || workbook.SheetNames.includes('Movimentacao')) {
          const sheetName = workbook.SheetNames.includes('Movimentação') ? 'Movimentação' : 'Movimentacao';
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet);
          
          result.movements = jsonData.map((row: any) => ({
            date: row.data || row.Data || new Date().toISOString(),
            product: row.produto || row.Produto || row.nome || row.Nome || 'Produto',
            quantity: Number(row.quantidade || row.Quantidade || 0),
            type: (row.tipo || row.Tipo || 'entrada').toLowerCase() as 'entrada' | 'saida',
            branch: row.filial || row.Filial || row.local || row.Local || 'Filial',
          }));
        }

        resolve(result);
      } catch (error) {
        reject(new Error('Erro ao processar arquivo Excel: ' + (error as Error).message));
      }
    };

    reader.onerror = () => {
      reject(new Error('Erro ao ler arquivo'));
    };

    reader.readAsBinaryString(file);
  });
};
