import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createSheetsService } from './services/sheets.js';
import { createEmailService } from './services/email.js';
import { createPDFService } from './services/pdf.js';
import { createAutomationService } from './services/automation.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Services
let automationService = null;

// Routes
app.post('/api/automation/toggle', async (req, res) => {
  try {
    const { active, config } = req.body;
    
    if (active) {
      // Initialize services
      const sheetsService = createSheetsService(config);
      const emailService = createEmailService(config);
      const pdfService = createPDFService();
      
      // Create and start automation
      automationService = createAutomationService({
        sheetsService,
        emailService,
        pdfService,
        config
      });
      
      await automationService.start();
      
      res.json({ 
        success: true, 
        message: 'Automation started successfully',
        status: 'active'
      });
    } else {
      // Stop automation
      if (automationService) {
        await automationService.stop();
        automationService = null;
      }
      
      res.json({ 
        success: true, 
        message: 'Automation stopped successfully',
        status: 'inactive'
      });
    }
  } catch (error) {
    console.error('Toggle automation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to toggle automation',
      error: error.message 
    });
  }
});

app.get('/api/automation/status', (req, res) => {
  res.json({
    isActive: automationService !== null,
    status: automationService ? 'active' : 'inactive',
    uptime: automationService ? automationService.getUptime() : 0
  });
});

app.post('/api/test/connection', async (req, res) => {
  try {
    const { config } = req.body;
    
    // Test Google Sheets connection
    const sheetsService = createSheetsService(config);
    await sheetsService.testConnection();
    
    // Test SMTP connection
    const emailService = createEmailService(config);
    await emailService.testConnection();
    
    res.json({ 
      success: true, 
      message: 'All connections successful',
      tests: {
        sheets: 'Connected',
        smtp: 'Connected'
      }
    });
  } catch (error) {
    console.error('Connection test error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Connection test failed',
      error: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});