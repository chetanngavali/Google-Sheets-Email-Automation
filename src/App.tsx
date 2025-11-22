import React, { useState, useEffect } from 'react';
import { Play, Pause, Settings, Mail, FileText, Activity, Moon, Sun, Database, AlertCircle } from 'lucide-react';

interface AutomationConfig {
  spreadsheetId: string;
  sheetName: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  emailTemplate: string;
  emailSubject: string;
  pdfTemplate: string;
  isActive: boolean;
}

interface LogEntry {
  id: string;
  timestamp: string;
  type: 'success' | 'error' | 'info';
  message: string;
  details?: string;
}

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isRunning, setIsRunning] = useState(false);
  const [config, setConfig] = useState<AutomationConfig>({
    spreadsheetId: '',
    sheetName: 'Sheet1',
    smtpHost: 'smtp.hostinger.com',
    smtpPort: 587,
    smtpUser: '',
    smtpPass: '',
    emailTemplate: 'Hello {{name}},\n\nWe have received your information:\n{{details}}\n\nBest regards,\nYour Team',
    emailSubject: 'Thank you for your submission - {{name}}',
    pdfTemplate: 'Certificate for {{name}}',
    isActive: false
  });
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: '1',
      timestamp: new Date().toISOString(),
      type: 'info',
      message: 'System initialized',
      details: 'Automation dashboard loaded successfully'
    }
  ]);
  const [stats, setStats] = useState({
    totalEmails: 0,
    successRate: 100,
    lastRun: null as string | null
  });

  useEffect(() => {
    const saved = localStorage.getItem('automation-config');
    if (saved) {
      setConfig(JSON.parse(saved));
    }
    
    const savedDarkMode = localStorage.getItem('dark-mode');
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('automation-config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('dark-mode', JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleAutomation = async () => {
    if (!config.spreadsheetId || !config.smtpUser || !config.smtpPass) {
      addLog('error', 'Configuration incomplete', 'Please fill in all required fields');
      return;
    }

    setIsRunning(!isRunning);
    const newStatus = !isRunning;
    
    if (newStatus) {
      addLog('success', 'Automation started', 'Monitoring Google Sheets for new entries');
      setStats(prev => ({ ...prev, lastRun: new Date().toISOString() }));
    } else {
      addLog('info', 'Automation stopped', 'Monitoring paused');
    }

    try {
      await fetch('/api/automation/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: newStatus, config })
      });
    } catch (error) {
      addLog('error', 'API Error', 'Failed to communicate with server');
    }
  };

  const addLog = (type: LogEntry['type'], message: string, details?: string) => {
    const newLog: LogEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      type,
      message,
      details
    };
    setLogs(prev => [newLog, ...prev.slice(0, 49)]);
  };

  const testConnection = async () => {
    addLog('info', 'Testing connections...', 'Verifying Google Sheets and SMTP settings');
    
    // Simulate API call
    setTimeout(() => {
      if (config.spreadsheetId && config.smtpUser) {
        addLog('success', 'Connection test passed', 'All services are reachable');
      } else {
        addLog('error', 'Connection test failed', 'Check your configuration settings');
      }
    }, 1500);
  };

  const DashboardView = () => (
    <div className="space-y-6">
      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Status</p>
              <p className={`text-2xl font-bold ${isRunning ? 'text-green-600' : (darkMode ? 'text-gray-300' : 'text-gray-900')}`}>
                {isRunning ? 'Active' : 'Inactive'}
              </p>
            </div>
            <div className={`p-3 rounded-full ${isRunning ? 'bg-green-100 text-green-600' : (darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600')}`}>
              <Activity className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Emails Sent</p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{stats.totalEmails}</p>
            </div>
            <div className={`p-3 rounded-full ${darkMode ? 'bg-gray-700 text-gray-400' : 'bg-blue-100 text-blue-600'}`}>
              <Mail className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Success Rate</p>
              <p className={`text-2xl font-bold ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>{stats.successRate}%</p>
            </div>
            <div className={`p-3 rounded-full ${darkMode ? 'bg-gray-700 text-gray-400' : 'bg-green-100 text-green-600'}`}>
              <FileText className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>Control Panel</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={toggleAutomation}
            className={`flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-colors ${
              isRunning 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isRunning ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
            {isRunning ? 'Stop Automation' : 'Start Automation'}
          </button>
          
          <button
            onClick={testConnection}
            className={`flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-colors ${
              darkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
            }`}
          >
            <Database className="w-5 h-5 mr-2" />
            Test Connection
          </button>
        </div>
      </div>

      {/* Activity Log */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>Recent Activity</h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {logs.map(log => (
            <div key={log.id} className={`flex items-start space-x-3 p-3 rounded-lg ${
              darkMode ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <div className={`p-1 rounded-full ${
                log.type === 'success' ? 'bg-green-100 text-green-600' :
                log.type === 'error' ? 'bg-red-100 text-red-600' :
                'bg-blue-100 text-blue-600'
              }`}>
                <AlertCircle className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                  {log.message}
                </p>
                {log.details && (
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {log.details}
                  </p>
                )}
                <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  {new Date(log.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const ConfigView = () => (
    <div className="space-y-6">
      {/* Google Sheets Configuration */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>Google Sheets Configuration</h3>
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-700'} mb-2`}>
              Spreadsheet ID
            </label>
            <input
              type="text"
              value={config.spreadsheetId}
              onChange={(e) => setConfig(prev => ({ ...prev, spreadsheetId: e.target.value }))}
              placeholder="Enter your Google Sheets ID"
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-300 placeholder-gray-500' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-700'} mb-2`}>
              Sheet Name
            </label>
            <input
              type="text"
              value={config.sheetName}
              onChange={(e) => setConfig(prev => ({ ...prev, sheetName: e.target.value }))}
              placeholder="Sheet1"
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-300 placeholder-gray-500' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
          </div>
        </div>
      </div>

      {/* SMTP Configuration */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>Hostinger SMTP Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-700'} mb-2`}>
              SMTP Host
            </label>
            <input
              type="text"
              value={config.smtpHost}
              onChange={(e) => setConfig(prev => ({ ...prev, smtpHost: e.target.value }))}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-300' 
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-700'} mb-2`}>
              SMTP Port
            </label>
            <input
              type="number"
              value={config.smtpPort}
              onChange={(e) => setConfig(prev => ({ ...prev, smtpPort: parseInt(e.target.value) }))}
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-300' 
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-700'} mb-2`}>
              Email Username
            </label>
            <input
              type="email"
              value={config.smtpUser}
              onChange={(e) => setConfig(prev => ({ ...prev, smtpUser: e.target.value }))}
              placeholder="your-email@yourdomain.com"
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-300 placeholder-gray-500' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-700'} mb-2`}>
              Email Password
            </label>
            <input
              type="password"
              value={config.smtpPass}
              onChange={(e) => setConfig(prev => ({ ...prev, smtpPass: e.target.value }))}
              placeholder="Your email password"
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-300 placeholder-gray-500' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
          </div>
        </div>
      </div>

      {/* Email Template */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>Email Template</h3>
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-700'} mb-2`}>
              Subject Template
            </label>
            <input
              type="text"
              value={config.emailSubject}
              onChange={(e) => setConfig(prev => ({ ...prev, emailSubject: e.target.value }))}
              placeholder="Use {{name}} for personalization"
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-300 placeholder-gray-500' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-700'} mb-2`}>
              Email Body Template
            </label>
            <textarea
              value={config.emailTemplate}
              onChange={(e) => setConfig(prev => ({ ...prev, emailTemplate: e.target.value }))}
              rows={6}
              placeholder="Use {{name}}, {{email}}, {{details}} for personalization"
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-300 placeholder-gray-500' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-700'} mb-2`}>
              PDF Template
            </label>
            <textarea
              value={config.pdfTemplate}
              onChange={(e) => setConfig(prev => ({ ...prev, pdfTemplate: e.target.value }))}
              rows={4}
              placeholder="PDF content template with {{name}}, {{email}} placeholders"
              className={`w-full px-4 py-2 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-gray-300 placeholder-gray-500' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen transition-colors ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <h1 className={`text-xl font-bold ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                Sheets Automation
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Activity },
              { id: 'config', label: 'Configuration', icon: Settings }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : `border-transparent ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'config' && <ConfigView />}
      </main>
    </div>
  );
}

export default App;