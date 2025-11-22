import { google } from 'googleapis';

export function createSheetsService(config) {
  let lastProcessedRow = 0;
  
  // Initialize Google Sheets API
  const auth = new google.auth.GoogleAuth({
    // You'll need to set up service account credentials
    // For now, we'll use a placeholder structure
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  
  return {
    async testConnection() {
      try {
        // Test by getting sheet metadata
        const response = await sheets.spreadsheets.get({
          spreadsheetId: config.spreadsheetId,
        });
        
        return {
          success: true,
          title: response.data.properties.title,
          sheets: response.data.sheets.map(sheet => sheet.properties.title)
        };
      } catch (error) {
        throw new Error(`Google Sheets connection failed: ${error.message}`);
      }
    },
    
    async getNewEntries() {
      try {
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId: config.spreadsheetId,
          range: `${config.sheetName}!A:Z`,
        });
        
        const rows = response.data.values || [];
        const newRows = rows.slice(lastProcessedRow + 1);
        
        if (newRows.length > 0) {
          lastProcessedRow = rows.length - 1;
          
          // Convert rows to objects using first row as headers
          const headers = rows[0] || [];
          return newRows.map(row => {
            const entry = {};
            headers.forEach((header, index) => {
              entry[header.toLowerCase()] = row[index] || '';
            });
            return entry;
          });
        }
        
        return [];
      } catch (error) {
        throw new Error(`Failed to fetch new entries: ${error.message}`);
      }
    },
    
    async watchForChanges(callback) {
      // Poll for changes every 30 seconds
      const interval = setInterval(async () => {
        try {
          const newEntries = await this.getNewEntries();
          if (newEntries.length > 0) {
            callback(newEntries);
          }
        } catch (error) {
          console.error('Error checking for new entries:', error);
        }
      }, 30000);
      
      return () => clearInterval(interval);
    }
  };
}