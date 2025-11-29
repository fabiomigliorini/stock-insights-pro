import { DashboardLayout } from "@/components/DashboardLayout";
import { BranchesOverview } from "@/components/BranchesOverview";
import { TransferSuggestions } from "@/components/TransferSuggestions";
import { Card } from "@/components/ui/card";
import { useData } from "@/contexts/DataContext";
import { Building2, Package, TrendingUp, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Filiais = () => {
  const { branches, products } = useData();

  // Calcular estatísticas por filial
  const branchStats = branches.map(branch => {
    const branchProducts = products.filter(p => p.local === branch.local);
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
            <Card key={`${branch.local}-${branch.cidade}`} className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-lg">{branch.local}</h3>
                  {branch.cidade && (
                    <p className="text-sm text-muted-foreground">{branch.cidade}</p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Total de Produtos</span>
                  </div>
                  <span className="font-semibold text-foreground">{branch.totalProducts}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <span className="text-sm text-muted-foreground">Estoque Baixo</span>
                  </div>
                  <Badge variant={branch.lowStock > 0 ? "destructive" : "success"}>
                    {branch.lowStock}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-warning" />
                    <span className="text-sm text-muted-foreground">Estoque Alto</span>
                  </div>
                  <Badge variant={branch.highStock > 0 ? "warning" : "success"}>
                    {branch.highStock}
                  </Badge>
                </div>

                <div className="pt-3 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Demanda Média</span>
                    <span className="font-semibold text-foreground">
                      {branch.avgDemanda.toFixed(1)} un/período
                    </span>
                  </div>
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
