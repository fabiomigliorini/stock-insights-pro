import * as XLSX from "xlsx";
import { dataStore } from "./dataStore";
import { Product, BranchConfig } from "./excelParser";

export const importPredictionData = async () => {
  try {
    const response = await fetch("/data/modelo-predicao.xlsx");
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array" });

    const result: any = {
      products: [],
      branches: [],
      movements: [],
    };

    // Processar produtos
    if (workbook.SheetNames.includes("Produtos")) {
      const worksheet = workbook.Sheets["Produtos"];
      const data = XLSX.utils.sheet_to_json(worksheet);
      
      const products: Product[] = data.map((row: any, index: number) => {
        const stock = Number(row["Estoque Atual"] || row["Estoque"] || 0);
        const min = Number(row["Estoque Mínimo"] || row["Minimo"] || 0);
        const max = Number(row["Estoque Máximo"] || row["Maximo"] || 0);
        
        let status: "low" | "ok" | "high" = "ok";
        if (stock < min) status = "low";
        else if (stock > max) status = "high";

        return {
          id: String(index + 1),
          sku: String(row["SKU"] || row["Código"] || `SKU-${index + 1}`),
          name: String(row["Produto"] || row["Descrição"] || row["Nome"] || `Produto ${index + 1}`),
          category: String(row["Categoria"] || row["Grupo"] || "Geral"),
          stock,
          min,
          max,
          reorderPoint: Number(row["Ponto de Reposição"] || row["Ponto Reposicao"] || min + (max - min) * 0.3),
          safetyStock: Number(row["Estoque de Segurança"] || row["Estoque Seguranca"] || min * 0.2),
          status,
          filial: String(row["Filial"] || row["Loja"] || "CD"),
        };
      });

      dataStore.setProducts(products);
      console.log(`Importados ${products.length} produtos`);
      result.products = products;
    }

    // Processar filiais
    if (workbook.SheetNames.includes("Filiais")) {
      const worksheet = workbook.Sheets["Filiais"];
      const data = XLSX.utils.sheet_to_json(worksheet);
      
      const branches: BranchConfig[] = data.map((row: any) => {
        const stock = Number(row["Estoque"] || row["Estoque Atual"] || 0);
        const capacity = Number(row["Capacidade"] || row["Capacidade Total"] || stock * 1.5);
        
        let status: "low" | "ok" | "high" = "ok";
        const occupancy = capacity > 0 ? (stock / capacity) : 0;
        if (occupancy < 0.3) status = "low";
        else if (occupancy > 0.9) status = "high";

        return {
          name: String(row["Filial"] || row["Nome"] || row["Loja"] || "Filial"),
          stock,
          capacity,
          status,
        };
      });

      dataStore.setBranches(branches);
      console.log(`Importadas ${branches.length} filiais`);
      result.branches = branches;
    }

    // Processar movimentações
    if (workbook.SheetNames.includes("Movimentação") || workbook.SheetNames.includes("Movimentacao")) {
      const sheetName = workbook.SheetNames.find(s => 
        s.toLowerCase().includes("moviment")
      );
      
      if (sheetName) {
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);
        
        const movements = data.map((row: any) => ({
          date: row["Data"] || new Date().toISOString().split('T')[0],
          product: String(row["Produto"] || row["Nome"] || row["SKU"] || row["Código"] || ""),
          type: (String(row["Tipo"] || row["Movimento"] || "entrada").toLowerCase()) as 'entrada' | 'saida',
          quantity: Number(row["Quantidade"] || 0),
          branch: String(row["Filial"] || row["Loja"] || "CD"),
        }));

        dataStore.setMovements(movements);
        console.log(`Importadas ${movements.length} movimentações`);
        result.movements = movements;
      }
    }

    return {
      success: true,
      message: "Dados importados com sucesso!",
      data: result,
    };
  } catch (error) {
    console.error("Erro ao importar dados:", error);
    return {
      success: false,
      message: "Erro ao importar dados: " + (error as Error).message,
    };
  }
};
