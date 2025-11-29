import { DashboardLayout } from "@/components/DashboardLayout";
import { useData } from "@/contexts/DataContext";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Activity, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Predicoes = () => {
  const { products } = useData();

  // Agregar dados por volatilidade
  const byVolatilidade = {
    alta: products.filter(p => p.volatilidade?.toLowerCase() === 'alta').length,
    media: products.filter(p => p.volatilidade?.toLowerCase() === 'media').length,
    baixa: products.filter(p => p.volatilidade?.toLowerCase() === 'baixa').length,
  };

  // Produtos que precisam reposição (estoque abaixo do ponto de pedido)
  const needsReorder = products.filter(p => p.stock < (p.pontoPedido || p.reorderPoint));

  // Demanda total média
  const totalDemandaMedia = products.reduce((sum, p) => sum + (p.demandaMedia || 0), 0);

  // Top produtos por demanda
  const topDemanda = [...products]
    .filter(p => p.demandaMedia)
    .sort((a, b) => (b.demandaMedia || 0) - (a.demandaMedia || 0))
    .slice(0, 10);

  // Produtos críticos (alta volatilidade + estoque baixo)
  const criticos = products.filter(p => 
    p.volatilidade?.toLowerCase() === 'alta' && p.status === 'low'
  );

  return (
    <DashboardLayout>
      <div className="p-8 space-y-8 animate-in fade-in duration-500">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Predições de Vendas</h1>
          <p className="text-muted-foreground">
            Análise de demanda e sugestões de reposição baseadas em dados históricos
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">Demanda Total Média</h3>
            </div>
            <p className="text-3xl font-bold text-foreground">{totalDemandaMedia.toFixed(0)}</p>
            <p className="text-sm text-muted-foreground">unidades/período</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <h3 className="font-semibold text-foreground">Precisam Reposição</h3>
            </div>
            <p className="text-3xl font-bold text-foreground">{needsReorder.length}</p>
            <p className="text-sm text-muted-foreground">produtos abaixo do ponto de pedido</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-5 w-5 text-success" />
              <h3 className="font-semibold text-foreground">Produtos Ativos</h3>
            </div>
            <p className="text-3xl font-bold text-foreground">{products.length}</p>
            <p className="text-sm text-muted-foreground">SKUs cadastrados</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingDown className="h-5 w-5 text-destructive" />
              <h3 className="font-semibold text-foreground">Críticos</h3>
            </div>
            <p className="text-3xl font-bold text-foreground">{criticos.length}</p>
            <p className="text-sm text-muted-foreground">alta volatilidade + baixo estoque</p>
          </Card>
        </div>

        {/* Distribuição por Volatilidade */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Distribuição por Volatilidade
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-foreground">Alta Volatilidade</span>
                <Badge variant="destructive">Alta</Badge>
              </div>
              <p className="text-2xl font-bold text-foreground">{byVolatilidade.alta}</p>
              <p className="text-sm text-muted-foreground">produtos</p>
            </div>

            <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-foreground">Média Volatilidade</span>
                <Badge variant="warning">Média</Badge>
              </div>
              <p className="text-2xl font-bold text-foreground">{byVolatilidade.media}</p>
              <p className="text-sm text-muted-foreground">produtos</p>
            </div>

            <div className="p-4 bg-success/10 rounded-lg border border-success/20">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-foreground">Baixa Volatilidade</span>
                <Badge variant="success">Baixa</Badge>
              </div>
              <p className="text-2xl font-bold text-foreground">{byVolatilidade.baixa}</p>
              <p className="text-sm text-muted-foreground">produtos</p>
            </div>
          </div>
        </Card>

        {/* Top 10 Produtos por Demanda */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Top 10 Produtos por Demanda Média
          </h3>
          <div className="space-y-3">
            {topDemanda.map((product, index) => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-lg text-muted-foreground w-8">#{index + 1}</span>
                  <div>
                    <p className="font-medium text-foreground">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {product.familia} • {product.local} • SKU: {product.sku}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-foreground">
                    {product.demandaMedia?.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    CV: {product.cvDemanda?.toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Produtos Críticos */}
        {criticos.length > 0 && (
          <Card className="p-6 border-destructive/50">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <h3 className="text-lg font-semibold text-foreground">
                Produtos Críticos - Ação Urgente
              </h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Produtos com alta volatilidade e estoque abaixo do mínimo
            </p>
            <div className="space-y-2">
              {criticos.slice(0, 10).map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                  <div>
                    <p className="font-medium text-foreground">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {product.local} • SKU: {product.sku}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="destructive">Crítico</Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      Sugestão: pedir {product.qtdPedidoSugerida || 0} unidades
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Predicoes;
