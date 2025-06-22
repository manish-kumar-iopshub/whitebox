import React, { useState, useEffect } from 'react';
import { formatDate } from '../utils/domainUtils';
import { getTargetStatus, getUptimePercentage } from '../services/prometheusApi';
import TimeRangePicker from './TimeRangePicker';
import DowntimeTable from './DowntimeTable';
import DebugInfo from './DebugInfo';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';

const GroupDetail = ({ groupName, targets, targetStatuses: passedTargetStatuses, onBack }) => {
  const [targetStatuses, setTargetStatuses] = useState({});
  const [targetUptimes, setTargetUptimes] = useState({});
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
    const processData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Use the passed targetStatuses if available, otherwise fetch them
        let statuses = {};
        let uptimes = {};
        
        if (passedTargetStatuses && passedTargetStatuses.length > 0) {
          // Use passed data for status
          passedTargetStatuses.forEach(status => {
            statuses[status.target] = {
              status: status.status,
              lastCheck: status.lastCheck,
              responseTime: status.responseTime
            };
          });
        } else {
          // Fallback: fetch status data manually
          const statusPromises = targets.map(async (target) => {
            const status = await getTargetStatus(target);
            return { target, status };
          });
          
          const statusResults = await Promise.all(statusPromises);
          statusResults.forEach(({ target, status }) => {
            statuses[target] = status;
          });
        }
        
        // Always fetch uptime data for the current time range
        const uptimePromises = targets.map(async (target) => {
          const uptime = await getUptimePercentage(target, timeRange.start, timeRange.end);
          return { target, uptime };
        });
        
        const uptimeResults = await Promise.all(uptimePromises);
        uptimeResults.forEach(({ target, uptime }) => {
          uptimes[target] = uptime;
        });
        
        console.log('GroupDetail - Target uptimes:', uptimes);
        console.log('GroupDetail - Target statuses:', statuses);
        
        setTargetStatuses(statuses);
        setTargetUptimes(uptimes);
      } catch (err) {
        console.error('Error processing group data:', err);
        setError('Failed to load group data');
      } finally {
        setLoading(false);
      }
    };

    processData();
  }, [targets, passedTargetStatuses, timeRange]);

  const handleTimeRangeChange = (start, end) => {
    setTimeRange({ start, end });
  };

  const handleExport = () => {
    const csvData = [
      ['Target', 'Status', 'Uptime %', 'Last Check'],
      ...targets.map(target => [
        target,
        targetStatuses[target]?.status || 'Unknown',
        targetUptimes[target]?.toFixed(2) || '0.00',
        targetStatuses[target]?.lastCheck ? formatDate(targetStatuses[target].lastCheck) : 'N/A'
      ])
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${groupName}_targets_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="text-center p-10">
        <div className="text-2xl mb-2">⏳</div>
        <p className="text-gray-600">Loading group data...</p>
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
            ← Back to Groups
          </Button>
          <h1 className="m-0 text-2xl font-bold text-gray-900">{groupName}</h1>
          <p className="mt-1 mb-0 text-gray-600">{targets.length} target{targets.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={handleExport} variant="default" className="flex items-center gap-2">
          📊 Export CSV
        </Button>
      </div>

      {/* Unified Time Range Picker */}
      <TimeRangePicker
        onTimeRangeChange={handleTimeRangeChange}
        initialStart={timeRange.start}
        initialEnd={timeRange.end}
        timezone="Asia/Kolkata"
      />

      <DowntimeTable targets={targets} timeRange={timeRange} onDebugInfo={setDebugInfo} />

      {/* Debug Info Collapsed Tab */}
      <DebugInfo debugInfo={debugInfo} />
    </div>
  );
};

export default GroupDetail; 