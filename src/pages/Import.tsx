import { DashboardLayout } from "@/components/DashboardLayout";
import { ExcelUpload } from "@/components/ExcelUpload";
import { useNavigate } from "react-router-dom";
import { dataStore } from "@/lib/dataStore";
import { Product, BranchConfig, Movement } from "@/lib/excelParser";

const Import = () => {
  const navigate = useNavigate();

  const handleDataImported = (data: {
    products?: Product[];
    branches?: BranchConfig[];
    movements?: Movement[];
  }) => {
    if (data.products) {
      dataStore.setProducts(data.products);
    }
    if (data.branches) {
      dataStore.setBranches(data.branches);
    }
    if (data.movements) {
      dataStore.setMovements(data.movements);
    }

    // Redirecionar para o dashboard após 2 segundos
    setTimeout(() => {
      navigate("/");
    }, 2000);
  };

  return (
    <DashboardLayout>
      <div className="p-8 space-y-8 animate-in fade-in duration-500">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Importar Dados</h1>
          <p className="text-muted-foreground">
            Faça upload dos seus arquivos Excel para atualizar o sistema com dados reais
          </p>
        </div>

        <ExcelUpload onDataImported={handleDataImported} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-card rounded-lg border border-border">
            <h4 className="font-semibold text-foreground mb-2">📦 Produtos</h4>
            <p className="text-sm text-muted-foreground">
              Cadastro completo com SKU, níveis mínimos e máximos por produto
            </p>
          </div>

          <div className="p-6 bg-card rounded-lg border border-border">
            <h4 className="font-semibold text-foreground mb-2">🏢 Filiais</h4>
            <p className="text-sm text-muted-foreground">
              Configurações de capacidade e estoque atual de cada unidade
            </p>
          </div>

          <div className="p-6 bg-card rounded-lg border border-border">
            <h4 className="font-semibold text-foreground mb-2">📊 Movimentação</h4>
            <p className="text-sm text-muted-foreground">
              Histórico de entradas e saídas para análise e predição
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Import;
