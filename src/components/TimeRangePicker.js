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

  useEffect(() => {
    if (initialStart && initialEnd) {
      setStartDate(initialStart);
      setEndDate(initialEnd);
    }
  }, [initialStart, initialEnd]);

  const handleStartDateChange = (dateString) => {
    const newStartDate = parseDateFromInput(dateString);
    setStartDate(newStartDate);
    setSelectedPreset(''); // Clear preset when manually selecting
    onTimeRangeChange(newStartDate, endDate);
  };

  const handleEndDateChange = (dateString) => {
    const newEndDate = parseDateFromInput(dateString);
    setEndDate(newEndDate);
    setSelectedPreset(''); // Clear preset when manually selecting
    onTimeRangeChange(startDate, newEndDate);
  };

  const handlePresetClick = (preset) => {
    const now = new Date();
    const start = new Date(now.getTime() - (preset.hours * 60 * 60 * 1000));
    
    setStartDate(start);
    setEndDate(now);
    setSelectedPreset(preset.value);
    onTimeRangeChange(start, now);
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
            value={formatDateForInput(startDate)}
            onChange={(e) => handleStartDateChange(e.target.value)}
            style={{
              padding: '10px 12px',
              border: '1px solid #ddd',
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
            value={formatDateForInput(endDate)}
            onChange={(e) => handleEndDateChange(e.target.value)}
            style={{
              padding: '10px 12px',
              border: '1px solid #ddd',
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
          <div style={{ fontWeight: '500', marginBottom: '4px' }}>Selected Range:</div>
          <div>{formatDateForInput(startDate)}</div>
          <div>to</div>
          <div>{formatDateForInput(endDate)}</div>
        </div>
      </div>
    </div>
  );
};

export default TimeRangePicker; 