import React, { useState, useEffect } from 'react';
import { TIME_RANGE_PRESETS, formatDateForInput, parseDateFromInput } from '../utils/domainUtils';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';

const TimeRangePicker = ({ 
  onTimeRangeChange, 
  initialStart, 
  initialEnd,
  showPresets = true,
  showTimezone = true 
}) => {
  const [startDate, setStartDate] = useState(initialStart || new Date(Date.now() - 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState(initialEnd || new Date());
  const [selectedPreset, setSelectedPreset] = useState('');
  const [pendingStartDate, setPendingStartDate] = useState(startDate);
  const [pendingEndDate, setPendingEndDate] = useState(endDate);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (initialStart && initialEnd) {
      setStartDate(initialStart);
      setEndDate(initialEnd);
      setPendingStartDate(initialStart);
      setPendingEndDate(initialEnd);
    }
  }, [initialStart, initialEnd]);

  const handleStartDateChange = (dateString) => {
    const newStartDate = parseDateFromInput(dateString);
    setPendingStartDate(newStartDate);
    setSelectedPreset('');
    setHasChanges(true);
  };

  const handleEndDateChange = (dateString) => {
    const newEndDate = parseDateFromInput(dateString);
    setPendingEndDate(newEndDate);
    setSelectedPreset('');
    setHasChanges(true);
  };

  const handlePresetClick = (preset) => {
    const now = new Date();
    const start = new Date(now.getTime() - (preset.hours * 60 * 60 * 1000));
    setStartDate(start);
    setEndDate(now);
    setPendingStartDate(start);
    setPendingEndDate(now);
    setSelectedPreset(preset.value);
    setHasChanges(false);
    onTimeRangeChange(start, now);
  };

  const handleApplyChanges = () => {
    setStartDate(pendingStartDate);
    setEndDate(pendingEndDate);
    setHasChanges(false);
    onTimeRangeChange(pendingStartDate, pendingEndDate);
  };

  const handleCancelChanges = () => {
    setPendingStartDate(startDate);
    setPendingEndDate(endDate);
    setHasChanges(false);
  };

  const getCurrentTimezone = () => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  };

  return (
    <Card className="mb-6 shadow-sm border border-gray-200">
      <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4 mb-2">
        <CardTitle className="text-lg text-gray-900">Time Range</CardTitle>
        {showTimezone && (
          <div className="text-xs text-gray-600 bg-gray-100 px-3 py-1 rounded-md border border-gray-200">Timezone: {getCurrentTimezone()}</div>
        )}
      </CardHeader>
      <CardContent>
        {showPresets && (
          <div className="flex flex-wrap gap-2 mb-4">
            {TIME_RANGE_PRESETS.map(preset => (
              <Button
                key={preset.value}
                variant={selectedPreset === preset.value ? 'default' : 'secondary'}
                onClick={() => handlePresetClick(preset)}
                size="sm"
              >
                {preset.label}
              </Button>
            ))}
          </div>
        )}
        <div className="flex flex-wrap gap-4 items-end mb-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">Start Date & Time</label>
            <Input
              type="datetime-local"
              value={formatDateForInput(pendingStartDate)}
              onChange={(e) => handleStartDateChange(e.target.value)}
              className={hasChanges ? 'border-blue-500 ring-2 ring-blue-200' : ''}
              minWidth={200}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">End Date & Time</label>
            <Input
              type="datetime-local"
              value={formatDateForInput(pendingEndDate)}
              onChange={(e) => handleEndDateChange(e.target.value)}
              className={hasChanges ? 'border-blue-500 ring-2 ring-blue-200' : ''}
              minWidth={200}
            />
          </div>
          <div className="text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded-md border border-gray-200 min-w-[150px]">
            <div className="font-medium mb-1">{hasChanges ? 'Pending Range:' : 'Current Range:'}</div>
            <div>{formatDateForInput(pendingStartDate)}</div>
            <div>to</div>
            <div>{formatDateForInput(pendingEndDate)}</div>
          </div>
          {hasChanges && (
            <div className="flex gap-2 items-end">
              <Button onClick={handleApplyChanges} variant="default" size="sm">Apply Changes</Button>
              <Button onClick={handleCancelChanges} variant="secondary" size="sm">Cancel</Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TimeRangePicker; 