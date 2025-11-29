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

      // Delete existing data first
      console.log('Limpando dados existentes...');
      const { error: deleteError } = await supabase
        .from('monthly_sales')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (deleteError) {
        console.error('Erro ao limpar dados:', deleteError);
        throw new Error('Erro ao limpar dados antigos');
      }

      // Insert new data in batches
      console.log(`Inserindo ${sales.length} registros em lotes...`);
      const batchSize = 1000;
      for (let i = 0; i < sales.length; i += batchSize) {
        const batch = sales.slice(i, i + batchSize);
        console.log(`Inserindo lote ${Math.floor(i/batchSize) + 1} de ${Math.ceil(sales.length/batchSize)}`);
        
        const { error } = await supabase
          .from('monthly_sales')
          .insert(batch);

        if (error) {
          if (error.code === '42501') {
            toast.error('Você precisa de permissões de administrador para importar dados. Acesse /admin-setup');
            throw error;
          }
          if (error.code === '23505') {
            toast.error('Dados duplicados detectados. Tente limpar o banco antes de importar.');
            throw error;
          }
          console.error('Erro ao inserir lote:', error);
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
    return productStats.filter(p => 
      (p.estoque_atual || 0) < (p.estoque_minimo || 0)
    ).length;
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
