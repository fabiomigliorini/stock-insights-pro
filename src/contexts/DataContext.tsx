import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Product, BranchConfig, Movement } from "@/lib/excelParser";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DataContextType {
  products: Product[];
  branches: BranchConfig[];
  movements: Movement[];
  setProducts: (products: Product[]) => void;
  setBranches: (branches: BranchConfig[]) => void;
  setMovements: (movements: Movement[]) => void;
  clear: () => void;
  getTotalStock: () => number;
  getLowStockCount: () => number;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProductsState] = useState<Product[]>([]);
  const [branches, setBranchesState] = useState<BranchConfig[]>([]);
  const [movements, setMovementsState] = useState<Movement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar dados do banco ao iniciar
  useEffect(() => {
    loadFromDatabase();
  }, []);

  const loadFromDatabase = async () => {
    try {
      setIsLoading(true);
      
      // Carregar produtos
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*');
      
      if (productsError) throw productsError;
      
      // Converter do formato do banco para o formato da aplicação
      const formattedProducts: Product[] = (productsData || []).map((p: any) => ({
        id: p.id,
        sku: p.sku,
        name: p.produto,
        category: p.classe || p.familia || 'Geral',
        stock: Number(p.stock) || 0,
        min: Number(p.estoque_min_sugerido) || 0,
        max: Number(p.estoque_max_sugerido) || 0,
        reorderPoint: Number(p.ponto_pedido) || 0,
        safetyStock: Number(p.estoque_seguranca) || 0,
        status: p.status || 'ok',
        filial: p.local,
        familia: p.familia || '',
        classe: p.classe || '',
        subclasse: p.subclasse || '',
        cor: p.cor || '',
        tamanho: p.tamanho || '',
        local: p.local,
        cidade: p.cidade || '',
        demandaMedia: Number(p.demanda_media) || 0,
        demandaStd: Number(p.demanda_std) || 0,
        cvDemanda: Number(p.cv_demanda) || 0,
        volatilidade: p.volatilidade || 'Baixa',
        estoqueSeguranca: Number(p.estoque_seguranca) || 0,
        estoqueMinSugerido: Number(p.estoque_min_sugerido) || 0,
        estoqueMaxSugerido: Number(p.estoque_max_sugerido) || 0,
        pontoPedido: Number(p.ponto_pedido) || 0,
        qtdPedidoSugerida: Number(p.qtd_pedido_sugerida) || 0
      }));
      
      setProductsState(formattedProducts);
      
      // Carregar filiais
      const { data: branchesData, error: branchesError } = await supabase
        .from('branches')
        .select('*');
      
      if (branchesError) throw branchesError;
      
      const formattedBranches: BranchConfig[] = (branchesData || []).map((b: any) => ({
        name: b.local,
        stock: 0,
        capacity: 1000,
        status: 'ok' as const
      }));
      
      setBranchesState(formattedBranches);
      
      // Carregar movimentações
      const { data: movementsData, error: movementsError } = await supabase
        .from('movements')
        .select('*');
      
      if (movementsError) throw movementsError;
      
      const formattedMovements: Movement[] = (movementsData || []).map((m: any) => ({
        date: m.date,
        product: m.product_sku,
        quantity: Number(m.quantity),
        type: (m.type === 'sale' || m.type === 'adjustment' ? 'saida' : 'entrada') as 'entrada' | 'saida',
        branch: m.from_location || m.to_location || ''
      }));
      
      setMovementsState(formattedMovements);
      
    } catch (error) {
      console.error('Erro ao carregar dados do banco:', error);
      toast.error('Erro ao carregar dados do banco');
    } finally {
      setIsLoading(false);
    }
  };

  const setProducts = async (newProducts: Product[]) => {
    try {
      setProductsState(newProducts);
      
      // Converter para formato do banco e salvar
      const dbProducts = newProducts.map(p => ({
        sku: p.sku,
        produto: p.name,
        familia: p.familia || p.category,
        classe: p.classe || p.category,
        subclasse: p.subclasse || '',
        cor: p.cor || '',
        tamanho: p.tamanho || '',
        local: p.filial || p.local || '',
        cidade: p.cidade || '',
        demanda_media: p.demandaMedia || 0,
        demanda_std: p.demandaStd || 0,
        cv_demanda: p.cvDemanda || 0,
        volatilidade: p.volatilidade || 'Baixa',
        estoque_seguranca: p.estoqueSeguranca || p.safetyStock || 0,
        estoque_min_sugerido: p.estoqueMinSugerido || p.min || 0,
        estoque_max_sugerido: p.estoqueMaxSugerido || p.max || 0,
        ponto_pedido: p.pontoPedido || p.reorderPoint || 0,
        qtd_pedido_sugerida: p.qtdPedidoSugerida || 0,
        stock: p.stock || 0,
        status: p.status || 'ok'
      }));
      
      // Limpar produtos existentes e inserir novos
      await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (dbProducts.length > 0) {
        const { error } = await supabase.from('products').insert(dbProducts);
        if (error) {
          if (error.code === '42501') {
            toast.error('Você precisa de permissões de administrador para importar dados. Acesse /admin-setup');
            throw error;
          }
          throw error;
        }
      }
      
      toast.success('Produtos salvos no banco');
    } catch (error: any) {
      console.error('Erro ao salvar produtos:', error);
      if (error?.code !== '42501') {
        toast.error('Erro ao salvar produtos no banco');
      }
    }
  };

  const setBranches = async (newBranches: BranchConfig[]) => {
    try {
      setBranchesState(newBranches);
      
      const dbBranches = newBranches.map(b => ({
        local: b.name,
        cidade: ''
      }));
      
      // Limpar filiais existentes e inserir novas
      await supabase.from('branches').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      if (dbBranches.length > 0) {
        const { error } = await supabase.from('branches').insert(dbBranches);
        if (error) {
          if (error.code === '42501') {
            toast.error('Você precisa de permissões de administrador para gerenciar filiais');
            throw error;
          }
          throw error;
        }
      }
      
      toast.success('Filiais salvas no banco');
    } catch (error: any) {
      console.error('Erro ao salvar filiais:', error);
      if (error?.code !== '42501') {
        toast.error('Erro ao salvar filiais no banco');
      }
    }
  };

  const setMovements = async (newMovements: Movement[]) => {
    try {
      setMovementsState(newMovements);
      
      const dbMovements = newMovements.map(m => ({
        product_sku: m.product,
        from_location: m.type === 'saida' ? m.branch : '',
        to_location: m.type === 'entrada' ? m.branch : '',
        quantity: m.quantity,
        date: m.date,
        type: m.type === 'saida' ? 'sale' : 'purchase',
        notes: ''
      }));
      
      if (dbMovements.length > 0) {
        const { error } = await supabase.from('movements').insert(dbMovements);
        if (error) throw error;
      }
      
      toast.success('Movimentações salvas no banco');
    } catch (error) {
      console.error('Erro ao salvar movimentações:', error);
      toast.error('Erro ao salvar movimentações no banco');
    }
  };

  const clear = async () => {
    try {
      await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('branches').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('movements').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      setProductsState([]);
      setBranchesState([]);
      setMovementsState([]);
      
      toast.success('Dados limpos do banco');
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
      toast.error('Erro ao limpar dados do banco');
    }
  };

  const getTotalStock = () => {
    return products.reduce((sum, p) => sum + p.stock, 0);
  };

  const getLowStockCount = () => {
    return products.filter(p => p.status === 'low').length;
  };

  return (
    <DataContext.Provider
      value={{
        products,
        branches,
        movements,
        setProducts,
        setBranches,
        setMovements,
        clear,
        getTotalStock,
        getLowStockCount,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
};
