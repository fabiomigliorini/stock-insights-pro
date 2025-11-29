import { DashboardLayout } from "@/components/DashboardLayout";
import { SmartExcelUpload } from "@/components/SmartExcelUpload";
import { AutoImportButton } from "@/components/AutoImportButton";
import { useNavigate } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Upload, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { importHistoricalData } from "@/lib/importHistoricalData";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Import = () => {
  const navigate = useNavigate();
  const { setMonthlySales } = useData();

  const handleDataImported = async (data: any) => {
    // For now, support the auto-import button only
    toast.info("Use o botão de Importação Rápida para carregar dados históricos");
  };

  return (
    <DashboardLayout>
      <div className="p-8 space-y-8 animate-in fade-in duration-500">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Importar Dados</h1>
          <p className="text-muted-foreground">
            Carregue os dados históricos de vendas e estoque
          </p>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            O sistema foi atualizado para trabalhar com dados históricos mensais (2023-2025).
            Use o botão abaixo para carregar os dados.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full max-w-md">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <AutoImportButton />

            <Card className="p-6 bg-muted/50">
              <h4 className="font-semibold text-foreground mb-3">✨ Estrutura dos Dados Históricos</h4>
              <p className="text-sm text-muted-foreground mb-3">
                O sistema importa dados mensais com as seguintes informações:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-muted-foreground">
                <div>• Ano e Mês</div>
                <div>• SKU, Produto</div>
                <div>• Família, Classe, Subclasse</div>
                <div>• Cor, Tamanho</div>
                <div>• Local, Cidade</div>
                <div>• Estoque Início/Final</div>
                <div>• Quantidade Vendida</div>
                <div>• Quantidade Reposição</div>
                <div>• Estoque Mínimo/Máximo</div>
                <div>• Estoque Segurança</div>
                <div>• Ponto de Pedido</div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Import;
