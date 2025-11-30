import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { useState, useMemo } from "react";
import { useMockData } from "@/hooks/useMockData";
import { FilterButton } from "@/components/FilterButton";

interface RedistribuicaoSuggestion {
  id: string;
  sku: string;
  produto: string;
  classe: string;
  familia: string;
  cor: string;
  tamanho: string;
  from: string;
  cidadeOrigem: string;
  to: string;
  cidadeDestino: string;
  quantity: number;
  fromStock: number;
  toStock: number;
  toMin: number;
  toMax: number;
  priority: "high" | "medium";
}

const Redistribuicao = () => {
  const { mockData, isLoading } = useMockData();
  
  // Filtros
  const [selectedClasse, setSelectedClasse] = useState<string>("all");
  const [selectedFamilia, setSelectedFamilia] = useState<string>("all");
  const [selectedTamanho, setSelectedTamanho] = useState<string>("all");
  const [selectedCor, setSelectedCor] = useState<string>("all");
  const [selectedDestino, setSelectedDestino] = useState<string>("all");

  // Pegar dados do último mês disponível
  const latestMonthData = useMemo(() => {
    if (!mockData.length) return [];
    
    // Encontrar o último ano e mês
    const maxYear = Math.max(...mockData.map(d => d.ano));
    const dataLastYear = mockData.filter(d => d.ano === maxYear);
    const maxMonth = Math.max(...dataLastYear.map(d => d.mes));
    
    return mockData.filter(d => d.ano === maxYear && d.mes === maxMonth);
  }, [mockData]);

  // Extrair valores únicos para os filtros
  const classes = useMemo(() => 
    Array.from(new Set(latestMonthData.map(p => p.classe).filter(Boolean))).sort(),
    [latestMonthData]
  );

  const familias = useMemo(() => 
    Array.from(new Set(latestMonthData.map(p => p.familia).filter(Boolean))).sort(),
    [latestMonthData]
  );

  const tamanhos = useMemo(() => 
    Array.from(new Set(latestMonthData.map(p => p.tamanho).filter(Boolean))).sort(),
    [latestMonthData]
  );

  const cores = useMemo(() => 
    Array.from(new Set(latestMonthData.map(p => p.cor).filter(Boolean))).sort(),
    [latestMonthData]
  );

  const locaisDestino = useMemo(() => 
    Array.from(new Set(latestMonthData.map(p => p.local).filter(Boolean).filter(l => l !== "CD"))).sort(),
    [latestMonthData]
  );

  // Gerar sugestões de redistribuição
  const suggestions = useMemo(() => {
    // Agrupar produtos por SKU
    const productMap = new Map<string, typeof latestMonthData>();
    
    latestMonthData.forEach(p => {
      if (!productMap.has(p.sku)) {
        productMap.set(p.sku, []);
      }
      productMap.get(p.sku)!.push(p);
    });

    const redistributionSuggestions: RedistribuicaoSuggestion[] = [];

    // Para cada grupo de produtos (mesmo SKU)
    productMap.forEach((productsByLocation) => {
      // Encontrar o CD
      const cdProduct = productsByLocation.find(p => p.local === 'CD');
      if (!cdProduct || cdProduct.estoque_final_mes <= 0) return; // Sem estoque no CD

      // Para cada filial
      const branches = productsByLocation.filter(p => p.local !== 'CD');
      branches.forEach(branchProduct => {
        const branchStock = branchProduct.estoque_final_mes;
        const branchVendas = branchProduct.qtde_vendida;
        const cdStock = cdProduct.estoque_final_mes;

        // Estimar mínimo como 50% das vendas e máximo como 200% vendas
        const branchMinEstimado = branchVendas * 0.5;
        const branchMaxEstimado = branchVendas * 2;

        // Se a filial está abaixo do mínimo estimado
        if (branchStock < branchMinEstimado) {
          // Quantidade a transferir = MIN(max_filial - saldo_filial, saldo_cd)
          const quantityNeeded = branchMaxEstimado - branchStock;
          const quantity = Math.min(quantityNeeded, cdStock);

          if (quantity > 0) {
            redistributionSuggestions.push({
              id: `${cdProduct.sku}_${cdProduct.local}_${branchProduct.local}`,
              sku: cdProduct.sku,
              produto: cdProduct.produto,
              classe: cdProduct.classe,
              familia: cdProduct.familia,
              cor: cdProduct.cor,
              tamanho: branchProduct.tamanho,
              from: cdProduct.local,
              cidadeOrigem: cdProduct.cidade,
              to: branchProduct.local,
              cidadeDestino: branchProduct.cidade,
              quantity: Math.round(quantity),
              fromStock: cdStock,
              toStock: branchStock,
              toMin: Math.round(branchMinEstimado),
              toMax: Math.round(branchMaxEstimado),
              priority: branchStock === 0 ? "high" : "medium",
            });
          }
        }
      });
    });

    return redistributionSuggestions.sort((a, b) => {
      if (a.priority === "high" && b.priority !== "high") return -1;
      if (a.priority !== "high" && b.priority === "high") return 1;
      return b.quantity - a.quantity;
    });
  }, [latestMonthData]);

  // Aplicar filtros
  const filteredSuggestions = useMemo(() => {
    return suggestions.filter(s => {
      if (selectedClasse !== "all" && s.classe !== selectedClasse) return false;
      if (selectedFamilia !== "all" && s.familia !== selectedFamilia) return false;
      if (selectedTamanho !== "all" && s.tamanho !== selectedTamanho) return false;
      if (selectedCor !== "all" && s.cor !== selectedCor) return false;
      if (selectedDestino !== "all" && s.to !== selectedDestino) return false;
      return true;
    });
  }, [suggestions, selectedClasse, selectedFamilia, selectedTamanho, selectedCor, selectedDestino]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-8 flex items-center justify-center">
          <p className="text-muted-foreground">Carregando dados...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8 space-y-6 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Sugestões de Redistribuição</h1>
            <p className="text-muted-foreground">
              Otimize o estoque entre filiais baseado em demanda e disponibilidade do CD
            </p>
          </div>
          <Button onClick={handlePrint} variant="outline" className="print:hidden">
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
        </div>

        {/* Filtros */}
        <Card className="p-6 print:hidden">
          <h3 className="text-lg font-semibold mb-4">Filtros</h3>
          <div className="flex flex-wrap gap-3">
            <FilterButton
              label="Classe"
              value={selectedClasse}
              options={classes as string[]}
              onChange={setSelectedClasse}
            />
            <FilterButton
              label="Família"
              value={selectedFamilia}
              options={familias as string[]}
              onChange={setSelectedFamilia}
            />
            <FilterButton
              label="Tamanho"
              value={selectedTamanho}
              options={tamanhos as string[]}
              onChange={setSelectedTamanho}
            />
            <FilterButton
              label="Cor"
              value={selectedCor}
              options={cores as string[]}
              onChange={setSelectedCor}
            />
            <FilterButton
              label="Local de Destino"
              value={selectedDestino}
              options={locaisDestino as string[]}
              onChange={setSelectedDestino}
            />
          </div>
        </Card>

        {/* Tabela de Sugestões */}
        <Card className="p-6">
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              {filteredSuggestions.length} sugestão(ões) encontrada(s)
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr className="text-left">
                  <th className="p-3 font-semibold">Prioridade</th>
                  <th className="p-3 font-semibold">SKU</th>
                  <th className="p-3 font-semibold">Produto</th>
                  <th className="p-3 font-semibold">Classe</th>
                  <th className="p-3 font-semibold">Família</th>
                  <th className="p-3 font-semibold">Cor</th>
                  <th className="p-3 font-semibold">Tamanho</th>
                  <th className="p-3 font-semibold">Origem</th>
                  <th className="p-3 font-semibold">Destino</th>
                  <th className="p-3 font-semibold text-right">Quantidade</th>
                  <th className="p-3 font-semibold print:hidden">Ação</th>
                </tr>
              </thead>
              <tbody>
                {filteredSuggestions.map((suggestion) => (
                  <tr key={suggestion.id} className="border-b hover:bg-accent/50">
                    <td className="p-3">
                      <Badge variant={suggestion.priority === "high" ? "destructive" : "default"}>
                        {suggestion.priority === "high" ? "Alta" : "Média"}
                      </Badge>
                    </td>
                    <td className="p-3 font-mono text-xs">{suggestion.sku}</td>
                    <td className="p-3">{suggestion.produto}</td>
                    <td className="p-3 text-muted-foreground">{suggestion.classe || "-"}</td>
                    <td className="p-3 text-muted-foreground">{suggestion.familia || "-"}</td>
                    <td className="p-3 text-muted-foreground">{suggestion.cor || "-"}</td>
                    <td className="p-3 text-muted-foreground">{suggestion.tamanho || "-"}</td>
                    <td className="p-3">
                      <div>
                        <div className="font-medium">{suggestion.from}</div>
                        <div className="text-xs text-muted-foreground">
                          Estoque: {suggestion.fromStock}
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div>
                        <div className="font-medium">{suggestion.to}</div>
                        <div className="text-xs text-muted-foreground">
                          Atual: {suggestion.toStock} | Mín: {suggestion.toMin} | Máx: {suggestion.toMax}
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-right font-semibold">{suggestion.quantity}</td>
                    <td className="p-3 print:hidden">
                      <Button size="sm" variant="outline">
                        Aprovar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredSuggestions.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                Nenhuma sugestão de redistribuição encontrada com os filtros selecionados.
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Estilos de impressão */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:hidden {
            display: none !important;
          }
          [class*="p-8"] {
            padding: 1rem !important;
          }
          table, table * {
            visibility: visible;
          }
          table {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </DashboardLayout>
  );
};

export default Redistribuicao;
