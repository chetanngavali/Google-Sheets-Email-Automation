export function createAutomationService({ sheetsService, emailService, pdfService, config }) {
  let isRunning = false;
  let stopWatching = null;
  let startTime = null;
  let processedCount = 0;
  
  return {
    async start() {
      if (isRunning) {
        throw new Error('Automation is already running');
      }
      
      isRunning = true;
      startTime = new Date();
      
      console.log('🚀 Starting automation service...');
      
      // Start watching for changes
      stopWatching = await sheetsService.watchForChanges(async (newEntries) => {
        console.log(`📝 Found ${newEntries.length} new entries`);
        
        for (const entry of newEntries) {
          try {
            await this.processEntry(entry);
            processedCount++;
          } catch (error) {
            console.error(`❌ Failed to process entry:`, error);
          }
        }
      });
      
      console.log('✅ Automation service started successfully');
    },
    
    async stop() {
      if (!isRunning) {
        return;
      }
      
      isRunning = false;
      
      if (stopWatching) {
        stopWatching();
        stopWatching = null;
      }
      
      console.log('🛑 Automation service stopped');
    },
    
    async processEntry(entry) {
      console.log(`📧 Processing entry for: ${entry.name || entry.email || 'Unknown'}`);
      
      try {
        // Generate PDF
        const pdfBuffer = await pdfService.generatePDF(entry, config.pdfTemplate);
        console.log('📄 PDF generated successfully');
        
        // Send email with PDF attachment
        const emailResult = await emailService.sendEmail(entry, pdfBuffer);
        console.log(`✅ Email sent successfully to ${emailResult.recipient}`);
        
        return {
          success: true,
          entry,
          emailResult
        };
      } catch (error) {
        console.error(`❌ Failed to process entry:`, error);
        throw error;
      }
    },
    
    getStatus() {
      return {
        isRunning,
        startTime,
        processedCount,
        uptime: startTime ? Date.now() - startTime.getTime() : 0
      };
    },
    
    getUptime() {
      return startTime ? Date.now() - startTime.getTime() : 0;
    }
  };
}