export interface MonthlySale {
  ano: number;
  mes: number;
  sku: string;
  produto: string;
  familia: string;
  classe: string;
  subclasse: string;
  cor: string;
  tamanho: string;
  local: string;
  cidade: string;
  qtde_vendida: number;
  qtde_entregue: number;
  estoque_final_mes: number;
}

// Gera dados locais realistas automaticamente para demonstração
// Usado quando não há dados importados no sistema
export const generateLocalData = (): MonthlySale[] => {
  const mockData: MonthlySale[] = [];
  
  // Produtos de exemplo com diferentes características
  const produtos = [
    { sku: "1", nome: "Calça BLM Skinny", familia: "Masculino", classe: "Calça", subclasse: "Skinny", cor: "Azul", tamanhos: ["38", "40", "42", "44", "46"] },
    { sku: "6", nome: "Calça BLM Skinny", familia: "Masculino", classe: "Calça", subclasse: "Skinny", cor: "Preto", tamanhos: ["38", "40", "42", "44", "46"] },
    { sku: "11", nome: "Calça BLM Skinny", familia: "Feminino", classe: "Calça", subclasse: "Skinny", cor: "Azul", tamanhos: ["36", "38", "40", "42", "44"] },
    { sku: "16", nome: "Bermuda BLM Cargo", familia: "Masculino", classe: "Bermuda", subclasse: "Cargo", cor: "Bege", tamanhos: ["38", "40", "42", "44", "46"] },
    { sku: "21", nome: "Bermuda BLM Cargo", familia: "Masculino", classe: "Bermuda", subclasse: "Cargo", cor: "Verde", tamanhos: ["38", "40", "42", "44", "46"] },
    { sku: "26", nome: "Jaqueta BLM Jeans", familia: "Masculino", classe: "Jaqueta", subclasse: "Jeans", cor: "Azul", tamanhos: ["P", "M", "G", "GG"] },
    { sku: "30", nome: "Jaqueta BLM Jeans", familia: "Feminino", classe: "Jaqueta", subclasse: "Jeans", cor: "Azul", tamanhos: ["P", "M", "G", "GG"] },
    { sku: "34", nome: "Camisa BLM Social", familia: "Masculino", classe: "Camisa", subclasse: "Social", cor: "Branco", tamanhos: ["P", "M", "G", "GG", "XG"] },
    { sku: "39", nome: "Camisa BLM Social", familia: "Masculino", classe: "Camisa", subclasse: "Social", cor: "Azul", tamanhos: ["P", "M", "G", "GG", "XG"] },
    { sku: "44", nome: "Vestido BLM Casual", familia: "Feminino", classe: "Vestido", subclasse: "Casual", cor: "Floral", tamanhos: ["P", "M", "G", "GG"] },
  ];

  const locais = [
    { local: "CD", cidade: "Cuiabá" },
    { local: "Loja Centro", cidade: "Cuiabá" },
    { local: "Loja Shopping", cidade: "Cuiabá" },
    { local: "Loja Norte", cidade: "Várzea Grande" },
    { local: "Loja Sul", cidade: "Rondonópolis" },
  ];

  // Gerar 24 meses de dados (2023 e 2024)
  const anos = [2023, 2024];
  const meses = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  let skuCounter = 1;

  produtos.forEach((produto) => {
    produto.tamanhos.forEach((tamanho) => {
      locais.forEach((localInfo) => {
        const isCD = localInfo.local === "CD";
        
        // Estoque inicial baixo - próximo de 1 mês de venda
        let estoqueAtual = isCD ? 
          Math.floor(Math.random() * 100) + 50 :  // CD: 50-150
          Math.floor(Math.random() * 40) + 30;    // Lojas: 30-70

        anos.forEach((ano) => {
          meses.forEach((mes) => {
            // Vendas variam por sazonalidade e tipo de produto
            let baseVendas = isCD ? 0 : Math.floor(Math.random() * 50) + 30; // 30-80 unidades
            
            // Sazonalidade: mais vendas no verão para bermudas, inverno para jaquetas
            if (produto.classe === "Bermuda" && (mes >= 11 || mes <= 3)) {
              baseVendas *= 1.8;
            } else if (produto.classe === "Jaqueta" && (mes >= 5 && mes <= 8)) {
              baseVendas *= 2.2;
            } else if (produto.classe === "Vestido" && (mes >= 9 && mes <= 12)) {
              baseVendas *= 1.5;
            }

            const qtdeVendida = Math.floor(baseVendas);

            // Lógica de reposição: manter estoque próximo das vendas (~30% acima)
            let qtdeEntregue = 0;
            if (isCD) {
              // CD compra a cada 2 meses, quantidade similar às vendas mensais das lojas
              if (mes % 2 === 1) {
                qtdeEntregue = Math.floor(Math.random() * 80) + 40; // 40-120
              }
            } else {
              // Lojas recebem transferências para manter estoque em ~1 mês de venda
              const vendaMedia = qtdeVendida;
              const estoqueIdeal = vendaMedia * 1.3; // 30% acima da venda
              const deficit = estoqueIdeal - estoqueAtual;
              
              // Se estoque está abaixo do ideal, repõe próximo da venda mensal
              if (deficit > 10) {
                qtdeEntregue = Math.floor(vendaMedia * 0.8 + Math.random() * vendaMedia * 0.4); // 80-120% da venda
              } 
              // Pequena reposição se próximo do ideal
              else if (deficit > 0) {
                qtdeEntregue = Math.floor(Math.random() * 15) + 5; // 5-20
              }
              // Sem reposição se estoque acima do ideal
              else {
                qtdeEntregue = 0;
              }
            }

            // Calcula estoque final
            estoqueAtual = estoqueAtual - qtdeVendida + qtdeEntregue;
            
            // Evita estoque negativo (reposição emergencial mínima)
            if (estoqueAtual < 0) {
              const reposicaoEmergencial = Math.floor(qtdeVendida * 1.2); // 120% da venda
              estoqueAtual = reposicaoEmergencial;
              qtdeEntregue += reposicaoEmergencial;
            }
            
            // Limita estoque máximo a ~1.5x a venda para manter proporcionalidade
            const estoqueMaximo = qtdeVendida * 1.5;
            if (estoqueAtual > estoqueMaximo && qtdeVendida > 0) {
              estoqueAtual = Math.floor(estoqueMaximo);
            }

            mockData.push({
              ano,
              mes,
              sku: String(skuCounter),
              produto: produto.nome,
              familia: produto.familia,
              classe: produto.classe,
              subclasse: produto.subclasse,
              cor: produto.cor,
              tamanho,
              local: localInfo.local,
              cidade: localInfo.cidade,
              qtde_vendida: qtdeVendida,
              qtde_entregue: qtdeEntregue,
              estoque_final_mes: estoqueAtual,
            });
          });
        });

        skuCounter++;
      });
    });
  });

  console.log(`✅ Gerados ${mockData.length} registros locais para visualização`);
  return mockData;
};

// Mantém compatibilidade com código existente
export const generateMockData = generateLocalData;
