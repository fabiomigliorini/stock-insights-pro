import { DashboardLayout } from "@/components/DashboardLayout";
import { KPICard } from "@/components/KPICard";
import { StockChart } from "@/components/StockChart";
import { BranchesOverview } from "@/components/BranchesOverview";
import { TransferSuggestions } from "@/components/TransferSuggestions";
import { ProductsTable } from "@/components/ProductsTable";
import { Package, TrendingDown, DollarSign, AlertTriangle } from "lucide-react";
import { dataStore } from "@/lib/dataStore";

const Index = () => {
  const totalStock = dataStore.getTotalStock();
  const lowStockCount = dataStore.getLowStockCount();
  
  return (
    <DashboardLayout>
      <div className="p-8 space-y-8 animate-in fade-in duration-500">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard de Estoque</h1>
          <p className="text-muted-foreground">
            Visão consolidada e predições inteligentes para gestão eficiente
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Estoque Total"
            value={totalStock.toLocaleString('pt-BR')}
            change="+5.2% vs. mês anterior"
            changeType="positive"
            icon={Package}
            iconColor="text-primary"
          />
          <KPICard
            title="Itens Abaixo do Mínimo"
            value={lowStockCount}
            change="Atenção necessária"
            changeType={lowStockCount > 0 ? "negative" : "positive"}
            icon={AlertTriangle}
            iconColor="text-destructive"
          />
          <KPICard
            title="Valor em Estoque"
            value="R$ 485K"
            change="+2.1% vs. mês anterior"
            changeType="positive"
            icon={DollarSign}
            iconColor="text-success"
          />
          <KPICard
            title="Giro de Estoque"
            value="3.4x"
            change="-0.3x vs. mês anterior"
            changeType="negative"
            icon={TrendingDown}
            iconColor="text-warning"
          />
        </div>

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StockChart />
          <BranchesOverview />
        </div>

        <TransferSuggestions />

        <ProductsTable />
      </div>
    </DashboardLayout>
  );
};

export default Index;
