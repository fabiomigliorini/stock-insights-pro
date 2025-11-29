import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Printer, ArrowRight } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useAutoLoad } from "@/hooks/useAutoLoad";
import { supabase } from "@/integrations/supabase/client";
import { MonthlySale } from "@/lib/importHistoricalData";

const Realocacao = () => {
  useAutoLoad();
  
  const [monthlyData, setMonthlyData] = useState<MonthlySale[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [selectedClasse, setSelectedClasse] = useState<string>("all");
  const [selectedFamilia, setSelectedFamilia] = useState<string>("all");
  const [selectedTamanho, setSelectedTamanho] = useState<string>("all");
  const [selectedCor, setSelectedCor] = useState<string>("all");
  const [selectedOrigem, setSelectedOrigem] = useState<string>("all");
  const [selectedDestino, setSelectedDestino] = useState<string>("all");

  // Buscar dados do último mês disponível
  useEffect(() => {
    const fetchLatestMonthData = async () => {
      try {
        setLoading(true);
        
        // Buscar o último mês/ano disponível
        const { data: latestData, error: latestError } = await supabase
          .from('monthly_sales')
          .select('ano, mes')
          .order('ano', { ascending: false })
          .order('mes', { ascending: false })
          .limit(1)
          .single();

        if (latestError) throw latestError;
        if (!latestData) {
          setLoading(false);
          return;
        }

        // Buscar todos os dados desse mês
        const { data, error } = await supabase
          .from('monthly_sales')
          .select('*')
          .eq('ano', latestData.ano)
          .eq('mes', latestData.mes);

        if (error) throw error;
        setMonthlyData(data || []);
      } catch (error) {
        console.error('Erro ao buscar dados mensais:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestMonthData();
  }, []);

  // Extrair valores únicos para os filtros (excluindo CD)
  const classes = useMemo(() => 
    Array.from(new Set(monthlyData.filter(p => p.local !== 'CD').map(p => p.classe).filter(Boolean))).sort(),
    [monthlyData]
  );

  const familias = useMemo(() => 
    Array.from(new Set(monthlyData.filter(p => p.local !== 'CD').map(p => p.familia).filter(Boolean))).sort(),
    [monthlyData]
  );

  const tamanhos = useMemo(() => 
    Array.from(new Set(monthlyData.filter(p => p.local !== 'CD').map(p => p.tamanho).filter(Boolean))).sort(),
    [monthlyData]
  );

  const cores = useMemo(() => 
    Array.from(new Set(monthlyData.filter(p => p.local !== 'CD').map(p => p.cor).filter(Boolean))).sort(),
    [monthlyData]
  );

  const locaisOrigem = useMemo(() => 
    Array.from(new Set(monthlyData.filter(p => p.local !== 'CD').map(p => p.local).filter(Boolean))).sort(),
    [monthlyData]
  );

  const locaisDestino = useMemo(() => 
    Array.from(new Set(monthlyData.filter(p => p.local !== 'CD').map(p => p.local).filter(Boolean))).sort(),
    [monthlyData]
  );

  // Gerar sugestões de realocação entre filiais
  const suggestions = useMemo(() => {
    // Filtrar apenas filiais (excluir CD)
    const branchData = monthlyData.filter(p => p.local !== 'CD');
    
    console.log('Total de registros (sem CD):', branchData.length);
    
    // Agrupar produtos por SKU+Cor+Tamanho
    const productMap = new Map<string, MonthlySale[]>();
    
    branchData.forEach(p => {
      const key = `${p.sku}_${p.cor || ''}_${p.tamanho || ''}`;
      if (!productMap.has(key)) {
        productMap.set(key, []);
      }
      productMap.get(key)!.push(p);
    });

    console.log('Produtos únicos (SKU+Cor+Tamanho):', productMap.size);

    const reallocationSuggestions: any[] = [];
    
    let totalOriginsWithSurplus = 0;
    let totalDestinationsWithDeficit = 0;

    // Para cada grupo de produtos (mesmo SKU+Cor+Tamanho)
    productMap.forEach((productsByLocation, key) => {
      // Encontrar filiais com estoque acima do máximo (possíveis origens)
      const originsWithSurplus = productsByLocation.filter(p => {
        const stock = p.estoque_final_mes || 0;
        const max = p.estoque_maximo_mes || 0;
        return stock > max;
      });

      // Encontrar filiais com estoque abaixo do ponto de pedido (possíveis destinos)
      const destinationsWithDeficit = productsByLocation.filter(p => {
        const stock = p.estoque_final_mes || 0;
        const pontoPedido = p.ponto_pedido_mes || 0;
        return pontoPedido > 0 && stock < pontoPedido;
      });
      
      totalOriginsWithSurplus += originsWithSurplus.length;
      totalDestinationsWithDeficit += destinationsWithDeficit.length;

      // Criar sugestões combinando origens com destinos
      originsWithSurplus.forEach(origin => {
        destinationsWithDeficit.forEach(destination => {
          // Não sugerir transferência para a mesma filial
          if (origin.local === destination.local) return;

          const originStock = origin.estoque_final_mes || 0;
          const originMax = origin.estoque_maximo_mes || 0;
          const destStock = destination.estoque_final_mes || 0;
          const destPontoPedido = destination.ponto_pedido_mes || 0;

          // Excedente na origem = estoque - máximo
          const surplus = originStock - originMax;
          
          // Déficit no destino = ponto de pedido - estoque
          const deficit = destPontoPedido - destStock;
          
          // Quantidade a transferir = MIN(excedente na origem, déficit no destino)
          const quantity = Math.min(surplus, deficit);

          if (quantity > 0) {
            reallocationSuggestions.push({
              id: `${origin.sku}_${origin.local}_${destination.local}`,
              sku: origin.sku,
              produto: origin.produto,
              classe: origin.classe,
              familia: origin.familia,
              cor: origin.cor,
              tamanho: origin.tamanho,
              from: origin.local,
              cidadeOrigem: origin.cidade,
              fromStock: originStock,
              fromMax: originMax,
              to: destination.local,
              cidadeDestino: destination.cidade,
              toStock: destStock,
              toPontoPedido: destPontoPedido,
              quantity: Math.round(quantity),
              priority: deficit > 50 ? "high" : "medium",
            });
          }
        });
      });
    });

    console.log('Origens com excedente (acima do máximo):', totalOriginsWithSurplus);
    console.log('Destinos com déficit (abaixo do ponto de pedido):', totalDestinationsWithDeficit);
    console.log('Total de sugestões geradas:', reallocationSuggestions.length);

    return reallocationSuggestions.sort((a, b) => {
      if (a.priority === "high" && b.priority !== "high") return -1;
      if (a.priority !== "high" && b.priority === "high") return 1;
      return b.quantity - a.quantity;
    });
  }, [monthlyData]);

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

  if (loading) {
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
            <h1 className="text-3xl font-bold text-foreground mb-2">Sugestões de Realocação</h1>
            <p className="text-muted-foreground">
              Realocações entre filiais: produtos acima do máximo em uma filial e abaixo do ponto de pedido em outra
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
                  {locaisOrigem.map(l => (
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
                  {locaisDestino.map(l => (
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
                        <div className="text-xs text-muted-foreground">
                          Atual: {suggestion.fromStock} / Máx: {suggestion.fromMax}
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </td>
                    <td className="p-3">
                      <div>
                        <div className="font-medium">{suggestion.to}</div>
                        <div className="text-xs text-muted-foreground">
                          Atual: {suggestion.toStock} / Ponto Pedido: {suggestion.toPontoPedido}
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
                Nenhuma sugestão de realocação encontrada com os filtros selecionados.
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

export default Realocacao;
