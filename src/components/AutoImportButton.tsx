import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Database, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { importPredictionData } from "@/lib/importPredictionData";
import { useNavigate } from "react-router-dom";

export const AutoImportButton = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const navigate = useNavigate();

  const handleImport = async () => {
    setLoading(true);
    setResult(null);

    const importResult = await importPredictionData();
    setResult(importResult);
    setLoading(false);

    if (importResult.success) {
      setTimeout(() => {
        navigate("/");
      }, 2000);
    }
  };

  return (
    <Card className="p-6 border-2 border-primary/20">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-primary/10 rounded-lg">
          <Database className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Importação Rápida - Dados de Predição
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Carregue automaticamente os dados do arquivo Modelo_Predicao_Estoque.xlsx incluindo
            produtos, filiais e histórico de movimentações.
          </p>

          {result && (
            <div
              className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
                result.success
                  ? "bg-success/10 text-success"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              {result.success ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
              <span className="text-sm font-medium">{result.message}</span>
            </div>
          )}

          <Button onClick={handleImport} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Importando...
              </>
            ) : (
              <>
                <Database className="h-4 w-4 mr-2" />
                Importar Dados Agora
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};
