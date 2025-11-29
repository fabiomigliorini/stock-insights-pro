import { useEffect, useState } from "react";
import { useData } from "@/contexts/DataContext";
import { importRealData } from "@/lib/importRealData";

export const useAutoLoad = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { products, setProducts, setBranches } = useData();

  useEffect(() => {
    // Se já tem produtos, não carrega novamente
    if (products.length > 0) return;

    const loadData = async () => {
      setIsLoading(true);
      const result = await importRealData();
      
      if (result.success && result.data) {
        if (result.data.products) setProducts(result.data.products);
        if (result.data.branches) setBranches(result.data.branches);
      }
      
      setIsLoading(false);
    };

    loadData();
  }, []);

  return { isLoading };
};
