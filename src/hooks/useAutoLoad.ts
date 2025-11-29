import { useEffect, useState } from "react";
import { useData } from "@/contexts/DataContext";
import { importPredictionData } from "@/lib/importPredictionData";

export const useAutoLoad = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { products, setProducts, setBranches, setMovements } = useData();

  useEffect(() => {
    // Se já tem produtos, não carrega novamente
    if (products.length > 0) return;

    const loadData = async () => {
      setIsLoading(true);
      const result = await importPredictionData();
      
      if (result.success && result.data) {
        if (result.data.products) setProducts(result.data.products);
        if (result.data.branches) setBranches(result.data.branches);
        if (result.data.movements) setMovements(result.data.movements);
      }
      
      setIsLoading(false);
    };

    loadData();
  }, []);

  return { isLoading };
};
