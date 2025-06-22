import React from 'react';
import ConnectionTest from '../components/ConnectionTest';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';

const SettingsPage = () => {
  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-8">
        <span className="text-2xl">⚙️</span>
        <h1 className="m-0 text-2xl font-bold text-gray-900">Settings</h1>
      </div>
      <Card className="mb-6 shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Connection Test</CardTitle>
        </CardHeader>
        <CardContent>
          <ConnectionTest />
        </CardContent>
      </Card>
      <Card className="mb-6 shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="mb-2 text-blue-600 text-base font-semibold">Prometheus Connection</h4>
              <p className="mb-1 text-gray-600 text-sm"><strong>URL:</strong> {process.env.REACT_APP_PROMETHEUS_URL || 'http://localhost:9090'}</p>
              <p className="mb-1 text-gray-600 text-sm"><strong>Proxy:</strong> Configured in package.json</p>
            </div>
            <div>
              <h4 className="mb-2 text-blue-600 text-base font-semibold">Application Info</h4>
              <p className="mb-1 text-gray-600 text-sm"><strong>Version:</strong> 1.0.0</p>
              <p className="mb-1 text-gray-600 text-sm"><strong>Environment:</strong> {process.env.NODE_ENV}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Help & Support</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="mb-2 text-blue-600 text-base font-semibold">Troubleshooting</h4>
              <ul className="list-disc pl-5 text-gray-600 text-sm mb-0">
                <li>Check Prometheus is running and accessible</li>
                <li>Verify Blackbox Exporter configuration</li>
                <li>Ensure targets are being scraped</li>
                <li>Check network connectivity</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-2 text-blue-600 text-base font-semibold">Features</h4>
              <ul className="list-disc pl-5 text-gray-600 text-sm mb-0">
                <li>Real-time uptime monitoring</li>
                <li>Domain grouping and management</li>
                <li>Downtime tracking and annotation</li>
                <li>PDF and CSV report generation</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage; 