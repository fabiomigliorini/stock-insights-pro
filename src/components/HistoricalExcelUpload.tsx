import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { parseHistoricalExcel } from "@/lib/parseHistoricalExcel";
import { MonthlySale } from "@/lib/importHistoricalData";

interface HistoricalExcelUploadProps {
  onDataImported: (data: MonthlySale[]) => void;
}

export const HistoricalExcelUpload = ({ onDataImported }: HistoricalExcelUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recordCount, setRecordCount] = useState(0);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      const data = await parseHistoricalExcel(file);
      
      if (data.length === 0) {
        throw new Error('Nenhum dado encontrado no arquivo');
      }

      console.log(`✅ ${data.length} registros mensais detectados`);
      
      setRecordCount(data.length);
      setSuccess(true);
      onDataImported(data);
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
              <p className="text-sm text-muted-foreground">
                {recordCount.toLocaleString('pt-BR')} registros mensais processados
              </p>
            </>
          ) : error ? (
            <>
              <AlertCircle className="h-12 w-12 text-destructive" />
              <p className="text-foreground font-medium">Erro ao processar</p>
              <p className="text-sm text-destructive">{error}</p>
            </>
          ) : (
            <>
              <FileSpreadsheet className="h-12 w-12 text-primary" />
              <div>
                <p className="text-foreground font-medium mb-2">
                  {isDragActive ? 'Solte o arquivo aqui' : 'Arraste um arquivo Excel ou clique para selecionar'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Aceita arquivos .xlsx e .xls com dados históricos mensais
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
