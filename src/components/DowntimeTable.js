import React, { useState, useEffect } from 'react';
import { formatDate } from '../utils/domainUtils';
import { getDowntimePeriods, getGroupDowntimePeriods } from '../services/prometheusApi';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from './ui/table';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faClock, faBolt, faFileAlt } from '@fortawesome/free-solid-svg-icons';

const DowntimeTable = ({ target, timeRange, targets, onDebugInfo }) => {
  const [downtimes, setDowntimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [excludeShortDowntimes, setExcludeShortDowntimes] = useState(false);

  const effectiveTimeRange = timeRange || (() => {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    now.setSeconds(0, 0);
    twentyFourHoursAgo.setSeconds(0, 0);
    return {
      start: twentyFourHoursAgo,
      end: now
    };
  })();

  useEffect(() => {
    const fetchDowntimes = async () => {
      if (!target && !(targets && targets.length > 0)) return;
      setLoading(true);
      setError(null);
      setLoadingProgress('Initializing...');
      const chunkInfo = [];
      try {
        let downtimePeriods;
        const handleProgress = (current, total, message, chunkParams) => {
          setLoadingProgress(`${current}/${total} API calls done: ${message}`);
          if (chunkParams) chunkInfo.push(chunkParams);
        };
        
        if (targets && targets.length > 0) {
          setLoadingProgress(`Fetching data for ${targets.length} targets...`);
          downtimePeriods = await getGroupDowntimePeriods(targets, effectiveTimeRange.start, effectiveTimeRange.end, (current, total, message) => {
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
        const formattedDowntimes = downtimePeriods.map((period, index) => ({
          id: `downtime-${period.start.getTime()}-${period.target || target}`,
          target: period.target || target,
          start: period.start,
          end: period.end,
          duration: period.duration * 60 * 1000,
          annotation: {
            type: 'unplanned'
          }
        }));
        
        setDowntimes(formattedDowntimes);
        setLoadingProgress('');
        if (onDebugInfo) onDebugInfo(chunkInfo);
      } catch (err) {
        console.error('Error fetching downtime data:', err);
        if (err.code === 'ECONNABORTED' || err.message.includes('timeout') || err.message.includes('cancelled')) {
          console.warn('Request was cancelled or timed out, showing empty downtime data');
          setError(null);
          setDowntimes([]);
        } else {
          setError('Failed to load downtime data. Please check your Prometheus connection.');
          setDowntimes([]);
        }
        setLoadingProgress('');
        if (onDebugInfo) onDebugInfo([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDowntimes();
  }, [target, targets, effectiveTimeRange, onDebugInfo]);

  const handleTypeToggle = (downtimeId) => {
    setDowntimes(prev => prev.map(d => {
      if (d.id === downtimeId) {
        const newType = d.annotation?.type === 'planned' ? 'unplanned' : 'planned';
        return {
          ...d,
          annotation: {
            ...d.annotation,
            type: newType
          }
        };
      }
      return d;
    }));
  };

  // Filter downtimes based on type and duration threshold
  const filteredDowntimes = downtimes.filter(downtime => {
    const matchesType = filterType === 'all' || downtime.annotation?.type === filterType;
    const meetsDurationThreshold = !excludeShortDowntimes || downtime.duration > 120 * 1000; // 2 minutes in milliseconds
    
    return matchesType && meetsDurationThreshold;
  });

  // Calculate uptime excluding planned downtimes
  const unplannedDowntimeDuration = filteredDowntimes
    .filter(d => d.annotation?.type === 'unplanned')
    .reduce((total, d) => total + d.duration, 0);
  
  const totalUptimeDuration = (effectiveTimeRange.end - effectiveTimeRange.start) - unplannedDowntimeDuration;
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

  const generateReport = () => {
    // Calculate total downtime duration
    const totalDowntimeDuration = filteredDowntimes.reduce((total, d) => total + d.duration, 0);
    
    // Calculate uptime percentage
    const totalTimeRange = effectiveTimeRange.end - effectiveTimeRange.start;
    const uptimePercentage = ((totalTimeRange - totalDowntimeDuration) / totalTimeRange) * 100;
    
    // Prepare CSV data
    const csvData = [
      [`downtime event count: ${filteredDowntimes.length}`],
      [`unplanned downtime: ${formatDurationDetailed(unplannedDowntimeDuration)}`],
      [`total downtime: ${formatDurationDetailed(totalDowntimeDuration)}`],
      [`uptime percentage: ${uptimePercentage.toFixed(2)}%`],
      [''], // Empty line
      ['target', 'start time', 'end time', 'duration', 'type'],
      ['---', '---', '---', '---', '---'],
      ...filteredDowntimes.map(downtime => [
        downtime.target,
        formatDate(downtime.start),
        formatDate(downtime.end),
        formatDurationDetailed(downtime.duration),
        downtime.annotation?.type || 'unplanned'
      ])
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const targetName = isGroup ? `${targets.length}_targets` : target;
    a.download = `downtime_report_${targetName}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const isGroup = targets && targets.length > 0;

  return (
    <Card className="mb-6 shadow-sm border border-gray-200">
      <CardHeader>
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faExclamationTriangle} className="h-5 w-5 text-red-600" />
          <CardTitle className="text-gray-900">Downtime History for {isGroup ? `${targets.length} targets` : target}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filter Controls */}
        <div className="flex flex-wrap gap-4 items-end">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Filter Type</label>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Downtimes</SelectItem>
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="unplanned">Unplanned</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <input
              type="checkbox"
              id="excludeShortDowntimes"
              checked={excludeShortDowntimes}
              onChange={(e) => setExcludeShortDowntimes(e.target.checked)}
              className="accent-blue-600"
            />
            <label htmlFor="excludeShortDowntimes" className="text-sm text-gray-700 cursor-pointer">
              Exclude downtimes ≤ 2 minutes
            </label>
          </div>
        </div>

        {loading && (
          <div className="text-center py-8">
            <FontAwesomeIcon icon={faClock} className="text-2xl mb-2 text-blue-600" />
            <p className="text-gray-600">{loadingProgress || 'Loading downtime data...'}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">
            <strong>Error:</strong> {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">{filteredDowntimes.length}</div>
                <div className="text-sm text-gray-600">Downtime Events</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="text-2xl font-bold text-red-600">{formatDurationDetailed(unplannedDowntimeDuration)}</div>
                <div className="text-sm text-gray-600">Unplanned Downtime</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-600">{uptimePercentage.toFixed(2)}%</div>
                <div className="text-sm text-gray-600">Uptime (Excluding Planned)</div>
              </div>
            </div>

            {filteredDowntimes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FontAwesomeIcon icon={faClock} className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No downtime events found for the selected criteria.</p>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="text-gray-700">Target</TableHead>
                      <TableHead className="text-gray-700">Start Time</TableHead>
                      <TableHead className="text-gray-700">End Time</TableHead>
                      <TableHead className="text-gray-700">Duration</TableHead>
                      <TableHead className="text-gray-700 w-32">Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDowntimes.map((downtime) => (
                      <TableRow key={downtime.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium text-gray-900">{downtime.target}</TableCell>
                        <TableCell className="text-gray-600">{formatDate(downtime.start)}</TableCell>
                        <TableCell className="text-gray-600">{formatDate(downtime.end)}</TableCell>
                        <TableCell className="text-gray-600 font-mono">{formatDurationDetailed(downtime.duration)}</TableCell>
                        <TableCell className="w-32">
                          <Button
                            variant={downtime.annotation?.type === 'planned' ? 'default' : 'destructive'}
                            size="sm"
                            onClick={() => handleTypeToggle(downtime.id)}
                            className="cursor-pointer w-full"
                          >
                            {downtime.annotation?.type || 'unplanned'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Generate Report Button */}
            {filteredDowntimes.length > 0 && (
              <div className="flex justify-center mt-6">
                <Button 
                  onClick={generateReport} 
                  variant="default" 
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  <FontAwesomeIcon icon={faFileAlt} className="h-4 w-4" />
                  Generate Report
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default DowntimeTable; 