import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useData } from "@/contexts/DataContext";
import { Building2 } from "lucide-react";

export const BranchesOverview = () => {
  const { branches, products } = useData();
  
  // Calculate stats for each branch
  const branchStats = branches.map(branch => {
    const branchProducts = products.filter(p => p.local === branch.local);
    const totalStock = branchProducts.reduce((sum, p) => sum + (p.stock || 0), 0);
    const lowStockCount = branchProducts.filter(p => p.status === 'low').length;
    
    return {
      ...branch,
      totalStock,
      lowStockCount,
      productCount: branchProducts.length,
    };
  });

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Visão Geral por Local</h3>
        <p className="text-sm text-muted-foreground">Resumo de estoque por localização</p>
      </div>
      <div className="space-y-4">
        {branchStats.map((branch) => (
          <div key={`${branch.local}-${branch.cidade}`} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded">
                <Building2 className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">{branch.local}</p>
                {branch.cidade && (
                  <p className="text-xs text-muted-foreground">{branch.cidade}</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">{branch.productCount} produtos</p>
              {branch.lowStockCount > 0 && (
                <Badge variant="destructive" className="mt-1">
                  {branch.lowStockCount} baixo estoque
                </Badge>
              )}
            </div>
          </div>
        ))}
        {branches.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhum local cadastrado. Importe dados para visualizar.
          </p>
        )}
      </div>
    </Card>
  );
};
