import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Database, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { importPredictionData } from "@/lib/importPredictionData";
import { useData } from "@/contexts/DataContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const AutoImportButton = () => {
  const [loading, setLoading] = useState(false);
  const { setProducts, setBranches, setMovements } = useData();
  const navigate = useNavigate();

  const handleImport = async () => {
    setLoading(true);

    const importResult = await importPredictionData();
    
    if (importResult.success && importResult.data) {
      if (importResult.data.products) {
        setProducts(importResult.data.products);
        toast.success(`${importResult.data.products.length} produtos importados!`);
      }
      if (importResult.data.branches) {
        setBranches(importResult.data.branches);
        toast.success(`${importResult.data.branches.length} filiais importadas!`);
      }
      if (importResult.data.movements) {
        setMovements(importResult.data.movements);
        toast.success(`${importResult.data.movements.length} movimentações importadas!`);
      }

      setTimeout(() => {
        navigate("/");
      }, 1000);
    } else {
      toast.error(importResult.message);
    }

    setLoading(false);
  };

  return (
    <Card className="p-6 border-2 border-primary/20">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-primary/10 rounded-lg">
          <Database className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Importação Rápida - Dados de Exemplo
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Carregue automaticamente os dados de exemplo (Modelo_Predicao_Estoque.xlsx) com
            produtos, filiais, configurações de estoque e histórico de movimentações.
          </p>

          <Button onClick={handleImport} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Importando...
              </>
            ) : (
              <>
                <Database className="h-4 w-4 mr-2" />
                Importar Dados de Exemplo
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};
