import Papa from "papaparse";
import ExcelJS from "exceljs";

export type ParsedData = {
  headers: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
  fileName: string;
  fileType: "csv" | "excel";
};

export function parseCSV(text: string, fileName: string): ParsedData {
  const result = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
  });

  const headers = result.meta.fields ?? [];
  const rows = result.data as Record<string, unknown>[];

  return {
    headers,
    rows,
    rowCount: rows.length,
    fileName,
    fileType: "csv",
  };
}

export async function parseExcel(buffer: ArrayBuffer, fileName: string): Promise<ParsedData> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const worksheet = workbook.worksheets[0];
  if (!worksheet) throw new Error("No worksheets found in this file.");

  const headers: string[] = [];
  const rows: Record<string, unknown>[] = [];

  worksheet.eachRow((row, rowIndex) => {
    if (rowIndex === 1) {
      // First row = headers
      row.eachCell((cell) => {
        headers.push(String(cell.value ?? ""));
      });
    } else {
      const rowObj: Record<string, unknown> = {};
      row.eachCell({ includeEmpty: true }, (cell, colIndex) => {
        const header = headers[colIndex - 1] ?? `col_${colIndex}`;
        // Unwrap ExcelJS rich text / formula objects to plain values
        const val = cell.value;
        if (val && typeof val === "object" && "result" in val) {
          rowObj[header] = (val as { result: unknown }).result; // formula cell
        } else if (val && typeof val === "object" && "richText" in val) {
          rowObj[header] = (val as { richText: { text: string }[] }).richText
            .map((r) => r.text)
            .join(""); // rich text cell
        } else {
          rowObj[header] = val;
        }
      });
      rows.push(rowObj);
    }
  });

  return {
    headers,
    rows,
    rowCount: rows.length,
    fileName,
    fileType: "excel",
  };
}

export async function parseFile(file: File): Promise<ParsedData> {
  const fileName = file.name;
  const ext = fileName.split(".").pop()?.toLowerCase();

  if (ext === "csv") {
    const text = await file.text();
    return parseCSV(text, fileName);
  }

  if (ext === "xlsx" || ext === "xls") {
    const buffer = await file.arrayBuffer();
    return parseExcel(buffer, fileName);
  }

  throw new Error(`Unsupported file type: .${ext}. Please upload a CSV or Excel file.`);
}