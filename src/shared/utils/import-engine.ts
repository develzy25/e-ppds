import * as xlsx from 'xlsx';
import { z } from 'zod';

export interface ImportResult<T> {
  data: T[];
  errors: { row: number; error: string }[];
  validCount: number;
  errorCount: number;
}

export class ImportEngine {
  /**
   * Parse an uploaded file (Excel/CSV) into JSON
   */
  static async parseFile(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = xlsx.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = xlsx.utils.sheet_to_json(worksheet, { defval: null });
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Validate parsed JSON data against a Zod schema
   */
  static validateData<T>(data: any[], schema: z.ZodSchema<T>): ImportResult<T> {
    const validData: T[] = [];
    const errors: { row: number; error: string }[] = [];

    data.forEach((row, index) => {
      const rowNum = index + 2; // Assuming row 1 is header
      const result = schema.safeParse(row);
      
      if (result.success) {
        validData.push(result.data);
      } else {
        const errorMessages = result.error.issues.map((err: any) => `${err.path.join('.')}: ${err.message}`).join(', ');
        errors.push({ row: rowNum, error: errorMessages });
      }
    });

    return {
      data: validData,
      errors,
      validCount: validData.length,
      errorCount: errors.length
    };
  }

  /**
   * Parse a JSON file directly
   */
  static async parseJSONFile(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const result = e.target?.result as string;
          const parsed = JSON.parse(result);
          resolve(Array.isArray(parsed) ? parsed : [parsed]);
        } catch (error) {
          reject(new Error("Format JSON tidak valid"));
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  }
}
