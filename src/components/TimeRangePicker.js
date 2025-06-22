import React, { useState, useEffect } from 'react';
import { TIME_RANGE_PRESETS, formatDateForInput, parseDateFromInput } from '../utils/domainUtils';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faClock, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { format } from 'date-fns';
import { DatePicker } from './ui/date-picker';

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

  const handleStartDateChange = (date) => {
    if (date) {
      // Preserve the time from the current pending start date
      const currentTime = pendingStartDate;
      const newDate = new Date(date);
      newDate.setHours(currentTime.getHours(), currentTime.getMinutes(), 0, 0);
      
      setPendingStartDate(newDate);
      setSelectedPreset('');
      setHasChanges(true);
    }
  };

  const handleEndDateChange = (date) => {
    if (date) {
      // Preserve the time from the current pending end date
      const currentTime = pendingEndDate;
      const newDate = new Date(date);
      newDate.setHours(currentTime.getHours(), currentTime.getMinutes(), 0, 0);
      
      setPendingEndDate(newDate);
      setSelectedPreset('');
      setHasChanges(true);
    }
  };

  const handleStartTimeChange = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const newDate = new Date(pendingStartDate);
    newDate.setHours(hours, minutes, 0, 0);
    setPendingStartDate(newDate);
    setSelectedPreset('');
    setHasChanges(true);
  };

  const handleEndTimeChange = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const newDate = new Date(pendingEndDate);
    newDate.setHours(hours, minutes, 0, 0);
    setPendingEndDate(newDate);
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

  const formatDateForDisplay = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Kolkata'
    });
  };

  const formatTimeForDisplay = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Kolkata'
    });
  };

  const getDurationText = (start, end) => {
    const diffMs = end - start;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
    }
  };

  const formatTimeForInput = (date) => {
    const istDate = new Date(date.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
    const hours = String(istDate.getHours()).padStart(2, '0');
    const minutes = String(istDate.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  return (
    <Card className="mb-6 shadow-sm border border-gray-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faCalendar} className="mr-2 h-4 w-4" />
            <CardTitle className="text-lg text-gray-900">Time Range</CardTitle>
          </div>
          {showTimezone && (
            <Badge variant="outline" className="text-xs">
              IST (Asia/Kolkata)
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selected Range Display */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faCalendar} className="mr-2 h-4 w-4" />
            <span className="text-sm font-medium text-gray-700">Selected Range:</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>{format(pendingStartDate, "PPP")}</span>
            <FontAwesomeIcon icon={faChevronRight} className="h-4 w-4" />
            <span>{format(pendingEndDate, "PPP")}</span>
            <Badge variant="secondary" className="ml-2">
              {getDurationText(pendingStartDate, pendingEndDate)}
            </Badge>
          </div>
        </div>

        {/* Preset Buttons */}
        {showPresets && (
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Quick Presets</label>
            <div className="flex flex-wrap gap-2">
              {TIME_RANGE_PRESETS.map(preset => (
                <Button
                  key={preset.value}
                  variant={selectedPreset === preset.value ? 'default' : 'outline'}
                  onClick={() => handlePresetClick(preset)}
                  size="sm"
                  className="text-xs"
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Custom Date/Time Inputs */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">Custom Range</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-gray-600">Start Date</label>
              <DatePicker
                date={pendingStartDate}
                onDateChange={handleStartDateChange}
                placeholder="Select start date"
              />
              <label className="text-xs text-gray-600">Start Time</label>
              <Input
                type="time"
                value={formatTimeForInput(pendingStartDate)}
                onChange={(e) => handleStartTimeChange(e.target.value)}
                className={hasChanges ? 'border-blue-500 ring-2 ring-blue-200' : ''}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-gray-600">End Date</label>
              <DatePicker
                date={pendingEndDate}
                onDateChange={handleEndDateChange}
                placeholder="Select end date"
              />
              <label className="text-xs text-gray-600">End Time</label>
              <Input
                type="time"
                value={formatTimeForInput(pendingEndDate)}
                onChange={(e) => handleEndTimeChange(e.target.value)}
                className={hasChanges ? 'border-blue-500 ring-2 ring-blue-200' : ''}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {hasChanges && (
          <div className="flex gap-2 pt-2">
            <Button onClick={handleApplyChanges} variant="default" size="sm">
              Apply Changes
            </Button>
            <Button onClick={handleCancelChanges} variant="outline" size="sm">
              Cancel
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TimeRangePicker; 