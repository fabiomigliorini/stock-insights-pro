import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MonthlySale, ProductStats } from "@/lib/importHistoricalData";
import { ProductDisplay, adaptProductStats } from "@/lib/productAdapter";
import { toast } from "sonner";

interface DataContextType {
  monthlySales: MonthlySale[];
  productStats: ProductStats[];
  products: ProductDisplay[]; // Compatibility layer
  branches: Array<{ local: string; cidade: string }>;
  setMonthlySales: (sales: MonthlySale[]) => void;
  refreshProductStats: () => Promise<void>;
  clear: () => void;
  getTotalStock: () => number;
  getLowStockCount: () => number;
  isLoading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [monthlySales, setMonthlySalesState] = useState<MonthlySale[]>([]);
  const [productStats, setProductStats] = useState<ProductStats[]>([]);
  const [products, setProducts] = useState<ProductDisplay[]>([]); // Compatibility
  const [branches, setBranches] = useState<Array<{ local: string; cidade: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFromDatabase();
  }, []);

  const loadFromDatabase = async () => {
    try {
      setIsLoading(true);

      // Load monthly sales
      const { data: salesData, error: salesError } = await supabase
        .from('monthly_sales')
        .select('*');

      if (salesError) throw salesError;

      if (salesData && salesData.length > 0) {
        setMonthlySalesState(salesData as MonthlySale[]);
      }

      // Load product stats from view
      await refreshProductStats();

      // Load branches
      const { data: branchesData, error: branchesError } = await supabase
        .from('branches')
        .select('local, cidade');

      if (branchesError) throw branchesError;

      if (branchesData) {
        setBranches(branchesData);
      }

    } catch (error) {
      console.error('Error loading from database:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProductStats = async () => {
    try {
      const { data, error } = await supabase
        .from('product_stats')
        .select('*');

      if (error) throw error;

      if (data) {
        setProductStats(data as ProductStats[]);
        // Update compatibility layer
        setProducts(adaptProductStats(data as ProductStats[]));
      }
    } catch (error) {
      console.error('Error loading product stats:', error);
    }
  };

  const setMonthlySales = async (sales: MonthlySale[]) => {
    try {
      setIsLoading(true);

      // Remove duplicates within the data (keep last occurrence)
      const uniqueSales = Array.from(
        sales.reduce((map, sale) => {
          const key = `${sale.ano}-${sale.mes}-${sale.sku}-${sale.local}`;
          map.set(key, sale);
          return map;
        }, new Map<string, MonthlySale>()).values()
      );

      console.log(`✅ ${sales.length} registros detectados, ${uniqueSales.length} únicos após remoção de duplicatas`);

      // Upsert data in batches
      const batchSize = 500;
      for (let i = 0; i < uniqueSales.length; i += batchSize) {
        const batch = uniqueSales.slice(i, i + batchSize);
        console.log(`Processando lote ${Math.floor(i/batchSize) + 1} de ${Math.ceil(uniqueSales.length/batchSize)}`);
        
        const { error } = await supabase
          .from('monthly_sales')
          .upsert(batch, {
            onConflict: 'ano,mes,sku,local',
            ignoreDuplicates: false
          });

        if (error) {
          if (error.code === '42501') {
            toast.error('Você precisa de permissões de administrador para importar dados. Acesse /admin-setup');
            throw error;
          }
          console.error('Erro ao inserir lote:', error);
          toast.error(`Erro ao processar lote ${Math.floor(i/batchSize) + 1}: ${error.message}`);
          throw error;
        }
      }

      // Extract unique branches
      const uniqueBranches = Array.from(
        new Map(
          sales.map(s => [`${s.local}-${s.cidade}`, { local: s.local, cidade: s.cidade || '' }])
        ).values()
      );

      // Delete existing branches
      await supabase.from('branches').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      // Insert branches
      const { error: branchError } = await supabase
        .from('branches')
        .insert(uniqueBranches);

      if (branchError && !branchError.message.includes('duplicate')) {
        console.error('Error inserting branches:', branchError);
      }

      setMonthlySalesState(sales);
      setBranches(uniqueBranches);
      
      // Refresh product stats after data load
      await refreshProductStats();

      toast.success('Dados importados com sucesso');

    } catch (error: any) {
      console.error('Error saving to database:', error);
      if (error?.code !== '42501') {
        toast.error('Erro ao salvar dados no banco');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const clear = async () => {
    try {
      await supabase.from('monthly_sales').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('branches').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      setMonthlySalesState([]);
      setProductStats([]);
      setBranches([]);

      toast.success('Dados limpos');
    } catch (error) {
      console.error('Error clearing database:', error);
      toast.error('Erro ao limpar dados');
    }
  };

  const getTotalStock = () => {
    return productStats.reduce((sum, p) => sum + (p.estoque_atual || 0), 0);
  };

  const getLowStockCount = () => {
    // Nova modelagem não tem estoque mínimo, usar 50% da demanda média como referência
    return productStats.filter(p => {
      const stock = p.estoque_atual || 0;
      const demandaMedia = p.demanda_media || 0;
      const minEstimado = demandaMedia * 0.5;
      return stock < minEstimado;
    }).length;
  };

  return (
    <DataContext.Provider
      value={{
        monthlySales,
        productStats,
        products, // Compatibility layer
        branches,
        setMonthlySales,
        refreshProductStats,
        clear,
        getTotalStock,
        getLowStockCount,
        isLoading,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
