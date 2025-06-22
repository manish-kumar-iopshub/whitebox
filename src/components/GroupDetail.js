import React, { useState, useEffect } from 'react';
import { calculateGroupUptime, formatDate } from '../utils/domainUtils';
import { getTargetStatus, getUptimePercentage } from '../services/prometheusApi';
import TimeRangePicker from './TimeRangePicker';
import UptimeChart from './UptimeChart';
import ResponseTimeChart from './ResponseTimeChart';
import DowntimeTable from './DowntimeTable';
import DebugInfo from './DebugInfo';

const GroupDetail = ({ groupName, targets, targetStatuses: passedTargetStatuses, onBack }) => {
  const [targetStatuses, setTargetStatuses] = useState({});
  const [targetUptimes, setTargetUptimes] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState(() => {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
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

  const upCount = Object.values(targetStatuses).filter(status => status?.status === 'up').length;
  const downCount = Object.values(targetStatuses).filter(status => status?.status === 'down').length;

  // Calculate group uptime as average of individual uptimes
  const groupUptime = (() => {
    const validUptimes = Object.values(targetUptimes).filter(uptime => uptime !== null && uptime !== undefined);
    if (validUptimes.length === 0) return 100;
    
    const avgUptime = validUptimes.reduce((sum, uptime) => sum + uptime, 0) / validUptimes.length;
    return avgUptime;
  })();

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '24px', marginBottom: '10px' }}>⏳</div>
        <p style={{ color: '#7f8c8d' }}>Loading group data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        backgroundColor: '#f8d7da',
        color: '#721c24',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #f5c6cb'
      }}>
        <strong>Error:</strong> {error}
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        <div>
          <button
            onClick={onBack}
            style={{
              background: 'none',
              border: 'none',
              color: '#3498db',
              cursor: 'pointer',
              fontSize: '16px',
              marginBottom: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            ← Back to Groups
          </button>
          <h1 style={{ margin: 0, color: '#2c3e50' }}>{groupName}</h1>
          <p style={{ margin: '5px 0 0 0', color: '#7f8c8d' }}>
            {targets.length} target{targets.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <button
          onClick={handleExport}
          style={{
            background: '#27ae60',
            border: 'none',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          📊 Export CSV
        </button>
      </div>

      {/* Unified Time Range Picker */}
      <TimeRangePicker
        onTimeRangeChange={handleTimeRangeChange}
        initialStart={timeRange.start}
        initialEnd={timeRange.end}
        timezone="Asia/Kolkata"
      />

      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '10px' }}>📊</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2c3e50' }}>
            {groupUptime.toFixed(2)}%
          </div>
          <div style={{ fontSize: '14px', color: '#7f8c8d' }}>Group Uptime</div>
        </div>
        
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '10px' }}>✅</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#27ae60' }}>
            {upCount}
          </div>
          <div style={{ fontSize: '14px', color: '#7f8c8d' }}>Targets Up</div>
        </div>
        
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '10px' }}>❌</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#e74c3c' }}>
            {downCount}
          </div>
          <div style={{ fontSize: '14px', color: '#7f8c8d' }}>Targets Down</div>
        </div>
        
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '10px' }}>🎯</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3498db' }}>
            {targets.length}
          </div>
          <div style={{ fontSize: '14px', color: '#7f8c8d' }}>Total Targets</div>
        </div>
      </div>

      {/* Charts and DowntimeTable use the same timeRange */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <UptimeChart targets={targets} timeRange={timeRange} />
        <ResponseTimeChart targets={targets} timeRange={timeRange} />
      </div>

      <DowntimeTable targets={targets} timeRange={timeRange} onDebugInfo={setDebugInfo} />

      {/* Debug Info Collapsed Tab */}
      <DebugInfo debugInfo={debugInfo} />
    </div>
  );
};

export default GroupDetail; 