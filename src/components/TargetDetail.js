import React, { useState, useEffect } from 'react';
import { getTargetStatus, getTargetUptime } from '../services/prometheusApi';
import { formatDate } from '../utils/domainUtils';
import TimeRangePicker from './TimeRangePicker';
import UptimeChart from './UptimeChart';
import ResponseTimeChart from './ResponseTimeChart';
import DowntimeTable from './DowntimeTable';
import UptimeDonut from './UptimeDonut';

const TargetDetail = ({ target, onBack }) => {
  const [status, setStatus] = useState(null);
  const [uptime, setUptime] = useState(0);
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
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '24px', marginBottom: '10px' }}>⏳</div>
        <p style={{ color: '#7f8c8d' }}>Loading target data...</p>
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
            ← Back to Targets
          </button>
          <h1 style={{ margin: 0, color: '#2c3e50' }}>{target}</h1>
          <p style={{ margin: '5px 0 0 0', color: '#7f8c8d' }}>
            Individual Target Monitoring
          </p>
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: 'bold',
            backgroundColor: status?.status === 'up' ? '#d4edda' : '#f8d7da',
            color: status?.status === 'up' ? '#155724' : '#721c24'
          }}>
            {status?.status === 'up' ? '✅ UP' : '❌ DOWN'}
          </span>
        </div>
      </div>

      {/* Time Range Picker */}
      <TimeRangePicker
        onTimeRangeChange={handleTimeRangeChange}
        initialStart={timeRange.start}
        initialEnd={timeRange.end}
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
            {uptime.toFixed(2)}%
          </div>
          <div style={{ fontSize: '14px', color: '#7f8c8d' }}>Uptime</div>
        </div>
        
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '10px' }}>⚡</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3498db' }}>
            {status?.responseTime ? `${(status.responseTime * 1000).toFixed(0)}ms` : 'N/A'}
          </div>
          <div style={{ fontSize: '14px', color: '#7f8c8d' }}>Response Time</div>
        </div>
        
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '10px' }}>🕒</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#7f8c8d' }}>
            {status?.lastCheck ? formatDate(status.lastCheck) : 'N/A'}
          </div>
          <div style={{ fontSize: '14px', color: '#7f8c8d' }}>Last Check</div>
        </div>
        
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '10px' }}>📈</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#27ae60' }}>
            {status?.status === 'up' ? '100%' : '0%'}
          </div>
          <div style={{ fontSize: '14px', color: '#7f8c8d' }}>Current Status</div>
        </div>
      </div>

      {/* Charts */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <UptimeChart
          target={target}
          timeRange={timeRange}
          onTimeRangeChange={handleTimeRangeChange}
        />
        <ResponseTimeChart
          target={target}
          timeRange={timeRange}
          onTimeRangeChange={handleTimeRangeChange}
        />
      </div>

      {/* Uptime Donut Chart */}
      <div style={{ marginBottom: '30px' }}>
        <UptimeDonut
          data={[{
            name: target,
            value: uptime,
            status: status?.status || 'unknown'
          }]}
          title={`${target} - Uptime Overview`}
        />
      </div>

      {/* Downtime Table */}
      <DowntimeTable
        target={target}
        timeRange={timeRange}
        onTimeRangeChange={handleTimeRangeChange}
      />
    </div>
  );
};

export default TargetDetail; 