import * as XLSX from 'xlsx';

export const analyzeExcelStructure = async (file: File) => {
  return new Promise<any>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });

        const analysis: any = {
          sheetNames: workbook.SheetNames,
          sheets: {},
        };

        workbook.SheetNames.forEach((sheetName) => {
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
          
          analysis.sheets[sheetName] = {
            rowCount: jsonData.length,
            columnCount: jsonData[0] ? (jsonData[0] as any[]).length : 0,
            headers: jsonData[0] || [],
            sampleData: jsonData.slice(0, 10), // Primeiras 10 linhas
            allData: XLSX.utils.sheet_to_json(sheet), // Dados completos como objetos
          };
        });

        resolve(analysis);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsBinaryString(file);
  });
};
