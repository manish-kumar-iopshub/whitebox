import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { fetchUptimeData } from '../services/prometheusApi';
import { formatDate, formatDuration } from '../utils/domainUtils';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';

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
        <div className="bg-white border border-border rounded-lg p-3 shadow-lg">
          <p className="font-bold text-foreground mb-2">
            {formatDate(new Date(data.timestamp))}
          </p>
          <p className="text-muted-foreground mb-1">
            Uptime: <span className="text-discord-green font-bold">
              {data.uptime.toFixed(2)}%
            </span>
          </p>
          {data.responseTime && (
            <p className="text-muted-foreground mb-1">
              Response Time: <span className="text-discord-blurple font-bold">
                {formatDuration(data.responseTime * 1000)}
              </span>
            </p>
          )}
          <p className="text-xs text-muted-foreground italic mt-2">
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
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="text-2xl mb-2">⏳</div>
            <p className="text-muted-foreground">{loadingProgress}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="bg-destructive/10 text-destructive p-4 rounded-lg border border-destructive/20">
            <strong>Error:</strong> {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="text-2xl mb-2">📊</div>
            <p className="text-muted-foreground">No uptime data available for the selected time range</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>
            Uptime Trend {targets && targets.length > 0 ? `(${targets.length} targets)` : ''}
          </CardTitle>
          <div className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-md border">
            Click on chart to zoom • Drag to select range
          </div>
        </div>
      </CardHeader>
      <CardContent>
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
              tickFormatter={(value) => `${value}%`}
              stroke="#7f8c8d"
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={95} stroke="#e74c3c" strokeDasharray="3 3" />
            <Area
              type="monotone"
              dataKey="uptime"
              stroke="#27ae60"
              fill="#27ae60"
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default UptimeChart; 