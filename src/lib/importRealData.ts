import * as XLSX from "xlsx";
import { Product, BranchConfig } from "./excelParser";

export const importRealData = async () => {
  try {
    const response = await fetch("/data/modelo-predicao.xlsx");
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array" });

    console.log("📋 Abas encontradas:", workbook.SheetNames);

    const result: any = {
      products: [],
      branches: [],
    };

    // Pegar a primeira aba (onde estão os dados)
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    console.log(`📊 ${data.length} linhas encontradas na aba "${firstSheetName}"`);
    console.log("🔍 Amostra de dados:", data.slice(0, 2));

    // Mapear locais únicos para filiais
    const locaisMap = new Map<string, { stock: number; count: number }>();

    // Processar produtos
    const products: Product[] = data.map((row: any, index: number) => {
      // Extrair valores da planilha
      const sku = String(row.SKU || row.sku || "");
      const produto = String(row.Produto || row.produto || "");
      const familia = String(row.Familia || row.familia || row.Família || "");
      const classe = String(row.Classe || row.classe || "");
      const subclasse = String(row.Subclasse || row.subclasse || "");
      const cor = String(row.Cor || row.cor || "");
      const tamanho = String(row.Tamanho || row.tamanho || "");
      const local = String(row.Local || row.local || "CD");
      const cidade = String(row.Cidade || row.cidade || "");
      
      const demandaMedia = Number(row.Demanda_Media || row["Demanda Media"] || row.demanda_media || 0);
      const demandaStd = Number(row.Demanda_Std || row["Demanda Std"] || row.demanda_std || 0);
      const cvDemanda = Number(row.CV_Demanda || row["CV Demanda"] || row.cv_demanda || 0);
      const volatilidade = String(row.Volatilidade || row.volatilidade || "Media");
      
      const estoqueSeguranca = Number(row.Estoque_Seguranca || row["Estoque Seguranca"] || row.estoque_seguranca || 0);
      const estoqueMin = Number(row.Estoque_Min_Sugerido || row["Estoque Min Sugerido"] || row.estoque_min_sugerido || 0);
      const estoqueMax = Number(row.Estoque_Max_Sugerido || row["Estoque Max Sugerido"] || row.estoque_max_sugerido || 0);
      const pontoPedido = Number(row.Ponto_Pedido || row["Ponto Pedido"] || row.ponto_pedido || 0);
      const qtdPedido = Number(row.Qtd_Pedido_Sugerida || row["Qtd Pedido Sugerida"] || row.qtd_pedido_sugerida || 0);

      // Calcular estoque atual (usar demanda média como base se não tiver estoque)
      const estoqueAtual = Math.round(demandaMedia * 2);

      // Determinar status
      let status: 'low' | 'ok' | 'high' = 'ok';
      if (estoqueAtual < estoqueMin) status = 'low';
      else if (estoqueAtual > estoqueMax) status = 'high';

      // Acumular dados por local
      if (!locaisMap.has(local)) {
        locaisMap.set(local, { stock: 0, count: 0 });
      }
      const localData = locaisMap.get(local)!;
      localData.stock += estoqueAtual;
      localData.count += 1;

      return {
        id: `${sku}-${local}-${index}`,
        sku,
        name: produto,
        familia,
        classe,
        subclasse,
        cor,
        tamanho,
        local,
        cidade,
        demandaMedia,
        demandaStd,
        cvDemanda,
        volatilidade,
        estoqueSeguranca,
        estoqueMinSugerido: estoqueMin,
        estoqueMaxSugerido: estoqueMax,
        pontoPedido,
        qtdPedidoSugerida: qtdPedido,
        // Campos de compatibilidade
        category: familia,
        stock: estoqueAtual,
        min: estoqueMin,
        max: estoqueMax,
        reorderPoint: pontoPedido,
        safetyStock: estoqueSeguranca,
        status,
        filial: local,
      } as Product;
    });

    result.products = products;

    // Criar filiais baseadas nos locais
    const branches: BranchConfig[] = [];
    locaisMap.forEach((data, local) => {
      const stock = data.stock;
      const capacity = Math.round(stock * 1.5); // Capacidade estimada
      const percentage = (stock / capacity) * 100;
      
      let status: 'low' | 'ok' | 'high' = 'ok';
      if (percentage < 40) status = 'low';
      else if (percentage > 85) status = 'high';

      branches.push({
        name: local,
        stock,
        capacity,
        status,
      });
    });

    result.branches = branches;

    console.log(`✅ ${products.length} produtos importados`);
    console.log(`✅ ${branches.length} locais/filiais identificados`);
    console.log("🏢 Locais:", branches.map(b => b.name).join(", "));

    return {
      success: true,
      message: `Importados ${products.length} produtos de ${branches.length} locais`,
      data: result,
    };
  } catch (error) {
    console.error("❌ Erro ao importar:", error);
    return {
      success: false,
      message: "Erro ao importar: " + (error as Error).message,
      data: null,
    };
  }
};
