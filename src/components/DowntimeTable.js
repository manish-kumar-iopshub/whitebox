import React, { useState, useEffect } from 'react';
import { formatDate } from '../utils/domainUtils';
import { getDowntimePeriods, getGroupDowntimePeriods } from '../services/prometheusApi';

const DowntimeTable = ({ target, timeRange, targets, onDebugInfo }) => {
  const [downtimes, setDowntimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [excludeShortDowntimes, setExcludeShortDowntimes] = useState(false);
  const [debugChunks, setDebugChunks] = useState([]);

  // Use the timeRange prop instead of custom state
  const effectiveTimeRange = timeRange || (() => {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    // Normalize timestamps to have 00 seconds to eliminate variability
    now.setSeconds(0, 0);
    twentyFourHoursAgo.setSeconds(0, 0);
    
    return {
      start: twentyFourHoursAgo,
      end: now
    };
  })();

  // Fetch real downtime data from Prometheus
  useEffect(() => {
    const fetchDowntimes = async () => {
      if (!target && !(targets && targets.length > 0)) return;
      setLoading(true);
      setError(null);
      setLoadingProgress('Initializing...');
      const chunkInfo = [];
      try {
        let downtimePeriods;
        
        // Progress tracking callback
        const handleProgress = (current, total, message, chunkParams) => {
          setLoadingProgress(`${current}/${total} API calls done: ${message}`);
          if (chunkParams) chunkInfo.push(chunkParams);
        };
        
        // Check if this is a group (contains multiple targets)
        if (targets && targets.length > 0) {
          setLoadingProgress(`Fetching data for ${targets.length} targets...`);
          downtimePeriods = await getGroupDowntimePeriods(targets, effectiveTimeRange.start, effectiveTimeRange.end, (current, total, message) => {
            // For debug info, collect chunk params
            handleProgress(current, total, message, {
              targets,
              start: effectiveTimeRange.start,
              end: effectiveTimeRange.end,
              message
            });
          });
        } else {
          setLoadingProgress('Fetching downtime data...');
          downtimePeriods = await getDowntimePeriods(target, effectiveTimeRange.start, effectiveTimeRange.end, (current, total, message) => {
            handleProgress(current, total, message, {
              target,
              start: effectiveTimeRange.start,
              end: effectiveTimeRange.end,
              message
            });
          });
        }
        
        setLoadingProgress('Processing data...');
        
        // Convert the downtime periods to the format expected by the component
        const formattedDowntimes = downtimePeriods.map((period, index) => ({
          id: `downtime-${period.start.getTime()}-${period.target || target}`,
          target: period.target || target,
          start: period.start,
          end: period.end,
          duration: period.duration * 60 * 1000, // Convert minutes to milliseconds
          annotation: {
            type: 'unplanned', // Default to unplanned, can be changed by user
            notes: ''
          }
        }));
        
        setDowntimes(formattedDowntimes);
        setLoadingProgress('');
        setDebugChunks(chunkInfo);
        if (onDebugInfo) onDebugInfo(chunkInfo);
      } catch (err) {
        console.error('Error fetching downtime data:', err);
        
        // Don't show error for timeout or connection issues, just show empty state
        if (err.code === 'ECONNABORTED' || err.message.includes('timeout') || err.message.includes('cancelled')) {
          console.warn('Request was cancelled or timed out, showing empty downtime data');
          setError(null);
          setDowntimes([]);
        } else {
          setError('Failed to load downtime data. Please check your Prometheus connection.');
          setDowntimes([]);
        }
        setLoadingProgress('');
        setDebugChunks([]);
        if (onDebugInfo) onDebugInfo([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDowntimes();
  }, [target, targets, effectiveTimeRange]);

  const handleAnnotationChange = (downtimeId, annotation) => {
    setDowntimes(prev => prev.map(d => 
      d.id === downtimeId ? { ...d, annotation } : d
    ));
  };

  // Filter downtimes based on type and duration threshold
  const filteredDowntimes = downtimes.filter(downtime => {
    const matchesType = filterType === 'all' || downtime.annotation?.type === filterType;
    const meetsDurationThreshold = !excludeShortDowntimes || downtime.duration > 120 * 1000; // 2 minutes in milliseconds
    
    return matchesType && meetsDurationThreshold;
  });

  const totalDowntimeDuration = filteredDowntimes.reduce((total, d) => total + d.duration, 0);
  const totalUptimeDuration = (effectiveTimeRange.end - effectiveTimeRange.start) - totalDowntimeDuration;
  const uptimePercentage = ((totalUptimeDuration / (effectiveTimeRange.end - effectiveTimeRange.start)) * 100);

  const formatDurationDetailed = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m ${seconds % 60}s`;
    if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const isGroup = targets && targets.length > 0;

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      marginBottom: '20px'
    }}>
      <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50' }}>
        Downtime History for {target}
      </h3>

      {/* Filter Controls */}
      <div style={{
        display: 'flex',
        gap: '15px',
        marginBottom: '20px',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#2c3e50' }}>
            Filter Type
          </label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: 'white'
            }}
          >
            <option value="all">All Downtimes</option>
            <option value="planned">Planned</option>
            <option value="unplanned">Unplanned</option>
          </select>
        </div>

        {/* Downtime Threshold Toggle */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          backgroundColor: '#f8f9fa',
          borderRadius: '6px',
          border: '1px solid #e9ecef'
        }}>
          <input
            type="checkbox"
            id="excludeShortDowntimes"
            checked={excludeShortDowntimes}
            onChange={(e) => setExcludeShortDowntimes(e.target.checked)}
            style={{
              width: '16px',
              height: '16px',
              cursor: 'pointer'
            }}
          />
          <label 
            htmlFor="excludeShortDowntimes"
            style={{
              fontSize: '14px',
              color: '#2c3e50',
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            Exclude ≤ 2 minute downtimes
          </label>
        </div>
      </div>

      {/* Error Display */}
      {error && (
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
      )}

      {/* Summary Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px',
        marginBottom: '20px'
      }}>
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '15px',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#e74c3c' }}>
            {filteredDowntimes.length}
          </div>
          <div style={{ fontSize: '14px', color: '#7f8c8d' }}>
            Downtime Events
            {excludeShortDowntimes && (
              <div style={{ fontSize: '12px', color: '#e74c3c', marginTop: '4px' }}>
                (excludes ≤2m)
              </div>
            )}
          </div>
        </div>
        
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '15px',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#e74c3c' }}>
            {formatDurationDetailed(totalDowntimeDuration)}
          </div>
          <div style={{ fontSize: '14px', color: '#7f8c8d' }}>Total Downtime</div>
        </div>
        
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '15px',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#27ae60' }}>
            {formatDurationDetailed(totalUptimeDuration)}
          </div>
          <div style={{ fontSize: '14px', color: '#7f8c8d' }}>Total Uptime</div>
        </div>
        
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '15px',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3498db' }}>
            {uptimePercentage.toFixed(2)}%
          </div>
          <div style={{ fontSize: '14px', color: '#7f8c8d' }}>Uptime Percentage</div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>⏳</div>
          <p style={{ color: '#7f8c8d' }}>{loadingProgress}</p>
        </div>
      ) : filteredDowntimes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>✅</div>
          <p style={{ color: '#7f8c8d' }}>
            {excludeShortDowntimes 
              ? 'No downtime periods longer than 2 minutes found in the selected time range'
              : 'No downtime periods found in the selected time range'
            }
          </p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                {isGroup && (
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd', fontSize: '14px' }}>
                    Target
                  </th>
                )}
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd', fontSize: '14px' }}>
                  Start Time
                </th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd', fontSize: '14px' }}>
                  End Time
                </th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd', fontSize: '14px' }}>
                  Duration
                </th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd', fontSize: '14px' }}>
                  Type
                </th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd', fontSize: '14px' }}>
                  Notes
                </th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd', fontSize: '14px' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredDowntimes.map((downtime) => (
                <tr key={downtime.id} style={{ borderBottom: '1px solid #eee' }}>
                  {isGroup && (
                    <td style={{ padding: '12px', fontSize: '14px', fontWeight: '500' }}>
                      {downtime.target}
                    </td>
                  )}
                  <td style={{ padding: '12px', fontSize: '14px' }}>
                    {formatDate(downtime.start)}
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>
                    {formatDate(downtime.end)}
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>
                    {formatDurationDetailed(downtime.duration)}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      backgroundColor: downtime.annotation?.type === 'planned' ? '#fff3cd' : '#f8d7da',
                      color: downtime.annotation?.type === 'planned' ? '#856404' : '#721c24'
                    }}>
                      {downtime.annotation?.type || 'unplanned'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>
                    {downtime.annotation?.notes || '-'}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <button
                      onClick={() => {
                        const type = prompt('Enter type (planned/unplanned):', downtime.annotation?.type || 'unplanned');
                        const notes = prompt('Enter notes:', downtime.annotation?.notes || '');
                        if (type) {
                          handleAnnotationChange(downtime.id, { type, notes });
                        }
                      }}
                      style={{
                        background: '#3498db',
                        border: 'none',
                        color: 'white',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}
                    >
                      Mark as {downtime.annotation?.type === 'planned' ? 'Unplanned' : 'Planned'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DowntimeTable; 