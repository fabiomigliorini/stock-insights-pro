import { DashboardLayout } from "@/components/DashboardLayout";
import { StockChart } from "@/components/StockChart";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Calendar } from "lucide-react";

const Predicoes = () => {
  return (
    <DashboardLayout>
      <div className="p-8 space-y-8 animate-in fade-in duration-500">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Predições de Vendas</h1>
          <p className="text-muted-foreground">
            Previsões baseadas em histórico, tendências e sazonalidade
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-5 w-5 text-success" />
              <h3 className="font-semibold text-foreground">Próximo Mês</h3>
            </div>
            <p className="text-2xl font-bold text-foreground">+12.5%</p>
            <p className="text-sm text-muted-foreground">Crescimento previsto</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-foreground">Próximo Trimestre</h3>
            </div>
            <p className="text-2xl font-bold text-foreground">8.456</p>
            <p className="text-sm text-muted-foreground">Unidades estimadas</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingDown className="h-5 w-5 text-warning" />
              <h3 className="font-semibold text-foreground">Confiança</h3>
            </div>
            <p className="text-2xl font-bold text-foreground">87%</p>
            <p className="text-sm text-muted-foreground">Índice de precisão</p>
          </Card>
        </div>

        <StockChart />

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Fatores de Influência</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-foreground font-medium">Tendências de Moda</span>
              <span className="text-success font-semibold">+18% impacto</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-foreground font-medium">Sazonalidade</span>
              <span className="text-primary font-semibold">+12% impacto</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-foreground font-medium">Indicadores Econômicos</span>
              <span className="text-warning font-semibold">-5% impacto</span>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Predicoes;
