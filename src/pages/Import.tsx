import { DashboardLayout } from "@/components/DashboardLayout";
import { SmartExcelUpload } from "@/components/SmartExcelUpload";
import { AutoImportButton } from "@/components/AutoImportButton";
import { useNavigate } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Settings, Upload } from "lucide-react";
import { toast } from "sonner";

const Import = () => {
  const navigate = useNavigate();
  const { setProducts, setBranches, setMovements } = useData();

  const handleDataImported = (data: any) => {
    if (data.products) {
      setProducts(data.products);
      toast.success(`${data.products.length} produtos importados!`);
    }
    if (data.branches) {
      setBranches(data.branches);
      toast.success(`${data.branches.length} filiais importadas!`);
    }
    if (data.movements) {
      setMovements(data.movements);
      toast.success(`${data.movements.length} movimentações importadas!`);
    }

    // Redirecionar para o dashboard após 1 segundo
    setTimeout(() => {
      navigate("/");
    }, 1000);
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
            <AutoImportButton />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Ou</span>
              </div>
            </div>
            
            <SmartExcelUpload onDataImported={handleDataImported} />

            <Card className="p-6 bg-muted/50">
              <h4 className="font-semibold text-foreground mb-3">✨ Estrutura da Sua Planilha</h4>
              <p className="text-sm text-muted-foreground mb-3">
                O sistema reconhece automaticamente os campos da sua planilha BLW:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-muted-foreground">
                <div>• SKU, Produto</div>
                <div>• Família, Classe, Subclasse</div>
                <div>• Cor, Tamanho</div>
                <div>• Local, Cidade</div>
                <div>• Demanda Média/Std</div>
                <div>• CV Demanda, Volatilidade</div>
                <div>• Estoque Segurança</div>
                <div>• Estoque Min/Max Sugerido</div>
                <div>• Ponto Pedido</div>
                <div>• Qtd Pedido Sugerida</div>
              </div>
            </Card>
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
