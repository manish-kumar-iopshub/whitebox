import React, { useState } from 'react';
import { testConnection } from '../services/prometheusApi';

const ConnectionTest = () => {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState(null);

  const handleTest = async () => {
    setTesting(true);
    setResult(null);
    
    try {
      await testConnection();
      setResult({ success: true, message: 'Connection successful!' });
    } catch (error) {
      setResult({ success: false, message: `Connection failed: ${error.message}` });
    } finally {
      setTesting(false);
    }
  };

  const handleTestTargets = async () => {
    setTesting(true);
    setResult(null);
    
    try {
      await testConnection();
      setResult({ success: true, message: 'Targets query successful!' });
    } catch (error) {
      setResult({ success: false, message: `Targets query failed: ${error.message}` });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      marginBottom: '20px'
    }}>
      <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50' }}>Connection Test</h3>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          onClick={handleTest}
          disabled={testing}
          style={{
            background: '#3498db',
            border: 'none',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: testing ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            opacity: testing ? 0.6 : 1
          }}
        >
          {testing ? 'Testing...' : 'Test Connection'}
        </button>
        
        <button
          onClick={handleTestTargets}
          disabled={testing}
          style={{
            background: '#27ae60',
            border: 'none',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: testing ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            opacity: testing ? 0.6 : 1
          }}
        >
          {testing ? 'Testing...' : 'Test Targets Query'}
        </button>
      </div>

      {result && (
        <div style={{
          padding: '15px',
          borderRadius: '8px',
          backgroundColor: result.success ? '#d4edda' : '#f8d7da',
          color: result.success ? '#155724' : '#721c24',
          border: `1px solid ${result.success ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          <strong>{result.success ? '✅ Success:' : '❌ Error:'}</strong> {result.message}
        </div>
      )}
    </div>
  );
};

export default ConnectionTest; 