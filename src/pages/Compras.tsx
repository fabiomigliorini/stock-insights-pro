import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Printer, ShoppingCart } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { useState, useMemo } from "react";
import { useAutoLoad } from "@/hooks/useAutoLoad";

const Compras = () => {
  useAutoLoad();
  const { products } = useData();

  // Filtros
  const [selectedClasse, setSelectedClasse] = useState<string>("all");
  const [selectedFamilia, setSelectedFamilia] = useState<string>("all");
  const [selectedTamanho, setSelectedTamanho] = useState<string>("all");
  const [selectedCor, setSelectedCor] = useState<string>("all");
  const [selectedLocal, setSelectedLocal] = useState<string>("all");

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

  // Gerar sugestões de compra: produtos com estoque abaixo do ponto de pedido
  const suggestions = useMemo(() => {
    const purchaseSuggestions = products
      .filter(p => {
        const stock = p.stock || 0;
        const pontoPedido = p.pontoPedido || 0;
        
        // Produto precisa ter ponto de pedido definido e estar abaixo dele
        return pontoPedido > 0 && stock < pontoPedido;
      })
      .map(p => {
        const stock = p.stock || 0;
        const estoqueMax = p.estoqueMaxSugerido || p.max || 0;
        const pontoPedido = p.pontoPedido || 0;
        
        // Quantidade para comprar = estoque máximo - saldo atual
        const quantityToOrder = Math.max(0, estoqueMax - stock);
        
        // Calcular déficit em relação ao ponto de pedido
        const deficit = pontoPedido - stock;
        
        return {
          id: p.id,
          sku: p.sku,
          produto: p.name,
          classe: p.classe,
          familia: p.familia,
          cor: p.cor,
          tamanho: p.tamanho,
          local: p.local,
          cidade: p.cidade,
          currentStock: stock,
          pontoPedido: pontoPedido,
          estoqueMax: estoqueMax,
          quantity: Math.round(quantityToOrder),
          priority: deficit > 50 ? "high" : "medium",
          deficit: Math.round(deficit),
        };
      })
      .filter(s => s.quantity > 0) // Apenas sugestões com quantidade > 0
      .sort((a, b) => {
        // Ordenar por prioridade e depois por déficit
        if (a.priority === "high" && b.priority !== "high") return -1;
        if (a.priority !== "high" && b.priority === "high") return 1;
        return b.deficit - a.deficit;
      });

    return purchaseSuggestions;
  }, [products]);

  // Aplicar filtros
  const filteredSuggestions = useMemo(() => {
    return suggestions.filter(s => {
      if (selectedClasse !== "all" && s.classe !== selectedClasse) return false;
      if (selectedFamilia !== "all" && s.familia !== selectedFamilia) return false;
      if (selectedTamanho !== "all" && s.tamanho !== selectedTamanho) return false;
      if (selectedCor !== "all" && s.cor !== selectedCor) return false;
      if (selectedLocal !== "all" && s.local !== selectedLocal) return false;
      return true;
    });
  }, [suggestions, selectedClasse, selectedFamilia, selectedTamanho, selectedCor, selectedLocal]);

  const handlePrint = () => {
    window.print();
  };

  // Calcular total de unidades a comprar
  const totalUnits = useMemo(() => 
    filteredSuggestions.reduce((sum, s) => sum + s.quantity, 0),
    [filteredSuggestions]
  );

  return (
    <DashboardLayout>
      <div className="p-8 space-y-6 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Sugestões de Compra</h1>
            <p className="text-muted-foreground">
              Produtos com estoque abaixo do ponto de pedido
            </p>
          </div>
          <Button onClick={handlePrint} variant="outline" className="print:hidden">
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:hidden">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <ShoppingCart className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Produtos para Comprar</p>
                <p className="text-2xl font-bold">{filteredSuggestions.length}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-destructive/10 rounded-lg">
                <ShoppingCart className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Alta Prioridade</p>
                <p className="text-2xl font-bold">
                  {filteredSuggestions.filter(s => s.priority === "high").length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-chart-1/10 rounded-lg">
                <ShoppingCart className="h-5 w-5 text-chart-1" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Unidades</p>
                <p className="text-2xl font-bold">{totalUnits.toLocaleString()}</p>
              </div>
            </div>
          </Card>
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
              <label className="text-sm font-medium mb-2 block">Local</label>
              <Select value={selectedLocal} onValueChange={setSelectedLocal}>
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
              {filteredSuggestions.length} sugestão(ões) de compra encontrada(s)
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
                  <th className="p-3 font-semibold">Local</th>
                  <th className="p-3 font-semibold text-right">Estoque Atual</th>
                  <th className="p-3 font-semibold text-right">Ponto de Pedido</th>
                  <th className="p-3 font-semibold text-right">Estoque Máx</th>
                  <th className="p-3 font-semibold text-right">Qtd. a Comprar</th>
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
                        <div className="font-medium">{suggestion.local}</div>
                        {suggestion.cidade && (
                          <div className="text-xs text-muted-foreground">{suggestion.cidade}</div>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-right">{suggestion.currentStock}</td>
                    <td className="p-3 text-right font-medium">{suggestion.pontoPedido}</td>
                    <td className="p-3 text-right">{suggestion.estoqueMax}</td>
                    <td className="p-3 text-right font-bold text-primary">{suggestion.quantity}</td>
                    <td className="p-3 print:hidden">
                      <Button size="sm" variant="outline">
                        Encomendar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredSuggestions.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                Nenhuma sugestão de compra encontrada com os filtros selecionados.
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

export default Compras;
