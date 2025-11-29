import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const branches = [
  { name: "Filial Centro", stock: 850, capacity: 1000, status: "ok" },
  { name: "Filial Norte", stock: 320, capacity: 1000, status: "low" },
  { name: "Filial Sul", stock: 950, capacity: 1000, status: "high" },
  { name: "Filial Oeste", stock: 680, capacity: 1000, status: "ok" },
];

export const BranchesOverview = () => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "low":
        return "destructive";
      case "high":
        return "warning";
      default:
        return "success";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "low":
        return "Baixo";
      case "high":
        return "Alto";
      default:
        return "Normal";
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Estoque por Filial</h3>
        <p className="text-sm text-muted-foreground">Ocupação atual vs. capacidade</p>
      </div>
      <div className="space-y-5">
        {branches.map((branch) => (
          <div key={branch.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">{branch.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {branch.stock} / {branch.capacity}
                </span>
                <Badge variant={getStatusColor(branch.status) as any}>
                  {getStatusLabel(branch.status)}
                </Badge>
              </div>
            </div>
            <Progress value={(branch.stock / branch.capacity) * 100} className="h-2" />
          </div>
        ))}
      </div>
    </Card>
  );
};
