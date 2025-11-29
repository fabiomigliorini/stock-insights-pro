import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const suggestions = [
  {
    id: 1,
    product: "Camiseta Básica Branca",
    from: "Filial Sul",
    to: "Filial Norte",
    quantity: 50,
    priority: "high",
  },
  {
    id: 2,
    product: "Calça Jeans Slim",
    from: "Filial Centro",
    to: "Filial Oeste",
    quantity: 30,
    priority: "medium",
  },
  {
    id: 3,
    product: "Tênis Esportivo",
    from: "Filial Sul",
    to: "Filial Norte",
    quantity: 25,
    priority: "high",
  },
];

export const TransferSuggestions = () => {
  return (
    <Card className="p-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="h-5 w-5 text-warning" />
          <h3 className="text-lg font-semibold text-foreground">Sugestões de Transferência</h3>
        </div>
        <p className="text-sm text-muted-foreground">Otimize o estoque entre filiais</p>
      </div>
      <div className="space-y-4">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className="p-4 rounded-lg border border-border hover:border-primary/50 transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <p className="font-medium text-foreground mb-1">{suggestion.product}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{suggestion.from}</span>
                  <ArrowRight className="h-4 w-4" />
                  <span>{suggestion.to}</span>
                </div>
              </div>
              <Badge variant={suggestion.priority === "high" ? "destructive" : "warning"}>
                {suggestion.priority === "high" ? "Alta" : "Média"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Quantidade: {suggestion.quantity} unidades
              </span>
              <Button size="sm" variant="outline">
                Aprovar
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
