import { useEffect, useState } from "react";
import { useData } from "@/contexts/DataContext";
import { generateLocalData } from "@/lib/mockData";

export const useAutoLoad = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { monthlySales, setMonthlySales, isLoading: contextLoading } = useData();

  useEffect(() => {
    // Aguarda o contexto carregar primeiro
    if (contextLoading) return;
    
    // Se já tem dados, não carrega novamente
    if (monthlySales.length > 0) return;

    const loadLocalData = async () => {
      setIsLoading(true);
      console.log("📊 Nenhum dado encontrado. Gerando base local para visualização...");
      
      const localData = generateLocalData();
      await setMonthlySales(localData);
      
      console.log("✅ Base de dados local carregada automaticamente");
      setIsLoading(false);
    };

    loadLocalData();
  }, [contextLoading, monthlySales.length]);

  return { isLoading: isLoading || contextLoading };
};
