import jsPDF from 'jspdf';

export function createPDFService() {
  return {
    async generatePDF(entry, template) {
      try {
        const doc = new jsPDF();
        
        // Personalize PDF content
        const personalizedContent = this.personalizeTemplate(template, entry);
        
        // Add title
        doc.setFontSize(20);
        doc.text('Document', 20, 30);
        
        // Add personalized content
        doc.setFontSize(12);
        const lines = personalizedContent.split('\n');
        let yPosition = 50;
        
        lines.forEach(line => {
          if (yPosition > 280) {
            doc.addPage();
            yPosition = 30;
          }
          doc.text(line, 20, yPosition);
          yPosition += 10;
        });
        
        // Add timestamp
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, yPosition + 20);
        
        // Return PDF as buffer
        return Buffer.from(doc.output('arraybuffer'));
      } catch (error) {
        throw new Error(`PDF generation failed: ${error.message}`);
      }
    },
    
    personalizeTemplate(template, data) {
      let personalized = template;
      
      // Replace placeholders with actual data
      Object.keys(data).forEach(key => {
        const placeholder = new RegExp(`{{${key}}}`, 'g');
        personalized = personalized.replace(placeholder, data[key] || '');
      });
      
      // Add all data as details if no specific template
      if (!template.includes('{{')) {
        personalized += '\n\nDetails:\n';
        Object.entries(data).forEach(([key, value]) => {
          personalized += `${key}: ${value}\n`;
        });
      }
      
      return personalized;
    }
  };
}