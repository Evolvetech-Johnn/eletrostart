import { importExportService } from './importExport.service';

export class GoogleSheetsService {
  /**
   * Fetches CSV data from a published Google Sheet and parses it.
   * To use this, the user must "Publish to Web" as CSV, or use the export URL format:
   * https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/export?format=csv
   */
  async syncFromPublicSheet(sheetUrl: string) {
    try {
      // Basic validation of URL
      if (!sheetUrl.includes('google.com/spreadsheets')) {
        throw new Error('URL inválida do Google Sheets');
      }

      // If it's a standard edit URL, try to convert to export URL
      let exportUrl = sheetUrl;
      const match = sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (match && match[1]) {
        const spreadsheetId = match[1];
        exportUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv`;
      }

      const response = await fetch(exportUrl);
      if (!response.ok) {
        throw new Error(`Falha ao baixar planilha: ${response.statusText}`);
      }

      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      return await importExportService.parseImportFile(buffer, 'text/csv');
    } catch (error: any) {
      console.error('Error syncing from Google Sheets:', error);
      throw new Error(`Erro na sincronização: ${error.message}`);
    }
  }
}

export const googleSheetsService = new GoogleSheetsService();
