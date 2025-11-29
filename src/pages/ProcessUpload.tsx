import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function ProcessUpload() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processando arquivo Excel...');
  const [details, setDetails] = useState<string[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const processFile = async () => {
      try {
        // Simular processamento do arquivo
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const response = await fetch('/data/sample.xlsx');
        const blob = await response.blob();
        
        // Importar dinamicamente a biblioteca XLSX
        const XLSX = await import('xlsx');
        
        const arrayBuffer = await blob.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        
        const sheetNames = workbook.SheetNames;
        const importedData: string[] = [];
        
        sheetNames.forEach(sheetName => {
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet);
          importedData.push(`Aba "${sheetName}": ${jsonData.length} linhas`);
        });
        
        setDetails(importedData);
        setStatus('success');
        setMessage('Arquivo processado com sucesso!');
        
        toast({
          title: "Importação concluída!",
          description: `${importedData.length} aba(s) processada(s)`,
        });
      } catch (error) {
        console.error('Erro ao processar:', error);
        setStatus('error');
        setMessage('Erro ao processar o arquivo');
        setDetails([
          (error as Error).message || 'Erro desconhecido',
          'Verifique se o arquivo está no formato correto'
        ]);
        
        toast({
          title: "Erro na importação",
          description: "Não foi possível processar o arquivo",
          variant: "destructive",
        });
      }
    };

    processFile();
  }, [toast]);

  return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-8">
        <Card className="max-w-2xl w-full p-8">
          <div className="text-center space-y-6">
            {status === 'loading' && (
              <>
                <Loader2 className="h-16 w-16 text-primary animate-spin mx-auto" />
                <h2 className="text-2xl font-bold text-foreground">{message}</h2>
                <p className="text-muted-foreground">Analisando estrutura do arquivo...</p>
              </>
            )}
            
            {status === 'success' && (
              <>
                <CheckCircle className="h-16 w-16 text-success mx-auto" />
                <h2 className="text-2xl font-bold text-foreground">{message}</h2>
                <div className="space-y-2 text-left bg-muted p-4 rounded-lg">
                  <p className="font-semibold text-foreground mb-2">Dados encontrados:</p>
                  {details.map((detail, index) => (
                    <p key={index} className="text-sm text-muted-foreground">✓ {detail}</p>
                  ))}
                </div>
                <div className="flex gap-4 justify-center pt-4">
                  <Button onClick={() => navigate('/')}>
                    Ver Dashboard
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/import')}>
                    Importar Outro Arquivo
                  </Button>
                </div>
              </>
            )}
            
            {status === 'error' && (
              <>
                <AlertCircle className="h-16 w-16 text-destructive mx-auto" />
                <h2 className="text-2xl font-bold text-foreground">{message}</h2>
                <div className="space-y-2 text-left bg-destructive/10 p-4 rounded-lg border border-destructive/20">
                  {details.map((detail, index) => (
                    <p key={index} className="text-sm text-destructive">{detail}</p>
                  ))}
                </div>
                <div className="flex gap-4 justify-center pt-4">
                  <Button onClick={() => navigate('/import')}>
                    Tentar Novamente
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/')}>
                    Voltar ao Dashboard
                  </Button>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
