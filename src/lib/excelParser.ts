import * as XLSX from 'xlsx';

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  stock: number;
  min: number;
  max: number;
  reorderPoint: number;
  safetyStock: number;
  status: 'low' | 'ok' | 'high';
  filial: string;
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
            const stock = Number(row['Estoque Atual'] || row['Estoque'] || 0);
            const min = Number(row['Estoque Mínimo'] || row['Minimo'] || 0);
            const max = Number(row['Estoque Máximo'] || row['Maximo'] || 100);
            
            let status: 'low' | 'ok' | 'high' = 'ok';
            if (stock < min) status = 'low';
            else if (stock > max) status = 'high';

            return {
              id: String(index + 1),
              name: row['Produto'] || row['Descrição'] || row['Nome'] || `Produto ${index + 1}`,
              sku: row['SKU'] || row['Código'] || `SKU-${index + 1}`,
              category: row['Categoria'] || row['Grupo'] || 'Geral',
              stock,
              min,
              max,
              reorderPoint: Number(row['Ponto de Reposição'] || row['Ponto Reposicao'] || min + (max - min) * 0.3),
              safetyStock: Number(row['Estoque de Segurança'] || row['Estoque Seguranca'] || min * 0.2),
              status,
              filial: row['Filial'] || row['Loja'] || 'CD',
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
          const sheetName = workbook.SheetNames.find(s => s.toLowerCase().includes('moviment')) || 'Movimentação';
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet);
          
          result.movements = jsonData.map((row: any) => ({
            date: row['Data'] || row.data || new Date().toISOString(),
            product: row['Produto'] || row.produto || row['Nome'] || row.nome || 'Produto',
            quantity: Number(row['Quantidade'] || row.quantidade || 0),
            type: (row['Tipo'] || row.tipo || 'entrada').toLowerCase() as 'entrada' | 'saida',
            branch: row['Filial'] || row.filial || row['Loja'] || row.loja || 'CD',
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
