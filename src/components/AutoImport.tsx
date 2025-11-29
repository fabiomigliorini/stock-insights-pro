import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { parseExcelFile } from "@/lib/excelParser";
import { dataStore } from "@/lib/dataStore";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export const AutoImport = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const loadFile = async () => {
      try {
        const response = await fetch('/data/sample.xlsx');
        const blob = await response.blob();
        const file = new File([blob], 'sample.xlsx', { 
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        });

        const data = await parseExcelFile(file);
        
        if (data.products) {
          dataStore.setProducts(data.products);
        }
        if (data.branches) {
          dataStore.setBranches(data.branches);
        }
        if (data.movements) {
          dataStore.setMovements(data.movements);
        }

        const imported = [];
        if (data.products) imported.push(`${data.products.length} produtos`);
        if (data.branches) imported.push(`${data.branches.length} filiais`);
        if (data.movements) imported.push(`${data.movements.length} movimentações`);

        setStatus('success');
        toast({
          title: "Importação concluída!",
          description: `Dados importados: ${imported.join(', ')}`,
        });

        setTimeout(() => {
          navigate('/');
        }, 2000);
      } catch (error) {
        setStatus('error');
        toast({
          title: "Erro na importação",
          description: (error as Error).message,
          variant: "destructive",
        });
      }
    };

    loadFile();
  }, [navigate, toast]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-4">
        {status === 'loading' && (
          <>
            <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
            <p className="text-lg font-medium text-foreground">Processando arquivo Excel...</p>
          </>
        )}
        {status === 'success' && (
          <p className="text-lg font-medium text-success">Dados importados com sucesso!</p>
        )}
        {status === 'error' && (
          <p className="text-lg font-medium text-destructive">Erro ao processar arquivo</p>
        )}
      </div>
    </div>
  );
};
