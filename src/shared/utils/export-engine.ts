import * as xlsx from 'xlsx';

export interface ExportOptions {
  fileName?: string;
  sheetName?: string;
}

export class ExportEngine {
  /**
   * Export array of objects to CSV
   */
  static downloadCSV<T extends Record<string, any>>(data: T[], options?: ExportOptions) {
    if (!data || data.length === 0) return;
    const worksheet = xlsx.utils.json_to_sheet(data);
    const csv = xlsx.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    this.triggerDownload(url, `${options?.fileName || 'export'}.csv`);
  }

  /**
   * Export array of objects to Excel (.xlsx)
   */
  static downloadExcel<T extends Record<string, any>>(data: T[], options?: ExportOptions) {
    if (!data || data.length === 0) return;
    const worksheet = xlsx.utils.json_to_sheet(data);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, options?.sheetName || 'Data');
    xlsx.writeFile(workbook, `${options?.fileName || 'export'}.xlsx`);
  }

  /**
   * Export array of objects to JSON
   */
  static downloadJSON<T extends Record<string, any>>(data: T[], options?: ExportOptions) {
    if (!data || data.length === 0) return;
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    this.triggerDownload(url, `${options?.fileName || 'export'}.json`);
  }

  /**
   * Copy to Clipboard as TSV (Tab Separated Values) for easy pasting into Excel/Sheets
   */
  static async copyToClipboard<T extends Record<string, any>>(data: T[]): Promise<boolean> {
    if (!data || data.length === 0) return false;
    try {
      const worksheet = xlsx.utils.json_to_sheet(data);
      const csv = xlsx.utils.sheet_to_csv(worksheet, { FS: '\t' }); // TSV format
      await navigator.clipboard.writeText(csv);
      return true;
    } catch (error) {
      console.error('Clipboard write failed', error);
      return false;
    }
  }

  /**
   * Universal trigger download helper
   */
  private static triggerDownload(url: string, fileName: string) {
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
