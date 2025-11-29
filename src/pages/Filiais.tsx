import { DashboardLayout } from "@/components/DashboardLayout";
import { BranchesOverview } from "@/components/BranchesOverview";
import { TransferSuggestions } from "@/components/TransferSuggestions";
import { Card } from "@/components/ui/card";
import { useData } from "@/contexts/DataContext";
import { Building2, Package, TrendingUp, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Filiais = () => {
  const { branches, products } = useData();

  // Calcular estatísticas por filial
  const branchStats = branches.map(branch => {
    const branchProducts = products.filter(p => p.local === branch.name);
    const lowStock = branchProducts.filter(p => p.status === 'low').length;
    const highStock = branchProducts.filter(p => p.status === 'high').length;
    const avgDemanda = branchProducts.reduce((sum, p) => sum + (p.demandaMedia || 0), 0) / (branchProducts.length || 1);

    return {
      ...branch,
      totalProducts: branchProducts.length,
      lowStock,
      highStock,
      avgDemanda,
    };
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "low": return "destructive";
      case "high": return "warning";
      default: return "success";
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8 space-y-8 animate-in fade-in duration-500">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Filiais / Locais</h1>
          <p className="text-muted-foreground">
            Gestão de estoque e capacidade por localização - {branches.length} locais ativos
          </p>
        </div>

        <BranchesOverview />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {branchStats.map((branch) => (
            <Card key={branch.name} className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-lg">{branch.name}</h3>
                  <Badge variant={getStatusColor(branch.status) as any} className="mt-1">
                    {branch.status === 'low' ? 'Baixo' : branch.status === 'high' ? 'Alto' : 'Normal'}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">SKUs</span>
                  </div>
                  <span className="font-semibold text-foreground">{branch.totalProducts}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Demanda Média</span>
                  </div>
                  <span className="font-semibold text-foreground">{branch.avgDemanda.toFixed(1)}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-destructive" />
                    <span className="text-sm text-muted-foreground">Estoque Baixo</span>
                  </div>
                  <span className="font-semibold text-destructive">{branch.lowStock}</span>
                </div>

                {branch.highStock > 0 && (
                  <div className="flex items-center justify-between p-3 bg-warning/10 rounded-lg border border-warning/20">
                    <span className="text-sm text-muted-foreground">Estoque Alto</span>
                    <span className="font-semibold text-warning">{branch.highStock}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Capacidade</span>
                  <span className="font-medium text-foreground">
                    {branch.stock.toLocaleString()} / {branch.capacity.toLocaleString()}
                  </span>
                </div>
                <div className="mt-2 text-xs text-muted-foreground text-right">
                  {((branch.stock / branch.capacity) * 100).toFixed(1)}% utilizado
                </div>
              </div>
            </Card>
          ))}
        </div>

        <TransferSuggestions />
      </div>
    </DashboardLayout>
  );
};

export default Filiais;
