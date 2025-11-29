import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useData } from "@/contexts/DataContext";

export const ProductsTable = () => {
  const { products } = useData();
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "low":
        return <Badge variant="destructive">Abaixo do Mín.</Badge>;
      case "high":
        return <Badge variant="warning">Acima do Máx.</Badge>;
      default:
        return <Badge variant="success">Normal</Badge>;
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Produtos em Estoque</h3>
        <p className="text-sm text-muted-foreground">Visão detalhada dos níveis de estoque</p>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className="text-right">Estoque</TableHead>
              <TableHead className="text-right">Mínimo</TableHead>
              <TableHead className="text-right">Máximo</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell className="text-muted-foreground">{product.sku}</TableCell>
                <TableCell className="text-right font-semibold">{product.stock}</TableCell>
                <TableCell className="text-right text-muted-foreground">{product.min}</TableCell>
                <TableCell className="text-right text-muted-foreground">{product.max}</TableCell>
                <TableCell className="text-center">{getStatusBadge(product.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};
