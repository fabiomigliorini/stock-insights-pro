import { DashboardLayout } from "@/components/DashboardLayout";
import { ProductsTable } from "@/components/ProductsTable";

const Produtos = () => {
  return (
    <DashboardLayout>
      <div className="p-8 space-y-8 animate-in fade-in duration-500">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Produtos</h1>
          <p className="text-muted-foreground">
            Gestão completa do catálogo de produtos e níveis de estoque
          </p>
        </div>

        <ProductsTable />
      </div>
    </DashboardLayout>
  );
};

export default Produtos;
