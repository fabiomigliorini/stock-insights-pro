import { DashboardLayout } from "@/components/DashboardLayout";
import { KPICard } from "@/components/KPICard";
import { StockChart } from "@/components/StockChart";
import { BranchesOverview } from "@/components/BranchesOverview";
import { Package, TrendingDown, DollarSign, AlertTriangle } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { useAutoLoad } from "@/hooks/useAutoLoad";

const Index = () => {
  useAutoLoad();
  const { products } = useData();
  
  // KPIs baseados APENAS nos dados reais da planilha
  const produtosAtivos = products.length;
  const altaVolatilidade = products.filter(p => p.volatilidade?.toLowerCase() === 'alta').length;
  const mediaVolatilidade = products.filter(p => p.volatilidade?.toLowerCase() === 'media').length;
  const baixaVolatilidade = products.filter(p => p.volatilidade?.toLowerCase() === 'baixa').length;
  const demandaTotal = products.reduce((sum, p) => sum + (p.demandaMedia || 0), 0);
  
  return (
    <DashboardLayout>
      <div className="p-8 space-y-8 animate-in fade-in duration-500">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard - Parâmetros de Estoque</h1>
          <p className="text-muted-foreground">
            Análise de demanda e parâmetros sugeridos de estoque
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Produtos Cadastrados"
            value={produtosAtivos.toLocaleString('pt-BR')}
            change="SKUs + Locais únicos"
            changeType="positive"
            icon={Package}
            iconColor="text-primary"
          />
          <KPICard
            title="Demanda Total Média"
            value={demandaTotal.toFixed(0)}
            change="unidades por período"
            changeType="positive"
            icon={TrendingDown}
            iconColor="text-success"
          />
          <KPICard
            title="Alta Volatilidade"
            value={altaVolatilidade.toLocaleString('pt-BR')}
            change={`${((altaVolatilidade/produtosAtivos)*100).toFixed(1)}% do total`}
            changeType={altaVolatilidade > 0 ? "negative" : "positive"}
            icon={AlertTriangle}
            iconColor="text-destructive"
          />
          <KPICard
            title="Média/Baixa Volatilidade"
            value={(mediaVolatilidade + baixaVolatilidade).toLocaleString('pt-BR')}
            change={`${((mediaVolatilidade/produtosAtivos)*100).toFixed(1)}% média | ${((baixaVolatilidade/produtosAtivos)*100).toFixed(1)}% baixa`}
            changeType="positive"
            icon={DollarSign}
            iconColor="text-primary"
          />
        </div>

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StockChart />
          <BranchesOverview />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
