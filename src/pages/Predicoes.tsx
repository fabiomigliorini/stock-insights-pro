import { DashboardLayout } from "@/components/DashboardLayout";
import { useData } from "@/contexts/DataContext";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Activity, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Predicoes = () => {
  const { productStats } = useData();

  // Agregar dados por volatilidade
  const byVolatilidade = {
    alta: productStats.filter(p => p.volatilidade?.toLowerCase() === 'alta').length,
    media: productStats.filter(p => p.volatilidade?.toLowerCase() === 'media' || p.volatilidade?.toLowerCase() === 'média').length,
    baixa: productStats.filter(p => p.volatilidade?.toLowerCase() === 'baixa').length,
  };

  // Demanda total média
  const totalDemandaMedia = productStats.reduce((sum, p) => sum + (p.demanda_media || 0), 0);

  // Top produtos por demanda
  const topDemanda = [...productStats]
    .filter(p => p.demanda_media)
    .sort((a, b) => (b.demanda_media || 0) - (a.demanda_media || 0))
    .slice(0, 10);

  // Produtos com maior CV de demanda (mais incertos)
  const maiorCV = [...productStats]
    .filter(p => p.cv_demanda)
    .sort((a, b) => (b.cv_demanda || 0) - (a.cv_demanda || 0))
    .slice(0, 10);

  return (
    <DashboardLayout>
      <div className="p-8 space-y-8 animate-in fade-in duration-500">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Análise de Demanda</h1>
          <p className="text-muted-foreground">
            Parâmetros sugeridos e análise de volatilidade baseados em dados históricos
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
              <TrendingUp className="h-5 w-5 text-success" />
              <h3 className="font-semibold text-foreground">Produtos Analisados</h3>
            </div>
            <p className="text-3xl font-bold text-foreground">{productStats.length}</p>
            <p className="text-sm text-muted-foreground">SKUs + Locais</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <h3 className="font-semibold text-foreground">Alta Volatilidade</h3>
            </div>
            <p className="text-3xl font-bold text-foreground">{byVolatilidade.alta}</p>
            <p className="text-sm text-muted-foreground">produtos com demanda instável</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingDown className="h-5 w-5 text-warning" />
              <h3 className="font-semibold text-foreground">Maior CV Demanda</h3>
            </div>
            <p className="text-3xl font-bold text-foreground">
              {maiorCV.length > 0 ? (maiorCV[0].cv_demanda * 100)?.toFixed(1) : '0'}%
            </p>
            <p className="text-sm text-muted-foreground">coeficiente de variação máximo</p>
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
              <div key={`${product.sku}-${product.local}`} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-lg text-muted-foreground w-8">#{index + 1}</span>
                  <div>
                    <p className="font-medium text-foreground">{product.produto}</p>
                    <p className="text-sm text-muted-foreground">
                      {product.familia} • {product.local} • SKU: {product.sku}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-foreground">
                    {product.demanda_media?.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    CV: {(product.cv_demanda * 100)?.toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top 10 Produtos por CV (Maior Incerteza) */}
        <Card className="p-6 border-warning/50">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <h3 className="text-lg font-semibold text-foreground">
              Top 10 Produtos com Maior Incerteza (CV Demanda)
            </h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Produtos com maior coeficiente de variação na demanda - requerem mais atenção
          </p>
          <div className="space-y-2">
            {maiorCV.map((product, index) => (
              <div key={`${product.sku}-${product.local}`} className="flex items-center justify-between p-3 bg-warning/10 rounded-lg border border-warning/20">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-lg text-muted-foreground w-8">#{index + 1}</span>
                  <div>
                    <p className="font-medium text-foreground">{product.produto}</p>
                    <p className="text-sm text-muted-foreground">
                      {product.local} • SKU: {product.sku}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="warning">CV: {(product.cv_demanda * 100)?.toFixed(1)}%</Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    Demanda: {product.demanda_media?.toFixed(1)} ± {product.demanda_std?.toFixed(1)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Predicoes;
