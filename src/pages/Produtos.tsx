import { DashboardLayout } from "@/components/DashboardLayout";
import { useData } from "@/contexts/DataContext";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search } from "lucide-react";

const Produtos = () => {
  const { products } = useData();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.familia?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.local?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "low": return <Badge variant="destructive">Baixo</Badge>;
      case "high": return <Badge variant="warning">Alto</Badge>;
      default: return <Badge variant="success">Normal</Badge>;
    }
  };

  const getVolatilidadeBadge = (vol?: string) => {
    if (!vol) return null;
    switch (vol.toLowerCase()) {
      case "alta": return <Badge variant="destructive">Alta</Badge>;
      case "media": return <Badge variant="warning">Média</Badge>;
      case "baixa": return <Badge variant="success">Baixa</Badge>;
      default: return <Badge>{vol}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8 space-y-6 animate-in fade-in duration-500">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Produtos</h1>
          <p className="text-muted-foreground">
            Gestão completa do catálogo - {products.length} produtos cadastrados
          </p>
        </div>

        <Card className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por produto, SKU, família ou local..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>

        <Card className="p-6">
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Família</TableHead>
                  <TableHead>Classe</TableHead>
                  <TableHead>Cor</TableHead>
                  <TableHead>Tamanho</TableHead>
                  <TableHead>Local</TableHead>
                  <TableHead className="text-right">Demanda Média</TableHead>
                  <TableHead className="text-center">Volatilidade</TableHead>
                  <TableHead className="text-right">Estoque Seg.</TableHead>
                  <TableHead className="text-right">Mín. Sugerido</TableHead>
                  <TableHead className="text-right">Máx. Sugerido</TableHead>
                  <TableHead className="text-right">Ponto Pedido</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={14} className="text-center text-muted-foreground py-8">
                      Nenhum produto encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.slice(0, 100).map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-mono text-xs">{product.sku}</TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="text-sm">{product.familia}</TableCell>
                      <TableCell className="text-sm">{product.classe}</TableCell>
                      <TableCell className="text-sm">{product.cor}</TableCell>
                      <TableCell className="text-sm">{product.tamanho}</TableCell>
                      <TableCell className="font-medium text-sm">{product.local}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {product.demandaMedia?.toFixed(2) || '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        {getVolatilidadeBadge(product.volatilidade)}
                      </TableCell>
                      <TableCell className="text-right">{product.estoqueSeguranca || product.safetyStock}</TableCell>
                      <TableCell className="text-right">{product.estoqueMinSugerido || product.min}</TableCell>
                      <TableCell className="text-right">{product.estoqueMaxSugerido || product.max}</TableCell>
                      <TableCell className="text-right">{product.pontoPedido || product.reorderPoint}</TableCell>
                      <TableCell className="text-center">{getStatusBadge(product.status)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {filteredProducts.length > 100 && (
            <p className="text-sm text-muted-foreground text-center mt-4">
              Mostrando 100 de {filteredProducts.length} produtos. Use a busca para filtrar.
            </p>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Produtos;
