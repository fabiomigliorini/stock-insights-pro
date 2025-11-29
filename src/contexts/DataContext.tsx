import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Product, BranchConfig, Movement } from "@/lib/excelParser";

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

  // Persistir no localStorage
  useEffect(() => {
    const saved = localStorage.getItem('giro-certo-data');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.products) setProductsState(data.products);
        if (data.branches) setBranchesState(data.branches);
        if (data.movements) setMovementsState(data.movements);
      } catch (e) {
        console.error('Erro ao carregar dados salvos:', e);
      }
    }
  }, []);

  const setProducts = (newProducts: Product[]) => {
    setProductsState(newProducts);
    saveToLocalStorage(newProducts, branches, movements);
  };

  const setBranches = (newBranches: BranchConfig[]) => {
    setBranchesState(newBranches);
    saveToLocalStorage(products, newBranches, movements);
  };

  const setMovements = (newMovements: Movement[]) => {
    setMovementsState(newMovements);
    saveToLocalStorage(products, branches, newMovements);
  };

  const clear = () => {
    setProductsState([]);
    setBranchesState([]);
    setMovementsState([]);
    localStorage.removeItem('giro-certo-data');
  };

  const saveToLocalStorage = (p: Product[], b: BranchConfig[], m: Movement[]) => {
    localStorage.setItem('giro-certo-data', JSON.stringify({
      products: p,
      branches: b,
      movements: m,
    }));
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
