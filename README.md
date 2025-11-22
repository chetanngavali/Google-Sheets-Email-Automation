# Google Sheets Email Automation

A powerful automation system that monitors Google Sheets for new entries and automatically sends personalized emails with PDF attachments using Hostinger SMTP.

<img width="1918" height="796" alt="Google Sheets Email Automation" src="https://github.com/user-attachments/assets/29d83f80-8b0e-4f25-94c5-1cd72794d08d" />


## Features

- 📊 **Google Sheets Integration** - Real-time monitoring of spreadsheet changes
- 📧 **Personalized Email Sending** - Custom email templates with dynamic content
- 📄 **PDF Generation** - Automatic PDF creation with personalized data
- 🔒 **Hostinger SMTP Support** - Secure email delivery through Hostinger
- 🎨 **Modern Dashboard** - Beautiful, responsive interface with dark/light themes
- 📈 **Real-time Monitoring** - Live activity logs and status tracking
- ⚙️ **Easy Configuration** - Simple setup through web interface

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Up Google Sheets API**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google Sheets API
   - Create service account credentials
   - Download the JSON key file

3. **Configure Environment Variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your Google API credentials

4. **Start the Application**
   ```bash
   # Start the frontend
   npm run dev

   # Start the backend (in another terminal)
   npm run server
   ```

5. **Configure Through Dashboard**
   - Open the application in your browser
   - Go to Configuration tab
   - Enter your Google Sheets ID and Hostinger SMTP details
   - Set up your email and PDF templates
   - Click "Start Automation"

## Configuration

### Google Sheets Setup
- **Spreadsheet ID**: Found in your Google Sheets URL
- **Sheet Name**: The specific sheet tab to monitor (default: "Sheet1")

### Hostinger SMTP Settings
- **Host**: smtp.hostinger.com
- **Port**: 587 (recommended) or 465
- **Username**: Your Hostinger email address
- **Password**: Your email password

### Email Templates
Use these placeholders in your templates:
- `{{name}}` - Name from the sheet
- `{{email}}` - Email address from the sheet
- `{{details}}` - All other data from the row
- Any column header from your sheet (e.g., `{{phone}}`, `{{company}}`)

## Expected Sheet Format

Your Google Sheet should have headers in the first row, including at minimum:
- **name** - Recipient's name
- **email** - Recipient's email address
- Any other columns you want to include in the personalization

Example:
| name | email | phone | company |
|------|-------|-------|---------|
| John Doe | john@example.com | 123-456-7890 | Acme Corp |

## Security Notes

- Keep your Google API credentials secure
- Use environment variables for sensitive data
- Consider using app-specific passwords for email accounts
- Regularly rotate your API keys and passwords

## Troubleshooting

### Common Issues

1. **Google Sheets Access Denied**
   - Ensure your service account has access to the spreadsheet
   - Share the sheet with your service account email

2. **SMTP Authentication Failed**
   - Verify your Hostinger email credentials
   - Try using an app-specific password
   - Check if 2FA is enabled on your account

3. **PDF Generation Issues**
   - Check if your PDF template has valid syntax
   - Ensure all required data is present in the sheet

## Support

For issues and questions:
1. Check the activity logs in the dashboard
2. Verify your configuration settings
3. Test connections using the "Test Connection" button

## License

MIT License - feel free to use this for your projects!
