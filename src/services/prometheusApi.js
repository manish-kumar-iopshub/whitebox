import axios from 'axios';

// const PROMETHEUS_BASE_URL = process.env.REACT_APP_PROMETHEUS_URL || 'http://localhost:9090';
const PROMETHEUS_BASE_URL = window.env.REACT_APP_PROMETHEUS_URL || 'http://localhost:9090';
  

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

// Helper function to format time range with normalized seconds
const formatTimeRange = (start, end) => {
  // Normalize timestamps to have 00 seconds to eliminate variability
  const startDate = new Date(start);
  const endDate = new Date(end);
  
  // Set seconds to 00 and milliseconds to 000
  startDate.setSeconds(0, 0);
  endDate.setSeconds(0, 0);
  
  const startTime = Math.floor(startDate.getTime() / 1000);
  const endTime = Math.floor(endDate.getTime() / 1000);
  
  return { start: startTime, end: endTime };
};

// Helper function to create precise day-based chunks
const createDayBasedChunks = (startTime, endTime) => {
  const chunks = [];
  const startDate = new Date(startTime * 1000);
  
  // Always create at least 2 chunks, splitting at day boundaries
  // Even for single day ranges, split at midnight
  
  let currentStart = startTime;
  let currentDate = new Date(startDate);
  
  while (currentStart < endTime) {
    // Calculate the end of the current day (00:00:00 of next day)
    const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() + 1);
    nextDay.setHours(0, 0, 0, 0);
    
    const dayEnd = Math.floor(nextDay.getTime() / 1000);
    const chunkEnd = Math.min(dayEnd, endTime);
    
    chunks.push({ start: currentStart, end: chunkEnd });
    
    // Move to next day
    currentStart = chunkEnd;
    currentDate = nextDay;
  }
  
  return chunks;
};

// Helper function to calculate optimal step size with consistency
// const calculateOptimalStep = (startTime, endTime, maxPoints = 10000) => {
//   const duration = endTime - startTime;
//   const optimalStep = Math.ceil(duration / maxPoints);
//   
//   // Use consistent step sizes: 1m, 5m, 15m, 1h, 6h, 1d
//   const stepSizes = [60, 300, 900, 3600, 21600, 86400];
//   
//   // Find the smallest step size that's >= optimalStep
//   for (const step of stepSizes) {
//     if (step >= optimalStep) {
//       return step;
//     }
//   }
//   
//   // If optimalStep is larger than any predefined step, use the largest
//   return stepSizes[stepSizes.length - 1];
// };

// Helper function to chunk time ranges (legacy - keeping for compatibility)
// const chunkTimeRange = (startTime, endTime, maxChunkDuration = 7 * 24 * 3600) => { // 7 days max per chunk
//   const chunks = [];
//   let currentStart = startTime;
//   
//   while (currentStart < endTime) {
//     const chunkEnd = Math.min(currentStart + maxChunkDuration, endTime);
//     chunks.push({ start: currentStart, end: chunkEnd });
//     currentStart = chunkEnd;
//   }
//   
//   return chunks;
// };

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

// Get downtime periods for a target with progress tracking
export const getDowntimePeriods = async (target, start, end, onProgress = null) => {
  try {
    const { start: startTime, end: endTime } = formatTimeRange(start, end);
    
    console.log(`Fetching downtime for ${target} from ${new Date(startTime * 1000).toISOString()} to ${new Date(endTime * 1000).toISOString()}`);
    
    // Use a fixed 1-minute step for maximum accuracy and consistency
    const step = 60; // 1 minute
    
    // Create day-based chunks
    const chunks = createDayBasedChunks(startTime, endTime);
    console.log(`Created ${chunks.length} day-based chunks`);
    
    let allDowntimePeriods = [];
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const chunkStartDate = new Date(chunk.start * 1000);
      const chunkEndDate = new Date(chunk.end * 1000);
      
      console.log(`Processing chunk ${i + 1}/${chunks.length}: ${chunkStartDate.toISOString()} to ${chunkEndDate.toISOString()}`);
      
      // Report progress
      if (onProgress) {
        onProgress(i + 1, chunks.length, `Fetching chunk ${i + 1}/${chunks.length}: ${chunkStartDate.toLocaleDateString()} ${chunkStartDate.toLocaleTimeString()} - ${chunkEndDate.toLocaleTimeString()}`);
      }
      
      try {
        const response = await prometheusApi.get('/api/v1/query_range', {
          params: {
            query: `probe_success{instance="${target}"}`,
            start: chunk.start,
            end: chunk.end,
            step: step,
          },
          timeout: 60000, // 60 second timeout for accurate data
        });

        const chunkDowntimes = processDowntimeDataAccurate(response.data.data.result[0]?.values || [], chunk.start, chunk.end);
        allDowntimePeriods = allDowntimePeriods.concat(chunkDowntimes);
        
        console.log(`Chunk ${i + 1} completed, found ${chunkDowntimes.length} downtime periods`);
      } catch (chunkError) {
        console.error(`Failed to fetch chunk ${i + 1}:`, chunkError);
        // Don't continue if a chunk fails - we need complete data for consistency
        throw chunkError;
      }
    }

    console.log(`Total downtime periods found: ${allDowntimePeriods.length}`);
    
    // Ensure no duplicates and consistent ordering
    const uniqueDowntimes = removeDuplicateDowntimes(allDowntimePeriods);
    console.log(`After deduplication: ${uniqueDowntimes.length} downtime periods`);
    
    // Report completion
    if (onProgress) {
      onProgress(chunks.length, chunks.length, `Completed: Found ${uniqueDowntimes.length} downtime periods`);
    }
    
    return uniqueDowntimes.sort((a, b) => a.start.getTime() - b.start.getTime());
  } catch (error) {
    console.error('Error fetching downtime periods:', error);
    throw error; // Re-throw to let the UI handle it properly
  }
};

// More accurate downtime data processing
const processDowntimeDataAccurate = (values, startTime, endTime) => {
  const downtimePeriods = [];
  
  if (values.length === 0) {
    return downtimePeriods;
  }

  // Ensure data is sorted by timestamp
  const sortedValues = values.sort((a, b) => parseInt(a[0]) - parseInt(b[0]));
  
  let currentDowntimeStart = null;
  let lastTimestamp = null;
  
  for (let i = 0; i < sortedValues.length; i++) {
    const [timestamp, value] = sortedValues[i];
    const timestampInt = parseInt(timestamp);
    const isDown = value === '0';
    
    // Skip if this is the same timestamp as the last one (shouldn't happen with 1-minute step)
    if (lastTimestamp === timestampInt) {
      continue;
    }
    
    if (isDown && currentDowntimeStart === null) {
      // Start of a new downtime period
      currentDowntimeStart = timestampInt;
    } else if (!isDown && currentDowntimeStart !== null) {
      // End of a downtime period - service came back up
      const downtimeEnd = timestampInt;
      const duration = (downtimeEnd - currentDowntimeStart) / 60; // Duration in minutes
      
      if (duration > 0) {
        downtimePeriods.push({
          start: new Date(currentDowntimeStart * 1000),
          end: new Date(downtimeEnd * 1000),
          duration: duration,
        });
      }
      currentDowntimeStart = null;
    }
    
    lastTimestamp = timestampInt;
  }
  
  // Handle case where downtime extends to the end of the time range
  if (currentDowntimeStart !== null) {
    const duration = (endTime - currentDowntimeStart) / 60;
    
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

// Remove duplicate downtime periods
const removeDuplicateDowntimes = (downtimes) => {
  const seen = new Set();
  return downtimes.filter(downtime => {
    const key = `${downtime.start.getTime()}-${downtime.end.getTime()}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
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

// Get downtime periods for multiple targets (group) with progress tracking
export const getGroupDowntimePeriods = async (targets, start, end, onProgress = null) => {
  try {
    const { start: startTime, end: endTime } = formatTimeRange(start, end);
    
    console.log(`Fetching group downtime for ${targets.length} targets from ${new Date(startTime * 1000).toISOString()} to ${new Date(endTime * 1000).toISOString()}`);
    
    // Use a fixed 1-minute step for maximum accuracy and consistency
    const step = 60; // 1 minute
    
    // Create day-based chunks
    const chunks = createDayBasedChunks(startTime, endTime);
    console.log(`Created ${chunks.length} day-based chunks for group`);
    
    let allDowntimePeriods = [];
    let totalCalls = targets.length * chunks.length;
    let completedCalls = 0;
    
    // Process each target separately to avoid chunk boundary issues
    for (const target of targets) {
      console.log(`Processing target: ${target}`);
      
      // Prepare all API calls for this target
      const targetPromises = [];
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const chunkStartDate = new Date(chunk.start * 1000);
        const chunkEndDate = new Date(chunk.end * 1000);
        
        targetPromises.push(
          (async () => {
            if (onProgress) {
              onProgress(
                ++completedCalls,
                totalCalls,
                `Fetching [${target}] chunk ${i + 1}/${chunks.length}: ${chunkStartDate.toLocaleDateString()} ${chunkStartDate.toLocaleTimeString()} - ${chunkEndDate.toLocaleTimeString()}`,
                {
                  target,
                  start: chunk.start,
                  end: chunk.end,
                  message: `Fetching [${target}] chunk ${i + 1}/${chunks.length}`
                }
              );
            }
            try {
              const response = await prometheusApi.get('/api/v1/query_range', {
                params: {
                  query: `probe_success{instance="${target}"}`,
                  start: chunk.start,
                  end: chunk.end,
                  step: step,
                },
                timeout: 60000,
              });
              return {
                chunkIndex: i,
                values: response.data.data.result[0]?.values || [],
                chunkStart: chunk.start,
                chunkEnd: chunk.end
              };
            } catch (chunkError) {
              console.error(`Failed to fetch [${target}] chunk ${i + 1}:`, chunkError);
              return {
                chunkIndex: i,
                values: [],
                chunkStart: chunk.start,
                chunkEnd: chunk.end
              };
            }
          })()
        );
      }
      
      // Wait for all chunks for this target to complete
      const targetResults = await Promise.all(targetPromises);
      
      // Sort results by chunk index to maintain chronological order
      targetResults.sort((a, b) => a.chunkIndex - b.chunkIndex);
      
      // Merge all data points for this target across all chunks
      const allValues = [];
      for (const result of targetResults) {
        allValues.push(...result.values);
      }
      
      // Process the merged data for this target
      const targetDowntimePeriods = processDowntimeDataAccurate(allValues, startTime, endTime)
        .map(period => ({ ...period, target }));
      
      allDowntimePeriods.push(...targetDowntimePeriods);
      console.log(`Target ${target}: Found ${targetDowntimePeriods.length} downtime periods`);
    }
    
    console.log(`Total group downtime periods found: ${allDowntimePeriods.length}`);
    
    // Ensure no duplicates and consistent ordering
    const uniqueDowntimes = removeDuplicateGroupDowntimes(allDowntimePeriods);
    console.log(`After deduplication: ${uniqueDowntimes.length} group downtime periods`);
    
    // Report completion
    if (onProgress) {
      onProgress(totalCalls, totalCalls, `Completed: Found ${uniqueDowntimes.length} group downtime periods`);
    }
    
    // Sort by start time (most recent first)
    return uniqueDowntimes.sort((a, b) => b.start.getTime() - a.start.getTime());
  } catch (error) {
    console.error('Error fetching group downtime periods:', error);
    throw error; // Re-throw to let the UI handle it properly
  }
};

// More accurate group downtime data processing
// const processGroupDowntimeDataAccurate = (results, startTime, endTime, targets) => {
//   const downtimePeriods = [];
//   
//   // Process each target's data
//   results.forEach(result => {
//     const target = result.metric.instance;
//     const values = result.values || [];
//     
//     if (values.length === 0) return;

//     let currentDowntimeStart = null;
//     let lastTimestamp = null;
//     
//     for (let i = 0; i < values.length; i++) {
//       const [timestamp, value] = values[i];
//       const timestampInt = parseInt(timestamp);
//       const isDown = value === '0';
//       
//       // Skip if this is the same timestamp as the last one
//       if (lastTimestamp === timestampInt) {
//         continue;
//       }
//       
//       if (isDown && currentDowntimeStart === null) {
//         // Start of a new downtime period
//         currentDowntimeStart = timestampInt;
//       } else if (!isDown && currentDowntimeStart !== null) {
//         // End of a downtime period - service came back up
//         const downtimeEnd = timestampInt;
//         const duration = (downtimeEnd - currentDowntimeStart) / 60; // Duration in minutes
//         
//         if (duration > 0) {
//           downtimePeriods.push({
//             target: target,
//             start: new Date(currentDowntimeStart * 1000),
//             end: new Date(downtimeEnd * 1000),
//             duration: duration,
//           });
//         }
//         currentDowntimeStart = null;
//       }
//       
//       lastTimestamp = timestampInt;
//     }
//     
//     // Handle case where downtime extends to the end of the time range
//     if (currentDowntimeStart !== null) {
//       const duration = (endTime - currentDowntimeStart) / 60;
//       
//       if (duration > 0) {
//         downtimePeriods.push({
//           target: target,
//           start: new Date(currentDowntimeStart * 1000),
//           end: new Date(endTime * 1000),
//           duration: duration,
//         });
//       }
//     }
//   });

//   return downtimePeriods;
// };

// Remove duplicate group downtime periods
const removeDuplicateGroupDowntimes = (downtimes) => {
  const seen = new Set();
  return downtimes.filter(downtime => {
    const key = `${downtime.start.getTime()}-${downtime.end.getTime()}-${downtime.target}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
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

// Fetch chunked data for charts with progress tracking
const fetchChunkedData = async (targets, startTime, endTime, metric, onProgress = null) => {
  // Create day-based chunks
  const chunks = createDayBasedChunks(
    Math.floor(startTime.getTime() / 1000), 
    Math.floor(endTime.getTime() / 1000)
  );
  
  console.log(`Created ${chunks.length} day-based chunks for chart data`);
  
  const allData = [];
  
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const chunkStartDate = new Date(chunk.start * 1000);
    const chunkEndDate = new Date(chunk.end * 1000);
    
    console.log(`Processing chart chunk ${i + 1}/${chunks.length}: ${chunkStartDate.toISOString()} to ${chunkEndDate.toISOString()}`);
    
    // Report progress
    if (onProgress) {
      onProgress(i + 1, chunks.length, `Fetching chart chunk ${i + 1}/${chunks.length}: ${chunkStartDate.toLocaleDateString()} ${chunkStartDate.toLocaleTimeString()} - ${chunkEndDate.toLocaleTimeString()}`);
    }
    
    try {
      const step = Math.max(60, Math.floor((chunk.end - chunk.start) / 1000)); // Max 1000 points
      
      const response = await prometheusApi.get('/api/v1/query_range', {
        params: {
          query: `avg_over_time(${metric}{instance=~"${targets.join('|')}"}[1m])`,
          start: chunk.start,
          end: chunk.end,
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
      console.error(`Error fetching chart chunk ${i + 1}:`, error);
    }
  }

  // Report completion
  if (onProgress) {
    onProgress(chunks.length, chunks.length, `Completed: Fetched ${allData.length} data points`);
  }

  return allData.sort((a, b) => a.timestamp - b.timestamp);
};

// Fetch uptime data for charts with progress tracking
export const fetchUptimeData = async (targets, startTime, endTime, onProgress = null) => {
  try {
    const data = await fetchChunkedData(targets, startTime, endTime, 'probe_success', onProgress);
    
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

// Fetch response time data for charts with progress tracking
export const fetchResponseTimeData = async (targets, startTime, endTime, onProgress = null) => {
  try {
    const data = await fetchChunkedData(targets, startTime, endTime, 'probe_duration_seconds', onProgress);
    
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