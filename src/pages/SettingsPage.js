import React, { useState, useEffect } from 'react';
import ConnectionTest from '../components/ConnectionTest';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import { testConnection } from '../services/prometheusApi';

const SettingsPage = () => {
  const [connectivityStatus, setConnectivityStatus] = useState('unknown');
  const [lastChecked, setLastChecked] = useState(null);

  // Get version and environment from env variables
  const appVersion = process.env.REACT_APP_VERSION || 'latest';
  const environment = process.env.REACT_APP_ENVIRONMENT || 'localhost';
  const prometheusUrl = process.env.REACT_APP_PROMETHEUS_URL || 'http://localhost:9090';

  useEffect(() => {
    const checkConnectivity = async () => {
      try {
        await testConnection();
        setConnectivityStatus('connected');
      } catch (error) {
        setConnectivityStatus('disconnected');
      } finally {
        setLastChecked(new Date());
      }
    };

    checkConnectivity();
  }, []);

  const getConnectivityBadge = () => {
    switch (connectivityStatus) {
      case 'connected':
        return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">Connected</Badge>;
      case 'disconnected':
        return <Badge variant="destructive">Disconnected</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-8">
        <FontAwesomeIcon icon={faCog} className="text-2xl text-orange-600" />
        <h1 className="m-0 text-2xl font-bold text-gray-900">Settings</h1>
      </div>
      <Card className="mb-6 shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Connection Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-sm font-medium text-gray-700">Prometheus Status:</span>
            {getConnectivityBadge()}
            {lastChecked && (
              <span className="text-xs text-gray-500">
                Last checked: {lastChecked.toLocaleTimeString()}
              </span>
            )}
          </div>
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
              <p className="mb-1 text-gray-600 text-sm"><strong>URL:</strong> {prometheusUrl}</p>
              <p className="mb-1 text-gray-600 text-sm"><strong>Status:</strong> {connectivityStatus === 'connected' ? '✅ Connected' : '❌ Disconnected'}</p>
            </div>
            <div>
              <h4 className="mb-2 text-blue-600 text-base font-semibold">Application Info</h4>
              <p className="mb-1 text-gray-600 text-sm"><strong>Version:</strong> {appVersion}</p>
              <p className="mb-1 text-gray-600 text-sm"><strong>Environment:</strong> {environment}</p>
              <p className="mb-1 text-gray-600 text-sm"><strong>Build:</strong> {process.env.NODE_ENV}</p>
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