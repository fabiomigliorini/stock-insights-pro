import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";

const TestSheetNames = () => {
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [sheetData, setSheetData] = useState<any>({});

  useEffect(() => {
    const loadExcel = async () => {
      try {
        const response = await fetch("/data/modelo-predicao.xlsx");
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });

        setSheetNames(workbook.SheetNames);

        const data: any = {};
        workbook.SheetNames.forEach((name) => {
          const sheet = workbook.Sheets[name];
          const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
          data[name] = {
            headers: jsonData[0],
            rowCount: jsonData.length,
            sample: jsonData.slice(0, 3),
          };
        });
        setSheetData(data);
      } catch (error) {
        console.error("Erro:", error);
      }
    };

    loadExcel();
  }, []);

  return (
    <DashboardLayout>
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Análise da Planilha
          </h1>
          <p className="text-muted-foreground">
            Nomes das abas encontradas e seus dados
          </p>
        </div>

        <Card className="p-6">
          <h3 className="font-semibold text-foreground mb-4">
            Abas Encontradas: {sheetNames.length}
          </h3>
          <div className="space-y-4">
            {sheetNames.map((name) => (
              <div key={name} className="border-l-4 border-primary pl-4">
                <h4 className="font-medium text-foreground mb-2">
                  📋 Nome: "{name}"
                </h4>
                {sheetData[name] && (
                  <div className="space-y-2 text-sm">
                    <p className="text-muted-foreground">
                      Linhas: {sheetData[name].rowCount}
                    </p>
                    <div>
                      <p className="font-medium text-foreground mb-1">Colunas:</p>
                      <div className="flex flex-wrap gap-2">
                        {sheetData[name].headers &&
                          sheetData[name].headers.map((h: any, i: number) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-primary/10 text-primary rounded text-xs"
                            >
                              {h || `Col${i + 1}`}
                            </span>
                          ))}
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-foreground mb-1">
                        Amostra (3 linhas):
                      </p>
                      <pre className="text-xs bg-muted p-3 rounded overflow-auto">
                        {JSON.stringify(sheetData[name].sample, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TestSheetNames;
