import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { Card } from "@/components/ui/card";
import { DashboardLayout } from "@/components/DashboardLayout";

const AnalyzeData = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadExcel = async () => {
      try {
        const response = await fetch("/data/modelo-blw.xlsx");
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });

        const result: any = {
          sheets: workbook.SheetNames,
          data: {},
        };

        workbook.SheetNames.forEach((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          result.data[sheetName] = {
            rows: jsonData.length,
            columns: jsonData[0] ? (jsonData[0] as any[]).length : 0,
            headers: jsonData[0],
            sample: jsonData.slice(0, 5),
          };
        });

        setData(result);
        setLoading(false);
      } catch (error) {
        console.error("Erro ao carregar Excel:", error);
        setLoading(false);
      }
    };

    loadExcel();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <p>Carregando dados...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!data) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <p>Erro ao carregar dados</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Análise da Planilha BLW
          </h1>
          <p className="text-muted-foreground">
            Estrutura de dados encontrada no arquivo
          </p>
        </div>

        <div className="space-y-6">
          {data.sheets.map((sheetName: string) => (
            <Card key={sheetName} className="p-6">
              <h3 className="text-xl font-semibold text-foreground mb-4">
                Aba: {sheetName}
              </h3>
              <div className="space-y-2 mb-4">
                <p className="text-sm text-muted-foreground">
                  Linhas: {data.data[sheetName].rows}
                </p>
                <p className="text-sm text-muted-foreground">
                  Colunas: {data.data[sheetName].columns}
                </p>
              </div>

              {data.data[sheetName].headers && (
                <div>
                  <h4 className="font-medium text-foreground mb-2">
                    Colunas encontradas:
                  </h4>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(data.data[sheetName].headers as string[]).map(
                      (header: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-md"
                        >
                          {header || `Coluna ${idx + 1}`}
                        </span>
                      )
                    )}
                  </div>

                  <h4 className="font-medium text-foreground mb-2">
                    Amostra de dados (primeiras 5 linhas):
                  </h4>
                  <div className="overflow-x-auto">
                    <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto">
                      {JSON.stringify(data.data[sheetName].sample, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AnalyzeData;
