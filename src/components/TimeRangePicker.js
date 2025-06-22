import React, { useState, useEffect } from 'react';
import { TIME_RANGE_PRESETS, formatDateForInput, parseDateFromInput } from '../utils/domainUtils';

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
    setSelectedPreset(''); // Clear preset when manually selecting
    setHasChanges(true);
  };

  const handleEndDateChange = (dateString) => {
    const newEndDate = parseDateFromInput(dateString);
    setPendingEndDate(newEndDate);
    setSelectedPreset(''); // Clear preset when manually selecting
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
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      marginBottom: '20px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        <h3 style={{ margin: 0, color: '#2c3e50' }}>Time Range</h3>
        {showTimezone && (
          <div style={{
            fontSize: '14px',
            color: '#7f8c8d',
            backgroundColor: '#f8f9fa',
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid #e9ecef'
          }}>
            Timezone: {getCurrentTimezone()}
          </div>
        )}
      </div>

      {/* Time Range Presets */}
      {showPresets && (
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '20px',
          flexWrap: 'wrap'
        }}>
          {TIME_RANGE_PRESETS.map(preset => (
            <button
              key={preset.value}
              onClick={() => handlePresetClick(preset)}
              style={{
                background: selectedPreset === preset.value ? '#3498db' : '#f8f9fa',
                color: selectedPreset === preset.value ? 'white' : '#2c3e50',
                border: '1px solid #e9ecef',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (selectedPreset !== preset.value) {
                  e.target.style.backgroundColor = '#e9ecef';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedPreset !== preset.value) {
                  e.target.style.backgroundColor = '#f8f9fa';
                }
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}

      {/* Custom Date Range Inputs */}
      <div style={{
        display: 'flex',
        gap: '15px',
        alignItems: 'flex-end',
        flexWrap: 'wrap'
      }}>
        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontSize: '14px', 
            color: '#2c3e50',
            fontWeight: '500'
          }}>
            Start Date & Time
          </label>
          <input
            type="datetime-local"
            value={formatDateForInput(pendingStartDate)}
            onChange={(e) => handleStartDateChange(e.target.value)}
            style={{
              padding: '10px 12px',
              border: hasChanges ? '2px solid #3498db' : '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px',
              minWidth: '200px'
            }}
          />
        </div>
        
        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontSize: '14px', 
            color: '#2c3e50',
            fontWeight: '500'
          }}>
            End Date & Time
          </label>
          <input
            type="datetime-local"
            value={formatDateForInput(pendingEndDate)}
            onChange={(e) => handleEndDateChange(e.target.value)}
            style={{
              padding: '10px 12px',
              border: hasChanges ? '2px solid #3498db' : '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px',
              minWidth: '200px'
            }}
          />
        </div>

        <div style={{
          fontSize: '12px',
          color: '#7f8c8d',
          backgroundColor: '#f8f9fa',
          padding: '10px 12px',
          borderRadius: '6px',
          border: '1px solid #e9ecef',
          minWidth: '150px'
        }}>
          <div style={{ fontWeight: '500', marginBottom: '4px' }}>
            {hasChanges ? 'Pending Range:' : 'Current Range:'}
          </div>
          <div>{formatDateForInput(pendingStartDate)}</div>
          <div>to</div>
          <div>{formatDateForInput(pendingEndDate)}</div>
        </div>

        {/* Confirmation Buttons */}
        {hasChanges && (
          <div style={{
            display: 'flex',
            gap: '10px',
            alignItems: 'flex-end'
          }}>
            <button
              onClick={handleApplyChanges}
              style={{
                background: '#27ae60',
                color: 'white',
                border: 'none',
                padding: '10px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Apply Changes
            </button>
            <button
              onClick={handleCancelChanges}
              style={{
                background: '#95a5a6',
                color: 'white',
                border: 'none',
                padding: '10px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeRangePicker; 