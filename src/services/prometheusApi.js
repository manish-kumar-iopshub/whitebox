import axios from 'axios';

const PROMETHEUS_BASE_URL = process.env.REACT_APP_PROMETHEUS_URL || 'http://localhost:9090';

console.log('Prometheus API configured with base URL:', PROMETHEUS_BASE_URL);

const prometheusApi = axios.create({
  baseURL: PROMETHEUS_BASE_URL,
  timeout: 30000,
});

// Add request interceptor for debugging
prometheusApi.interceptors.request.use(
  (config) => {
    console.log('Prometheus API Request:', config.method?.toUpperCase(), config.url, config.params);
    return config;
  },
  (error) => {
    console.error('Prometheus API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
prometheusApi.interceptors.response.use(
  (response) => {
    console.log('Prometheus API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('Prometheus API Response Error:', error.response?.status, error.response?.data, error.config?.url);
    return Promise.reject(error);
  }
);

// Helper function to format time range
const formatTimeRange = (start, end) => {
  const startTime = Math.floor(new Date(start).getTime() / 1000);
  const endTime = Math.floor(new Date(end).getTime() / 1000);
  return { start: startTime, end: endTime };
};

// Helper function to calculate optimal step size for a time range
const calculateOptimalStep = (startTime, endTime, maxPoints = 10000) => {
  const duration = endTime - startTime;
  const optimalStep = Math.ceil(duration / maxPoints);
  
  // Ensure minimum step of 1 minute and maximum of 1 hour
  return Math.max(60, Math.min(3600, optimalStep));
};

// Helper function to chunk time ranges
const chunkTimeRange = (startTime, endTime, maxChunkDuration = 7 * 24 * 3600) => { // 7 days max per chunk
  const chunks = [];
  let currentStart = startTime;
  
  while (currentStart < endTime) {
    const chunkEnd = Math.min(currentStart + maxChunkDuration, endTime);
    chunks.push({ start: currentStart, end: chunkEnd });
    currentStart = chunkEnd;
  }
  
  return chunks;
};

// Get all available targets
export const getTargets = async () => {
  try {
    // First try the series endpoint
    const response = await prometheusApi.get('/api/v1/series', {
      params: {
        'match[]': 'probe_success',
        start: Math.floor((Date.now() - 24 * 60 * 60 * 1000) / 1000), // Last 24 hours
        end: Math.floor(Date.now() / 1000),
      },
    });

    const targets = new Set();
    response.data.data.forEach(series => {
      if (series.instance) {
        targets.add(series.instance);
      }
    });

    return Array.from(targets);
  } catch (error) {
    console.warn('Series endpoint failed, trying query endpoint as fallback:', error);
    
    // Fallback: use the query endpoint to get current targets
    try {
      const fallbackResponse = await prometheusApi.get('/api/v1/query', {
        params: {
          query: 'probe_success',
        },
      });

      const targets = new Set();
      fallbackResponse.data.data.result.forEach(result => {
        if (result.metric.instance) {
          targets.add(result.metric.instance);
        }
      });

      return Array.from(targets);
    } catch (fallbackError) {
      console.error('Both series and query endpoints failed:', fallbackError);
      throw new Error('Unable to fetch targets from Prometheus. Please check your configuration.');
    }
  }
};

// Get target metrics for a specific time range
export const getTargetMetrics = async (target, start, end, step = '1m') => {
  try {
    const { start: startTime, end: endTime } = formatTimeRange(start, end);

    const metrics = {};
    
    // Get probe success data
    const successResponse = await prometheusApi.get('/api/v1/query_range', {
      params: {
        query: `probe_success{instance="${target}"}`,
        start: startTime,
        end: endTime,
        step,
      },
    });
    metrics.success = successResponse.data.data.result[0]?.values || [];

    // Get probe duration data
    const durationResponse = await prometheusApi.get('/api/v1/query_range', {
      params: {
        query: `probe_duration_seconds{instance="${target}"}`,
        start: startTime,
        end: endTime,
        step,
      },
    });
    metrics.duration = durationResponse.data.data.result[0]?.values || [];

    // Get HTTP status code data
    const statusResponse = await prometheusApi.get('/api/v1/query_range', {
      params: {
        query: `probe_http_status_code{instance="${target}"}`,
        start: startTime,
        end: endTime,
        step,
      },
    });
    metrics.statusCode = statusResponse.data.data.result[0]?.values || [];

    return metrics;
  } catch (error) {
    console.error('Error fetching target metrics:', error);
    throw error;
  }
};

// Get current status for all targets
export const getCurrentStatus = async () => {
  try {
    const response = await prometheusApi.get('/api/v1/query', {
      params: {
        query: 'probe_success',
      },
    });

    return response.data.data.result.map(result => ({
      target: result.metric.instance,
      success: result.value[1] === '1',
      labels: result.metric,
    }));
  } catch (error) {
    console.error('Error fetching current status:', error);
    throw error;
  }
};

// Get uptime percentage for a target
export const getUptimePercentage = async (target, start, end) => {
  try {
    const { start: startTime, end: endTime } = formatTimeRange(start, end);
    
    const response = await prometheusApi.get('/api/v1/query', {
      params: {
        query: `avg_over_time(probe_success{instance="${target}"}[${endTime - startTime}s]) * 100`,
        time: endTime,
      },
    });

    return parseFloat(response.data.data.result[0]?.value[1] || 0);
  } catch (error) {
    console.error('Error fetching uptime percentage:', error);
    throw error;
  }
};

// Get downtime periods for a target with chunked fetching
export const getDowntimePeriods = async (target, start, end) => {
  try {
    const { start: startTime, end: endTime } = formatTimeRange(start, end);
    
    // Calculate optimal step size
    const step = calculateOptimalStep(startTime, endTime);
    
    // If time range is too large, chunk it
    const maxChunkDuration = 7 * 24 * 3600; // 7 days
    const totalDuration = endTime - startTime;
    
    let allDowntimePeriods = [];
    
    if (totalDuration > maxChunkDuration) {
      // Fetch data in chunks
      const chunks = chunkTimeRange(startTime, endTime, maxChunkDuration);
      
      for (const chunk of chunks) {
        const chunkStep = calculateOptimalStep(chunk.start, chunk.end);
        
        const response = await prometheusApi.get('/api/v1/query_range', {
          params: {
            query: `probe_success{instance="${target}"}`,
            start: chunk.start,
            end: chunk.end,
            step: chunkStep,
          },
        });

        const chunkDowntimes = processDowntimeData(response.data.data.result[0]?.values || [], chunk.start, chunk.end);
        allDowntimePeriods = allDowntimePeriods.concat(chunkDowntimes);
      }
    } else {
      // Single request for smaller time ranges
      const response = await prometheusApi.get('/api/v1/query_range', {
        params: {
          query: `probe_success{instance="${target}"}`,
          start: startTime,
          end: endTime,
          step: step,
        },
      });

      allDowntimePeriods = processDowntimeData(response.data.data.result[0]?.values || [], startTime, endTime);
    }

    return allDowntimePeriods;
  } catch (error) {
    console.error('Error fetching downtime periods:', error);
    throw error;
  }
};

// Helper function to process downtime data from Prometheus response
const processDowntimeData = (values, startTime, endTime) => {
  const downtimePeriods = [];
  
  if (values.length === 0) {
    return downtimePeriods;
  }

  let currentDowntimeStart = null;
  
  for (let i = 0; i < values.length; i++) {
    const [timestamp, value] = values[i];
    const isDown = value === '0';
    
    if (isDown && currentDowntimeStart === null) {
      // Start of a new downtime period
      currentDowntimeStart = parseInt(timestamp);
    } else if (!isDown && currentDowntimeStart !== null) {
      // End of a downtime period
      const downtimeEnd = parseInt(timestamp);
      const duration = (downtimeEnd - currentDowntimeStart) / 60; // Duration in minutes
      
      if (duration > 0) { // Only add if duration is positive
        downtimePeriods.push({
          start: new Date(currentDowntimeStart * 1000),
          end: new Date(downtimeEnd * 1000),
          duration: duration,
        });
      }
      currentDowntimeStart = null;
    }
  }
  
  // Handle case where downtime extends to the end of the time range
  if (currentDowntimeStart !== null) {
    const duration = (endTime - currentDowntimeStart) / 60; // Duration in minutes
    
    if (duration > 0) {
      downtimePeriods.push({
        start: new Date(currentDowntimeStart * 1000),
        end: new Date(endTime * 1000),
        duration: duration,
      });
    }
  }

  return downtimePeriods;
};

// Get response time statistics
export const getResponseTimeStats = async (target, start, end) => {
  try {
    const { end: endTime } = formatTimeRange(start, end);
    
    const avgResponse = await prometheusApi.get('/api/v1/query', {
      params: {
        query: `avg(probe_duration_seconds{instance="${target}"})`,
        time: endTime,
      },
    });

    const maxResponse = await prometheusApi.get('/api/v1/query', {
      params: {
        query: `max(probe_duration_seconds{instance="${target}"})`,
        time: endTime,
      },
    });

    const minResponse = await prometheusApi.get('/api/v1/query', {
      params: {
        query: `min(probe_duration_seconds{instance="${target}"})`,
        time: endTime,
      },
    });

    return {
      average: parseFloat(avgResponse.data.data.result[0]?.value[1] || 0),
      maximum: parseFloat(maxResponse.data.data.result[0]?.value[1] || 0),
      minimum: parseFloat(minResponse.data.data.result[0]?.value[1] || 0),
    };
  } catch (error) {
    console.error('Error fetching response time stats:', error);
    throw error;
  }
};

// Get downtime periods for multiple targets (group) with chunked fetching
export const getGroupDowntimePeriods = async (targets, start, end) => {
  try {
    const { start: startTime, end: endTime } = formatTimeRange(start, end);
    
    // Calculate optimal step size
    const step = calculateOptimalStep(startTime, endTime);
    
    // If time range is too large, chunk it
    const maxChunkDuration = 7 * 24 * 3600; // 7 days
    const totalDuration = endTime - startTime;
    
    let allDowntimePeriods = [];
    
    if (totalDuration > maxChunkDuration) {
      // Fetch data in chunks
      const chunks = chunkTimeRange(startTime, endTime, maxChunkDuration);
      
      for (const chunk of chunks) {
        const chunkStep = calculateOptimalStep(chunk.start, chunk.end);
        
        // Get all probe_success data for all targets in the group
        const targetQueries = targets.map(target => `probe_success{instance="${target}"}`).join(' or ');
        const response = await prometheusApi.get('/api/v1/query_range', {
          params: {
            query: targetQueries,
            start: chunk.start,
            end: chunk.end,
            step: chunkStep,
          },
        });

        const chunkDowntimes = processGroupDowntimeData(response.data.data.result, chunk.start, chunk.end);
        allDowntimePeriods = allDowntimePeriods.concat(chunkDowntimes);
      }
    } else {
      // Single request for smaller time ranges
      const targetQueries = targets.map(target => `probe_success{instance="${target}"}`).join(' or ');
      const response = await prometheusApi.get('/api/v1/query_range', {
        params: {
          query: targetQueries,
          start: startTime,
          end: endTime,
          step: step,
        },
      });

      allDowntimePeriods = processGroupDowntimeData(response.data.data.result, startTime, endTime);
    }

    // Sort by start time (most recent first)
    return allDowntimePeriods.sort((a, b) => b.start - a.start);
  } catch (error) {
    console.error('Error fetching group downtime periods:', error);
    throw error;
  }
};

// Helper function to process group downtime data
const processGroupDowntimeData = (results, startTime, endTime) => {
  const downtimePeriods = [];
  
  // Process each target's data
  results.forEach(result => {
    const target = result.metric.instance;
    const values = result.values || [];
    
    if (values.length === 0) return;

    let currentDowntimeStart = null;
    
    for (let i = 0; i < values.length; i++) {
      const [timestamp, value] = values[i];
      const isDown = value === '0';
      
      if (isDown && currentDowntimeStart === null) {
        // Start of a new downtime period
        currentDowntimeStart = parseInt(timestamp);
      } else if (!isDown && currentDowntimeStart !== null) {
        // End of a downtime period
        const downtimeEnd = parseInt(timestamp);
        const duration = (downtimeEnd - currentDowntimeStart) / 60; // Duration in minutes
        
        if (duration > 0) {
          downtimePeriods.push({
            target: target,
            start: new Date(currentDowntimeStart * 1000),
            end: new Date(downtimeEnd * 1000),
            duration: duration,
          });
        }
        currentDowntimeStart = null;
      }
    }
    
    // Handle case where downtime extends to the end of the time range
    if (currentDowntimeStart !== null) {
      const duration = (endTime - currentDowntimeStart) / 60;
      
      if (duration > 0) {
        downtimePeriods.push({
          target: target,
          start: new Date(currentDowntimeStart * 1000),
          end: new Date(endTime * 1000),
          duration: duration,
        });
      }
    }
  });

  return downtimePeriods;
};

// Get target status
export const getTargetStatus = async (target) => {
  try {
    const response = await prometheusApi.get('/api/v1/query', {
      params: {
        query: `probe_success{instance="${target}"}`,
        time: Math.floor(Date.now() / 1000)
      }
    });

    const result = response.data.data.result[0];
    if (!result) {
      return {
        status: 'unknown',
        lastCheck: null,
        responseTime: null
      };
    }

    const value = parseFloat(result.value[1]);
    const isUp = value === 1;

    // Get response time
    const responseTimeQuery = await prometheusApi.get('/api/v1/query', {
      params: {
        query: `probe_duration_seconds{instance="${target}"}`,
        time: Math.floor(Date.now() / 1000)
      }
    });

    const responseTimeResult = responseTimeQuery.data.data.result[0];
    const responseTime = responseTimeResult ? parseFloat(responseTimeResult.value[1]) : null;

    return {
      status: isUp ? 'up' : 'down',
      lastCheck: new Date(result.value[0] * 1000),
      responseTime: responseTime
    };
  } catch (error) {
    console.error('Error getting target status:', error);
    return {
      status: 'error',
      lastCheck: null,
      responseTime: null
    };
  }
};

// Get target uptime percentage
export const getTargetUptime = async (target, startTime, endTime) => {
  try {
    const response = await prometheusApi.get('/api/v1/query_range', {
      params: {
        query: `avg_over_time(probe_success{instance="${target}"}[1m])`,
        start: Math.floor(startTime.getTime() / 1000),
        end: Math.floor(endTime.getTime() / 1000),
        step: '1m'
      }
    });

    const result = response.data.data.result[0];
    if (!result || !result.values || result.values.length === 0) {
      return 0;
    }

    const values = result.values.map(v => parseFloat(v[1]));
    const avgUptime = values.reduce((sum, val) => sum + val, 0) / values.length;
    return avgUptime * 100; // Convert to percentage
  } catch (error) {
    console.error('Error getting target uptime:', error);
    return 0;
  }
};

// Fetch chunked data for charts
const fetchChunkedData = async (targets, startTime, endTime, metric) => {
  const chunkSize = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
  const chunks = [];
  
  for (let start = startTime.getTime(); start < endTime.getTime(); start += chunkSize) {
    const chunkEnd = Math.min(start + chunkSize, endTime.getTime());
    chunks.push({
      start: new Date(start),
      end: new Date(chunkEnd)
    });
  }

  const allData = [];
  
  for (const chunk of chunks) {
    try {
      const step = Math.max(60, Math.floor((chunk.end.getTime() - chunk.start.getTime()) / 1000 / 1000)); // Max 1000 points
      
      const response = await prometheusApi.get('/api/v1/query_range', {
        params: {
          query: `avg_over_time(${metric}{instance=~"${targets.join('|')}"}[1m])`,
          start: Math.floor(chunk.start.getTime() / 1000),
          end: Math.floor(chunk.end.getTime() / 1000),
          step: `${step}s`
        }
      });

      const result = response.data.data.result[0];
      if (result && result.values) {
        allData.push(...result.values.map(([timestamp, value]) => ({
          timestamp: parseInt(timestamp),
          value: parseFloat(value)
        })));
      }
    } catch (error) {
      console.error(`Error fetching chunk data:`, error);
    }
  }

  return allData.sort((a, b) => a.timestamp - b.timestamp);
};

// Fetch uptime data for charts
export const fetchUptimeData = async (targets, startTime, endTime) => {
  try {
    const data = await fetchChunkedData(targets, startTime, endTime, 'probe_success');
    
    // Transform data for chart display
    const chartData = data.map(point => ({
      timestamp: new Date(point.timestamp * 1000).getTime(),
      uptime: point.value * 100, // Convert to percentage
      responseTime: point.responseTime || 0
    }));
    
    return chartData;
  } catch (error) {
    console.error('Error fetching uptime data:', error);
    throw error;
  }
};

// Fetch response time data for charts
export const fetchResponseTimeData = async (targets, startTime, endTime) => {
  try {
    const data = await fetchChunkedData(targets, startTime, endTime, 'probe_duration_seconds');
    
    // Transform data for chart display
    const chartData = data.map(point => ({
      timestamp: new Date(point.timestamp * 1000).getTime(),
      responseTime: point.value,
      uptime: point.uptime || 0
    }));
    
    return chartData;
  } catch (error) {
    console.error('Error fetching response time data:', error);
    throw error;
  }
};

// Test connection to Prometheus
export const testConnection = async () => {
  try {
    const response = await prometheusApi.get('/api/v1/status/config');
    return response.data;
  } catch (error) {
    console.error('Connection test failed:', error);
    throw new Error(`Failed to connect to Prometheus: ${error.message}`);
  }
};

export default prometheusApi; 