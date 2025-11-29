import { useEffect, useState } from "react";
import { importPredictionData } from "@/lib/importPredictionData";
import { Loader2 } from "lucide-react";

export const AutoLoadData = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      await importPredictionData();
      setLoading(false);
    };

    loadData();
  }, []);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-card p-8 rounded-lg shadow-lg flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-foreground font-medium">Carregando dados iniciais...</p>
      </div>
    </div>
  );
};
