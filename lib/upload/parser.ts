import * as xlsx from "xlsx";
import Papa from "papaparse";

export type ParsedRow = Record<string, unknown>;

export async function parseExcel(buffer: Buffer): Promise<ParsedRow[]> {
    const workbook = xlsx.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    return xlsx.utils.sheet_to_json(sheet);
}

export async function parseCSV(text: string): Promise<ParsedRow[]> {
    return new Promise((resolve, reject) => {
        Papa.parse(text, {
            header: true,
            skipEmptyLines: true,
            complete: (results: Papa.ParseResult<unknown>) => {
                resolve(results.data as ParsedRow[]);
            },
            error: (error: Error) => reject(error),
        });
    });
}
