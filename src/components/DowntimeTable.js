import React, { useState, useEffect } from 'react';
import { formatDate } from '../utils/domainUtils';
import { getDowntimePeriods, getGroupDowntimePeriods } from '../services/prometheusApi';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from './ui/table';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

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
            type: 'unplanned',
            notes: ''
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
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Downtime History for {isGroup ? `${targets.length} targets` : target}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 mb-6 items-center">
          <div>
            <label className="block mb-1 text-sm font-medium">Filter Type</label>
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
          <div className="flex items-center gap-2 p-2 bg-muted rounded-md border">
            <input
              type="checkbox"
              id="excludeShortDowntimes"
              checked={excludeShortDowntimes}
              onChange={(e) => setExcludeShortDowntimes(e.target.checked)}
              className="accent-discord-blurple"
            />
            <label htmlFor="excludeShortDowntimes" className="text-sm cursor-pointer">
              Exclude downtimes ≤ 2 minutes
            </label>
          </div>
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="text-lg mb-2">⏳</div>
            <p className="text-muted-foreground">{loadingProgress || 'Loading downtime data...'}</p>
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-lg mb-4 border border-destructive/20">
            <strong>Error:</strong> {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-discord-blurple">{filteredDowntimes.length}</div>
                <div className="text-sm text-muted-foreground">Downtime Events</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-discord-red">{formatDurationDetailed(totalDowntimeDuration)}</div>
                <div className="text-sm text-muted-foreground">Total Downtime</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-discord-green">{uptimePercentage.toFixed(2)}%</div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </div>
            </div>

            {filteredDowntimes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No downtime events found for the selected criteria.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Target</TableHead>
                    <TableHead>Start Time</TableHead>
                    <TableHead>End Time</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDowntimes.map((downtime) => (
                    <TableRow key={downtime.id}>
                      <TableCell className="font-medium">{downtime.target}</TableCell>
                      <TableCell>{formatDate(downtime.start)}</TableCell>
                      <TableCell>{formatDate(downtime.end)}</TableCell>
                      <TableCell>{formatDurationDetailed(downtime.duration)}</TableCell>
                      <TableCell>
                        <Badge variant={downtime.annotation?.type === 'planned' ? 'default' : 'destructive'}>
                          {downtime.annotation?.type || 'unplanned'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <input
                          type="text"
                          value={downtime.annotation?.notes || ''}
                          onChange={(e) => handleAnnotationChange(downtime.id, {
                            ...downtime.annotation,
                            notes: e.target.value
                          })}
                          placeholder="Add notes..."
                          className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-discord-blurple"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default DowntimeTable; 