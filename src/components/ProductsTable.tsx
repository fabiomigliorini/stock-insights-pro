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

const products = [
  { id: 1, name: "Camiseta Básica Branca", sku: "CAM-001", stock: 45, min: 50, max: 200, status: "low" },
  { id: 2, name: "Calça Jeans Slim", sku: "CAL-002", stock: 120, min: 30, max: 150, status: "ok" },
  { id: 3, name: "Tênis Esportivo", sku: "TEN-003", stock: 85, min: 40, max: 100, status: "high" },
  { id: 4, name: "Vestido Floral", sku: "VES-004", stock: 65, min: 30, max: 80, status: "ok" },
  { id: 5, name: "Jaqueta Jeans", sku: "JAQ-005", stock: 25, min: 40, max: 120, status: "low" },
];

export const ProductsTable = () => {
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
