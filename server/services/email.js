import nodemailer from 'nodemailer';

export function createEmailService(config) {
  const transporter = nodemailer.createTransporter({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpPort === 465,
    auth: {
      user: config.smtpUser,
      pass: config.smtpPass,
    },
    tls: {
      rejectUnauthorized: false
    }
  });
  
  return {
    async testConnection() {
      try {
        await transporter.verify();
        return { success: true, message: 'SMTP connection verified' };
      } catch (error) {
        throw new Error(`SMTP connection failed: ${error.message}`);
      }
    },
    
    async sendEmail(entry, pdfBuffer) {
      try {
        // Personalize email content
        const personalizedSubject = this.personalizeTemplate(config.emailSubject, entry);
        const personalizedBody = this.personalizeTemplate(config.emailTemplate, entry);
        
        const mailOptions = {
          from: config.smtpUser,
          to: entry.email,
          subject: personalizedSubject,
          text: personalizedBody,
          html: personalizedBody.replace(/\n/g, '<br>'),
          attachments: [
            {
              filename: `document_${entry.name || 'user'}.pdf`,
              content: pdfBuffer,
              contentType: 'application/pdf'
            }
          ]
        };
        
        const result = await transporter.sendMail(mailOptions);
        
        return {
          success: true,
          messageId: result.messageId,
          recipient: entry.email
        };
      } catch (error) {
        throw new Error(`Failed to send email: ${error.message}`);
      }
    },
    
    personalizeTemplate(template, data) {
      let personalized = template;
      
      // Replace placeholders with actual data
      Object.keys(data).forEach(key => {
        const placeholder = new RegExp(`{{${key}}}`, 'g');
        personalized = personalized.replace(placeholder, data[key] || '');
      });
      
      // Handle special placeholders
      personalized = personalized.replace(/{{details}}/g, 
        Object.entries(data)
          .filter(([key]) => !['email', 'name'].includes(key))
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n')
      );
      
      return personalized;
    }
  };
}