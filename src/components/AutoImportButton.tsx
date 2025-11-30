import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Database, Loader2, Sparkles } from "lucide-react";
import { importHistoricalData } from "@/lib/importHistoricalData";
import { generateMockData } from "@/lib/mockData";
import { useNavigate } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import { toast } from "sonner";

export const AutoImportButton = () => {
  const [loading, setLoading] = useState(false);
  const [loadingMock, setLoadingMock] = useState(false);
  const { setMonthlySales } = useData();
  const navigate = useNavigate();

  const handleImport = async () => {
    setLoading(true);

    const result = await importHistoricalData();
    
    if (result.success && result.data) {
      if (result.data.monthlySales) setMonthlySales(result.data.monthlySales);
      
      toast.success(`${result.data.monthlySales?.length || 0} registros mensais importados`);
      
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } else {
      toast.error(result.error || 'Erro ao carregar dados');
    }

    setLoading(false);
  };

  const handleLoadMockData = async () => {
    setLoadingMock(true);
    try {
      const mockData = generateMockData();
      await setMonthlySales(mockData);
      toast.success(`${mockData.length} registros de demonstração carregados!`);
      
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (error) {
      console.error("Erro ao carregar dados mocados:", error);
      toast.error("Erro ao carregar dados de demonstração");
    }
    setLoadingMock(false);
  };

  return (
    <div className="space-y-4">
      <Card className="p-6 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/20 rounded-lg">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Dados de Demonstração
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Carregue dados mocados realistas para explorar as funcionalidades do sistema.
              Inclui 24 meses de vendas, compras e estoque para múltiplos produtos e locais.
            </p>

            <Button onClick={handleLoadMockData} disabled={loadingMock || loading} size="lg">
              {loadingMock ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Gerando dados...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Carregar Dados de Demonstração
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6 border-2 border-muted">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-muted rounded-lg">
            <Database className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Importação Rápida - Dados Históricos
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Carregue automaticamente os dados históricos de vendas e estoque (2023-2025) com
              informações mensais de todos os produtos e locais.
            </p>

            <Button onClick={handleImport} disabled={loading || loadingMock} variant="outline">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4 mr-2" />
                  Importar Dados Históricos
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
