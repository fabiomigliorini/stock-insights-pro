import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { analyzeExcelStructure } from "@/lib/analyzeExcel";
import { dataStore } from "@/lib/dataStore";
import { Product, BranchConfig, Movement } from "@/lib/excelParser";

interface SmartExcelUploadProps {
  onDataImported: (data: any) => void;
}

export const SmartExcelUpload = ({ onDataImported }: SmartExcelUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);

  const processData = (analysis: any) => {
    const result: any = {};

    // Processar cada aba encontrada
    Object.keys(analysis.sheets).forEach((sheetName) => {
      const sheetData = analysis.sheets[sheetName].allData;
      
      console.log(`Processando aba: "${sheetName}"`, sheetData);

      // Detectar tipo de aba pelos dados
      if (sheetData.length > 0) {
        const firstRow = sheetData[0];
        const keys = Object.keys(firstRow);
        
        // Se tem SKU/Código/Produto -> são produtos
        if (keys.some(k => k.toLowerCase().includes('sku') || 
                          k.toLowerCase().includes('código') || 
                          k.toLowerCase().includes('codigo') ||
                          k.toLowerCase().includes('produto'))) {
          
          result.products = sheetData.map((row: any, index: number) => {
            // Encontrar valores pelos nomes de colunas reais
            const getVal = (possibleNames: string[]) => {
              for (const name of possibleNames) {
                for (const key of keys) {
                  if (key.toLowerCase().includes(name.toLowerCase())) {
                    return row[key];
                  }
                }
              }
              return null;
            };

            const stock = Number(getVal(['estoque atual', 'estoque', 'saldo']) || 0);
            const min = Number(getVal(['mínimo', 'minimo', 'min', 'estoque mínimo']) || 0);
            const max = Number(getVal(['máximo', 'maximo', 'max', 'estoque máximo']) || 100);
            
            let status: 'low' | 'ok' | 'high' = 'ok';
            if (stock < min) status = 'low';
            else if (stock > max) status = 'high';

            return {
              id: String(index + 1),
              sku: String(getVal(['sku', 'código', 'codigo']) || `SKU-${index + 1}`),
              name: String(getVal(['produto', 'descrição', 'descricao', 'nome', 'item']) || `Produto ${index + 1}`),
              category: String(getVal(['categoria', 'grupo', 'tipo']) || 'Geral'),
              stock,
              min,
              max,
              reorderPoint: Number(getVal(['ponto de reposição', 'ponto reposicao', 'reorder']) || min * 1.5),
              safetyStock: Number(getVal(['estoque de segurança', 'estoque seguranca', 'safety']) || min * 0.5),
              status,
              filial: String(getVal(['filial', 'loja', 'unidade']) || 'CD'),
            } as Product;
          });
        }
        
        // Se tem Filial/Loja e Capacidade -> são filiais
        else if (keys.some(k => k.toLowerCase().includes('filial') || k.toLowerCase().includes('loja')) &&
                 keys.some(k => k.toLowerCase().includes('capacidade'))) {
          
          result.branches = sheetData.map((row: any) => {
            const getVal = (possibleNames: string[]) => {
              for (const name of possibleNames) {
                for (const key of keys) {
                  if (key.toLowerCase().includes(name.toLowerCase())) {
                    return row[key];
                  }
                }
              }
              return null;
            };

            const stock = Number(getVal(['estoque', 'saldo', 'quantidade']) || 0);
            const capacity = Number(getVal(['capacidade', 'capacidade total']) || 1000);
            const percentage = capacity > 0 ? (stock / capacity) * 100 : 0;
            
            let status: 'low' | 'ok' | 'high' = 'ok';
            if (percentage < 40) status = 'low';
            else if (percentage > 85) status = 'high';

            return {
              name: String(getVal(['filial', 'nome', 'loja', 'unidade']) || 'Filial'),
              stock,
              capacity,
              status,
            } as BranchConfig;
          });
        }
        
        // Se tem Data/Quantidade/Tipo -> são movimentações
        else if (keys.some(k => k.toLowerCase().includes('data')) &&
                 keys.some(k => k.toLowerCase().includes('quantidade'))) {
          
          result.movements = sheetData.map((row: any) => {
            const getVal = (possibleNames: string[]) => {
              for (const name of possibleNames) {
                for (const key of keys) {
                  if (key.toLowerCase().includes(name.toLowerCase())) {
                    return row[key];
                  }
                }
              }
              return null;
            };

            return {
              date: getVal(['data', 'date']) || new Date().toISOString(),
              product: String(getVal(['produto', 'item', 'nome', 'sku']) || ''),
              quantity: Number(getVal(['quantidade', 'qtd', 'qty']) || 0),
              type: (String(getVal(['tipo', 'type', 'movimento']) || 'entrada').toLowerCase()) as 'entrada' | 'saida',
              branch: String(getVal(['filial', 'loja', 'unidade']) || 'CD'),
            } as Movement;
          });
        }
      }
    });

    return result;
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      const analyzed = await analyzeExcelStructure(file);
      setAnalysis(analyzed);
      
      console.log('Estrutura da planilha:', analyzed);
      
      const processedData = processData(analyzed);
      
      console.log('Dados processados:', processedData);
      
      if (processedData.products) {
        console.log(`✅ ${processedData.products.length} produtos detectados`);
      }
      if (processedData.branches) {
        console.log(`✅ ${processedData.branches.length} filiais detectadas`);
      }
      if (processedData.movements) {
        console.log(`✅ ${processedData.movements.length} movimentações detectadas`);
      }
      
      setSuccess(true);
      onDataImported(processedData);
    } catch (err) {
      console.error('Erro ao processar:', err);
      setError((err as Error).message || 'Erro ao processar arquivo');
    } finally {
      setUploading(false);
    }
  }, [onDataImported]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    maxFiles: 1,
  });

  return (
    <Card className="p-8">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all ${
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50 hover:bg-accent/5'
        }`}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center gap-4">
          {uploading ? (
            <>
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
              <p className="text-foreground font-medium">Processando arquivo...</p>
            </>
          ) : success ? (
            <>
              <CheckCircle2 className="h-12 w-12 text-success" />
              <p className="text-foreground font-medium">Arquivo importado com sucesso!</p>
              {analysis && (
                <div className="text-sm text-muted-foreground">
                  <p>Abas processadas: {analysis.sheetNames.join(', ')}</p>
                </div>
              )}
            </>
          ) : error ? (
            <>
              <AlertCircle className="h-12 w-12 text-destructive" />
              <p className="text-foreground font-medium">Erro ao processar</p>
              <p className="text-sm text-destructive">{error}</p>
              <Button variant="outline" onClick={(e) => { e.stopPropagation(); setError(null); }}>
                Tentar novamente
              </Button>
            </>
          ) : (
            <>
              <FileSpreadsheet className="h-12 w-12 text-primary" />
              <div>
                <p className="text-foreground font-medium mb-2">
                  {isDragActive ? 'Solte o arquivo aqui' : 'Arraste um arquivo Excel ou clique para selecionar'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Aceita arquivos .xlsx e .xls - Todas as colunas serão detectadas automaticamente
                </p>
              </div>
              <Upload className="h-6 w-6 text-muted-foreground" />
            </>
          )}
        </div>
      </div>
    </Card>
  );
};
