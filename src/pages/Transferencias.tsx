import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, Printer } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { useState, useMemo } from "react";
import { useAutoLoad } from "@/hooks/useAutoLoad";

const Transferencias = () => {
  useAutoLoad();
  const { products, branches } = useData();

  // Filtros
  const [selectedClasse, setSelectedClasse] = useState<string>("all");
  const [selectedFamilia, setSelectedFamilia] = useState<string>("all");
  const [selectedTamanho, setSelectedTamanho] = useState<string>("all");
  const [selectedCor, setSelectedCor] = useState<string>("all");
  const [selectedOrigem, setSelectedOrigem] = useState<string>("all");
  const [selectedDestino, setSelectedDestino] = useState<string>("all");

  // Extrair valores únicos para os filtros
  const classes = useMemo(() => 
    Array.from(new Set(products.map(p => p.classe).filter(Boolean))).sort(),
    [products]
  );

  const familias = useMemo(() => 
    Array.from(new Set(products.map(p => p.familia).filter(Boolean))).sort(),
    [products]
  );

  const tamanhos = useMemo(() => 
    Array.from(new Set(products.map(p => p.tamanho).filter(Boolean))).sort(),
    [products]
  );

  const cores = useMemo(() => 
    Array.from(new Set(products.map(p => p.cor).filter(Boolean))).sort(),
    [products]
  );

  const locais = useMemo(() => 
    Array.from(new Set(products.map(p => p.local).filter(Boolean))).sort(),
    [products]
  );

  // Gerar sugestões de transferência: CD -> Filiais com estoque abaixo do mínimo
  const suggestions = useMemo(() => {
    const transferSuggestions = [];
    
    // Agrupar produtos por SKU base (sem considerar local)
    const productsBySku: { [key: string]: any[] } = {};
    products.forEach(p => {
      if (!productsBySku[p.sku]) {
        productsBySku[p.sku] = [];
      }
      productsBySku[p.sku].push(p);
    });

    // Para cada grupo de SKU, identificar oportunidades de transferência do CD
    Object.keys(productsBySku).forEach(sku => {
      const skuProducts = productsBySku[sku];
      
      // Encontrar o produto no CD
      const cdProduct = skuProducts.find(p => p.local === 'CD');
      
      // Se não há produto no CD ou CD não tem estoque, pular
      if (!cdProduct || (cdProduct.stock || 0) <= 0) return;

      // Encontrar filiais com estoque abaixo do mínimo
      const filiaisNeedingStock = skuProducts.filter(p => 
        p.local !== 'CD' && 
        (p.stock || 0) < (p.estoqueMinSugerido || p.min || 0)
      );

      // Criar sugestões para cada filial que precisa de estoque
      filiaisNeedingStock.forEach(filial => {
        const estoqueMax = filial.estoqueMaxSugerido || filial.max || 0;
        const saldoFilial = filial.stock || 0;
        const saldoCD = cdProduct.stock || 0;
        
        // Quantidade = MIN(estoque_max_filial - saldo_filial, saldo_CD)
        const quantidadeNecessaria = estoqueMax - saldoFilial;
        const transferQty = Math.min(quantidadeNecessaria, saldoCD);

        if (transferQty > 0) {
          const estoqueMin = filial.estoqueMinSugerido || filial.min || 0;
          const deficit = estoqueMin - saldoFilial;
          
          transferSuggestions.push({
            id: `${cdProduct.id}-${filial.id}`,
            sku: cdProduct.sku,
            produto: cdProduct.name,
            classe: cdProduct.classe,
            familia: cdProduct.familia,
            cor: cdProduct.cor,
            tamanho: cdProduct.tamanho,
            from: 'CD',
            to: filial.local,
            quantity: Math.round(transferQty),
            priority: deficit > 50 ? "high" : "medium",
            fromStock: saldoCD,
            toStock: saldoFilial,
            toMin: estoqueMin,
            toMax: estoqueMax
          });
        }
      });
    });

    return transferSuggestions.sort((a, b) => {
      if (a.priority === "high" && b.priority !== "high") return -1;
      if (a.priority !== "high" && b.priority === "high") return 1;
      return b.quantity - a.quantity;
    });
  }, [products]);

  // Aplicar filtros
  const filteredSuggestions = useMemo(() => {
    return suggestions.filter(s => {
      if (selectedClasse !== "all" && s.classe !== selectedClasse) return false;
      if (selectedFamilia !== "all" && s.familia !== selectedFamilia) return false;
      if (selectedTamanho !== "all" && s.tamanho !== selectedTamanho) return false;
      if (selectedCor !== "all" && s.cor !== selectedCor) return false;
      if (selectedOrigem !== "all" && s.from !== selectedOrigem) return false;
      if (selectedDestino !== "all" && s.to !== selectedDestino) return false;
      return true;
    });
  }, [suggestions, selectedClasse, selectedFamilia, selectedTamanho, selectedCor, selectedOrigem, selectedDestino]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <DashboardLayout>
      <div className="p-8 space-y-6 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Sugestões de Transferência</h1>
            <p className="text-muted-foreground">
              Otimize o estoque entre locais baseado em demanda e disponibilidade
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Classe</label>
              <Select value={selectedClasse} onValueChange={setSelectedClasse}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {classes.map(c => (
                    <SelectItem key={c} value={c!}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Família</label>
              <Select value={selectedFamilia} onValueChange={setSelectedFamilia}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {familias.map(f => (
                    <SelectItem key={f} value={f!}>{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Tamanho</label>
              <Select value={selectedTamanho} onValueChange={setSelectedTamanho}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {tamanhos.map(t => (
                    <SelectItem key={t} value={t!}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Cor</label>
              <Select value={selectedCor} onValueChange={setSelectedCor}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {cores.map(c => (
                    <SelectItem key={c} value={c!}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Local de Origem</label>
              <Select value={selectedOrigem} onValueChange={setSelectedOrigem}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {locais.map(l => (
                    <SelectItem key={l} value={l!}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Local de Destino</label>
              <Select value={selectedDestino} onValueChange={setSelectedDestino}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {locais.map(l => (
                    <SelectItem key={l} value={l!}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
                  <th className="p-3 font-semibold"></th>
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
                        <div className="text-xs text-muted-foreground">Estoque: {suggestion.fromStock}</div>
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </td>
                    <td className="p-3">
                      <div>
                        <div className="font-medium">{suggestion.to}</div>
                        <div className="text-xs text-muted-foreground">
                          Atual: {suggestion.toStock} / Mín: {suggestion.toMin} / Máx: {suggestion.toMax}
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
                Nenhuma sugestão de transferência encontrada com os filtros selecionados.
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

export default Transferencias;
