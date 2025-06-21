import React from 'react';
import { useNavigate } from 'react-router-dom';
import TimeRangePicker from '../components/TimeRangePicker';
import TargetTable from '../components/TargetTable';

const TargetsPage = ({ 
  targetStatuses, 
  timeRange, 
  onTimeRangeChange
}) => {
  const navigate = useNavigate();

  const handleTargetClick = (target) => {
    navigate(`/targets/${encodeURIComponent(target)}`);
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        marginBottom: '30px'
      }}>
        <span style={{ fontSize: '24px' }}>🎯</span>
        <h1 style={{ margin: 0, color: '#2c3e50' }}>All Targets</h1>
      </div>

      {/* Time Range Picker */}
      <TimeRangePicker 
        onTimeRangeChange={onTimeRangeChange}
        initialStart={timeRange.start}
        initialEnd={timeRange.end}
      />

      {/* Target Table */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <TargetTable 
          data={targetStatuses}
          onTargetClick={handleTargetClick}
        />
      </div>
    </div>
  );
};

export default TargetsPage; 