import { DashboardLayout } from "@/components/DashboardLayout";
import { KPICard } from "@/components/KPICard";
import { StockChart } from "@/components/StockChart";
import { BranchesOverview } from "@/components/BranchesOverview";
import { TransferSuggestions } from "@/components/TransferSuggestions";
import { ProductsTable } from "@/components/ProductsTable";
import { Package, TrendingDown, DollarSign, AlertTriangle } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { useAutoLoad } from "@/hooks/useAutoLoad";

const Index = () => {
  useAutoLoad(); // Carrega dados automaticamente se estiver vazio
  const { products, getTotalStock } = useData();
  
  // KPIs calculados
  const totalStock = getTotalStock();
  const produtosAtivos = products.length;
  const precisamReposicao = products.filter(p => p.stock < (p.pontoPedido || p.reorderPoint)).length;
  const criticos = products.filter(p => 
    p.volatilidade?.toLowerCase() === 'alta' && p.status === 'low'
  ).length;
  const lowStockCount = products.filter(p => p.status === 'low').length;
  
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
            title="Produtos Ativos"
            value={produtosAtivos.toLocaleString('pt-BR')}
            change={`${products.filter(p => p.status === 'ok').length} em níveis normais`}
            changeType="positive"
            icon={Package}
            iconColor="text-primary"
          />
          <KPICard
            title="Precisam Reposição"
            value={precisamReposicao.toLocaleString('pt-BR')}
            change="Abaixo do ponto de pedido"
            changeType={precisamReposicao > 0 ? "negative" : "positive"}
            icon={AlertTriangle}
            iconColor="text-warning"
          />
          <KPICard
            title="Críticos"
            value={criticos.toLocaleString('pt-BR')}
            change="Alta volatilidade + estoque baixo"
            changeType={criticos > 0 ? "negative" : "positive"}
            icon={TrendingDown}
            iconColor="text-destructive"
          />
          <KPICard
            title="Estoque Total"
            value={totalStock.toLocaleString('pt-BR')}
            change={`${lowStockCount} abaixo do mínimo`}
            changeType={lowStockCount > 0 ? "negative" : "positive"}
            icon={DollarSign}
            iconColor="text-success"
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
