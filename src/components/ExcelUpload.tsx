import { useState, useRef } from "react";
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { parseExcelFile, Product, BranchConfig, Movement } from "@/lib/excelParser";

interface ExcelUploadProps {
  onDataImported: (data: {
    products?: Product[];
    branches?: BranchConfig[];
    movements?: Movement[];
  }) => void;
}

export const ExcelUpload = ({ onDataImported }: ExcelUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const excelFile = files.find(
      (file) =>
        file.name.endsWith('.xlsx') ||
        file.name.endsWith('.xls') ||
        file.name.endsWith('.csv')
    );

    if (excelFile) {
      await processFile(excelFile);
    } else {
      toast({
        title: "Formato inválido",
        description: "Por favor, envie um arquivo Excel (.xlsx, .xls ou .csv)",
        variant: "destructive",
      });
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setUploadStatus('idle');

    try {
      const data = await parseExcelFile(file);
      
      if (!data.products && !data.branches && !data.movements) {
        throw new Error('Nenhuma aba reconhecida encontrada (Produtos, Filiais, Movimentação)');
      }

      onDataImported(data);
      setUploadStatus('success');
      
      const imported = [];
      if (data.products) imported.push(`${data.products.length} produtos`);
      if (data.branches) imported.push(`${data.branches.length} filiais`);
      if (data.movements) imported.push(`${data.movements.length} movimentações`);

      toast({
        title: "Importação concluída!",
        description: `Dados importados: ${imported.join(', ')}`,
      });
    } catch (error) {
      setUploadStatus('error');
      toast({
        title: "Erro na importação",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="p-8">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">Importar Dados do Excel</h3>
        <p className="text-sm text-muted-foreground">
          Faça upload de um arquivo Excel com as abas: <strong>Produtos</strong>, <strong>Filiais</strong> e/ou <strong>Movimentação</strong>
        </p>
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-12 text-center transition-all duration-200
          ${isDragging ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-border'}
          ${uploadStatus === 'success' ? 'border-success bg-success/5' : ''}
          ${uploadStatus === 'error' ? 'border-destructive bg-destructive/5' : ''}
        `}
      >
        {isProcessing ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <p className="text-sm font-medium text-muted-foreground">Processando arquivo...</p>
          </div>
        ) : uploadStatus === 'success' ? (
          <div className="flex flex-col items-center gap-4">
            <CheckCircle className="h-12 w-12 text-success" />
            <p className="text-sm font-medium text-success">Dados importados com sucesso!</p>
          </div>
        ) : uploadStatus === 'error' ? (
          <div className="flex flex-col items-center gap-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <p className="text-sm font-medium text-destructive">Erro ao processar arquivo</p>
          </div>
        ) : (
          <>
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full bg-muted">
                <FileSpreadsheet className="h-8 w-8 text-primary" />
              </div>
            </div>
            <p className="text-base font-medium text-foreground mb-2">
              Arraste seu arquivo Excel aqui
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              ou clique para selecionar
            </p>
          </>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileSelect}
          className="hidden"
        />

        {!isProcessing && (
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            className="mt-4"
          >
            <Upload className="h-4 w-4 mr-2" />
            Selecionar Arquivo
          </Button>
        )}
      </div>

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <p className="text-xs font-semibold text-foreground mb-2">Formato esperado:</p>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• <strong>Aba "Produtos":</strong> Colunas: Nome, SKU, Estoque, Mínimo, Máximo</li>
          <li>• <strong>Aba "Filiais":</strong> Colunas: Nome, Estoque, Capacidade</li>
          <li>• <strong>Aba "Movimentação":</strong> Colunas: Data, Produto, Quantidade, Tipo, Filial</li>
        </ul>
      </div>
    </Card>
  );
};
