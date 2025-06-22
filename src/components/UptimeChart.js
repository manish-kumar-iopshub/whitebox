import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { fetchUptimeData } from '../services/prometheusApi';
import { formatDate, formatDuration } from '../utils/domainUtils';

const UptimeChart = ({ target, timeRange, onTimeRangeChange, targets }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!target) return;
      
      setLoading(true);
      setError(null);
      setLoadingProgress('Fetching uptime data...');
      
      try {
        let chartData;
        
        // Progress tracking callback
        const handleProgress = (current, total, message) => {
          setLoadingProgress(`${current}/${total} API calls done: ${message}`);
        };
        
        if (targets && targets.length > 0) {
          // Fetch data for multiple targets (group view)
          setLoadingProgress(`Fetching data for ${targets.length} targets...`);
          chartData = await fetchUptimeData(targets, timeRange.start, timeRange.end, handleProgress);
        } else {
          // Fetch data for single target
          chartData = await fetchUptimeData([target], timeRange.start, timeRange.end, handleProgress);
        }
        
        setData(chartData);
        setLoadingProgress('');
      } catch (err) {
        console.error('Error fetching uptime data:', err);
        setError('Failed to load uptime data');
        setData([]);
        setLoadingProgress('');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [target, targets, timeRange]);

  const handleChartClick = (data) => {
    if (data && data.activePayload && data.activePayload[0]) {
      const clickedPoint = data.activePayload[0].payload;
      const timestamp = new Date(clickedPoint.timestamp);
      
      // Set a 1-hour range around the clicked point
      const start = new Date(timestamp.getTime() - 30 * 60 * 1000); // 30 minutes before
      const end = new Date(timestamp.getTime() + 30 * 60 * 1000);   // 30 minutes after
      
      onTimeRangeChange(start, end);
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #ccc',
          borderRadius: '8px',
          padding: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#2c3e50' }}>
            {formatDate(new Date(data.timestamp))}
          </p>
          <p style={{ margin: '4px 0', color: '#7f8c8d' }}>
            Uptime: <span style={{ color: '#27ae60', fontWeight: 'bold' }}>
              {data.uptime.toFixed(2)}%
            </span>
          </p>
          {data.responseTime && (
            <p style={{ margin: '4px 0', color: '#7f8c8d' }}>
              Response Time: <span style={{ color: '#3498db', fontWeight: 'bold' }}>
                {formatDuration(data.responseTime * 1000)}
              </span>
            </p>
          )}
          <p style={{ 
            margin: '8px 0 0 0', 
            fontSize: '12px', 
            color: '#95a5a6',
            fontStyle: 'italic'
          }}>
            Click to zoom to this time
          </p>
        </div>
      );
    }
    return null;
  };

  const formatXAxis = (tickItem) => {
    return formatDate(new Date(tickItem));
  };

  if (loading) {
    return (
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '24px', marginBottom: '10px' }}>⏳</div>
        <p style={{ color: '#7f8c8d' }}>{loadingProgress}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        marginBottom: '20px'
      }}>
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '15px',
          borderRadius: '8px',
          border: '1px solid #f5c6cb'
        }}>
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '24px', marginBottom: '10px' }}>📊</div>
        <p style={{ color: '#7f8c8d' }}>No uptime data available for the selected time range</p>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      marginBottom: '20px'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h3 style={{ margin: 0, color: '#2c3e50' }}>
          Uptime Trend {targets && targets.length > 0 ? `(${targets.length} targets)` : ''}
        </h3>
        <div style={{
          fontSize: '12px',
          color: '#7f8c8d',
          backgroundColor: '#f8f9fa',
          padding: '6px 10px',
          borderRadius: '4px',
          border: '1px solid #e9ecef'
        }}>
          Click on chart to zoom • Drag to select range
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <AreaChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          onClick={handleChartClick}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="timestamp" 
            tickFormatter={formatXAxis}
            stroke="#7f8c8d"
            fontSize={12}
          />
          <YAxis 
            domain={[0, 100]}
            stroke="#7f8c8d"
            fontSize={12}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="uptime"
            stroke="#27ae60"
            fill="#27ae60"
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <ReferenceLine y={95} stroke="#e74c3c" strokeDasharray="3 3" />
        </AreaChart>
      </ResponsiveContainer>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '15px',
        fontSize: '12px',
        color: '#7f8c8d'
      }}>
        <div>
          <span style={{ color: '#27ae60', fontWeight: 'bold' }}>●</span> Uptime Percentage
        </div>
        <div>
          <span style={{ color: '#e74c3c', fontWeight: 'bold' }}>---</span> 95% Threshold
        </div>
      </div>
    </div>
  );
};

export default UptimeChart; 