import React from 'react';
import ConnectionTest from '../components/ConnectionTest';

const SettingsPage = () => {
  return (
    <div style={{ padding: '20px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        marginBottom: '30px'
      }}>
        <span style={{ fontSize: '24px' }}>⚙️</span>
        <h1 style={{ margin: 0, color: '#2c3e50' }}>Settings</h1>
      </div>

      {/* Connection Test */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        marginBottom: '20px'
      }}>
        <ConnectionTest />
      </div>

      {/* Configuration Info */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        marginBottom: '20px'
      }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50' }}>Configuration</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          <div>
            <h4 style={{ margin: '0 0 10px 0', color: '#3498db' }}>Prometheus Connection</h4>
            <p style={{ margin: '0 0 5px 0', color: '#7f8c8d', fontSize: '14px' }}>
              <strong>URL:</strong> {process.env.REACT_APP_PROMETHEUS_URL || 'http://localhost:9090'}
            </p>
            <p style={{ margin: '0 0 5px 0', color: '#7f8c8d', fontSize: '14px' }}>
              <strong>Proxy:</strong> Configured in package.json
            </p>
          </div>
          
          <div>
            <h4 style={{ margin: '0 0 10px 0', color: '#3498db' }}>Application Info</h4>
            <p style={{ margin: '0 0 5px 0', color: '#7f8c8d', fontSize: '14px' }}>
              <strong>Version:</strong> 1.0.0
            </p>
            <p style={{ margin: '0 0 5px 0', color: '#7f8c8d', fontSize: '14px' }}>
              <strong>Environment:</strong> {process.env.NODE_ENV}
            </p>
          </div>
        </div>
      </div>

      {/* Help & Support */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50' }}>Help & Support</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          <div>
            <h4 style={{ margin: '0 0 10px 0', color: '#3498db' }}>Troubleshooting</h4>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#7f8c8d', fontSize: '14px' }}>
              <li>Check Prometheus is running and accessible</li>
              <li>Verify Blackbox Exporter configuration</li>
              <li>Ensure targets are being scraped</li>
              <li>Check network connectivity</li>
            </ul>
          </div>
          
          <div>
            <h4 style={{ margin: '0 0 10px 0', color: '#3498db' }}>Features</h4>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#7f8c8d', fontSize: '14px' }}>
              <li>Real-time uptime monitoring</li>
              <li>Domain grouping and management</li>
              <li>Downtime tracking and annotation</li>
              <li>PDF and CSV report generation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 