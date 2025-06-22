import React, { useState } from 'react';
import { testConnection } from '../services/prometheusApi';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';

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
    <Card>
      <CardHeader>
        <CardTitle>Connection Test</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3 mb-6">
          <Button
            onClick={handleTest}
            disabled={testing}
            variant="default"
          >
            {testing ? 'Testing...' : 'Test Connection'}
          </Button>
          
          <Button
            onClick={handleTestTargets}
            disabled={testing}
            variant="default"
          >
            {testing ? 'Testing...' : 'Test Targets Query'}
          </Button>
        </div>

        {result && (
          <div className={`p-4 rounded-lg border ${
            result.success 
              ? 'bg-green-50 text-green-800 border-green-200' 
              : 'bg-red-50 text-red-800 border-red-200'
          }`}>
            <strong>{result.success ? '✅ Success:' : '❌ Error:'}</strong> {result.message}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConnectionTest; 