import { useEffect, useState } from "react";
import { useData } from "@/contexts/DataContext";
import { importHistoricalData } from "@/lib/importHistoricalData";

export const useAutoLoad = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { monthlySales, setMonthlySales } = useData();

  useEffect(() => {
    // Se já tem dados, não carrega novamente
    if (monthlySales.length > 0) return;

    const loadData = async () => {
      setIsLoading(true);
      const result = await importHistoricalData();
      
      if (result.success && result.data) {
        if (result.data.monthlySales) setMonthlySales(result.data.monthlySales);
      }
      
      setIsLoading(false);
    };

    loadData();
  }, []);

  return { isLoading };
};
