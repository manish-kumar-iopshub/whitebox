import React, { useState, useEffect } from 'react';
import { getTargetStatus, getTargetUptime } from '../services/prometheusApi';
import { formatDate } from '../utils/domainUtils';
import TimeRangePicker from './TimeRangePicker';
import UptimeChart from './UptimeChart';
import ResponseTimeChart from './ResponseTimeChart';
import DowntimeTable from './DowntimeTable';
import DebugInfo from './DebugInfo';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

const TargetDetail = ({ target, onBack }) => {
  const [status, setStatus] = useState(null);
  const [uptime, setUptime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState(() => {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    // Normalize timestamps to have 00 seconds to eliminate variability
    now.setSeconds(0, 0);
    twentyFourHoursAgo.setSeconds(0, 0);
    
    return {
      start: twentyFourHoursAgo,
      end: now
    };
  });
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const [statusData, uptimeData] = await Promise.all([
          getTargetStatus(target),
          getTargetUptime(target, timeRange.start, timeRange.end)
        ]);
        
        setStatus(statusData);
        setUptime(uptimeData);
      } catch (err) {
        console.error('Error fetching target data:', err);
        setError('Failed to load target data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [target, timeRange]);

  const handleTimeRangeChange = (start, end) => {
    setTimeRange({ start, end });
  };

  if (loading) {
    return (
      <div className="text-center p-10">
        <div className="text-2xl mb-2">⏳</div>
        <p className="text-gray-600">Loading target data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-200">
        <strong>Error:</strong> {error}
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div>
          <Button
            onClick={onBack}
            variant="ghost"
            className="mb-2 flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            ← Back to Targets
          </Button>
          <h1 className="m-0 text-2xl font-bold text-gray-900">{target}</h1>
          <p className="mt-1 mb-0 text-gray-600">Individual Target Monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={status?.status === 'up' ? 'default' : 'destructive'} className="text-sm">
            {status?.status === 'up' ? '✅ UP' : '❌ DOWN'}
          </Badge>
        </div>
      </div>
      <TimeRangePicker
        onTimeRangeChange={handleTimeRangeChange}
        initialStart={timeRange.start}
        initialEnd={timeRange.end}
        timezone="Asia/Kolkata"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="text-center shadow-sm border border-gray-200">
          <CardContent className="pt-6">
            <div className="text-3xl mb-2">📊</div>
            <div className="text-2xl font-bold text-blue-600">{uptime.toFixed(2)}%</div>
            <div className="text-sm text-gray-600">Uptime</div>
          </CardContent>
        </Card>
        <Card className="text-center shadow-sm border border-gray-200">
          <CardContent className="pt-6">
            <div className="text-3xl mb-2">⚡</div>
            <div className="text-2xl font-bold text-blue-600">
              {status?.responseTime ? `${(status.responseTime * 1000).toFixed(0)}ms` : 'N/A'}
            </div>
            <div className="text-sm text-gray-600">Response Time</div>
          </CardContent>
        </Card>
        <Card className="text-center shadow-sm border border-gray-200">
          <CardContent className="pt-6">
            <div className="text-3xl mb-2">🕒</div>
            <div className="text-2xl font-bold text-gray-700">
              {status?.lastCheck ? formatDate(status.lastCheck) : 'N/A'}
            </div>
            <div className="text-sm text-gray-600">Last Check</div>
          </CardContent>
        </Card>
        <Card className="text-center shadow-sm border border-gray-200">
          <CardContent className="pt-6">
            <div className="text-3xl mb-2">📈</div>
            <div className="text-2xl font-bold text-green-600">
              {status?.status === 'up' ? '100%' : '0%'}
            </div>
            <div className="text-sm text-gray-600">Current Status</div>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <UptimeChart target={target} timeRange={timeRange} />
        <ResponseTimeChart target={target} timeRange={timeRange} />
      </div>
      <DowntimeTable target={target} timeRange={timeRange} onDebugInfo={setDebugInfo} />
      <DebugInfo debugInfo={debugInfo} />
    </div>
  );
};

export default TargetDetail; 