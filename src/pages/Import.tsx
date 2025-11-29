import { DashboardLayout } from "@/components/DashboardLayout";
import { ExcelUpload } from "@/components/ExcelUpload";
import { useNavigate } from "react-router-dom";
import { dataStore } from "@/lib/dataStore";
import { Product, BranchConfig, Movement } from "@/lib/excelParser";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Settings, Upload } from "lucide-react";

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
            Faça upload dos seus arquivos Excel e configure parâmetros de estoque
          </p>
        </div>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="avancado" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Avançado
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
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
          </TabsContent>

          <TabsContent value="avancado" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Configurações de Estoque
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Configure os parâmetros padrão para cálculo automático de níveis de estoque.
                Estes valores serão sugeridos durante a importação e podem ser ajustados por SKU.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="lead-time">Lead Time (dias)</Label>
                  <Input
                    id="lead-time"
                    type="number"
                    placeholder="7"
                    defaultValue="7"
                  />
                  <p className="text-xs text-muted-foreground">
                    Tempo médio de entrega do fornecedor
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="safety-factor">Fator de Segurança (%)</Label>
                  <Input
                    id="safety-factor"
                    type="number"
                    placeholder="20"
                    defaultValue="20"
                  />
                  <p className="text-xs text-muted-foreground">
                    Percentual adicional para estoque de segurança
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="service-level">Nível de Serviço (%)</Label>
                  <Input
                    id="service-level"
                    type="number"
                    placeholder="95"
                    defaultValue="95"
                  />
                  <p className="text-xs text-muted-foreground">
                    Meta de disponibilidade de produto
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="review-period">Período de Revisão (dias)</Label>
                  <Input
                    id="review-period"
                    type="number"
                    placeholder="30"
                    defaultValue="30"
                  />
                  <p className="text-xs text-muted-foreground">
                    Frequência de revisão dos níveis
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-medium text-foreground mb-2">Fórmulas Utilizadas:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <strong>Estoque Mínimo:</strong> (Demanda média × Lead Time) + Estoque de Segurança</li>
                  <li>• <strong>Estoque de Segurança:</strong> Demanda média × Lead Time × Fator de Segurança</li>
                  <li>• <strong>Ponto de Reposição:</strong> Estoque Mínimo + (Demanda média × Tempo de revisão)</li>
                  <li>• <strong>Estoque Máximo:</strong> Ponto de Reposição + (Demanda média × Período de revisão)</li>
                </ul>
              </div>

              <div className="mt-6 flex gap-3">
                <Button>
                  Salvar Configurações Padrão
                </Button>
                <Button variant="outline">
                  Aplicar em Todos os SKUs
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Mapeamento de Colunas
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Personalize como as colunas da planilha são mapeadas no sistema
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Coluna SKU</Label>
                  <Input placeholder="SKU" defaultValue="SKU" />
                </div>
                <div className="space-y-2">
                  <Label>Coluna Descrição</Label>
                  <Input placeholder="Descrição" defaultValue="Descrição" />
                </div>
                <div className="space-y-2">
                  <Label>Coluna Categoria</Label>
                  <Input placeholder="Categoria" defaultValue="Categoria" />
                </div>
                <div className="space-y-2">
                  <Label>Coluna Filial</Label>
                  <Input placeholder="Filial" defaultValue="Filial" />
                </div>
              </div>

              <Button variant="outline" className="mt-6">
                Restaurar Padrões
              </Button>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Import;
