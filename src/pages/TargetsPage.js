import React from 'react';
import { useNavigate } from 'react-router-dom';
import TimeRangePicker from '../components/TimeRangePicker';

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

      {/* Targets Overview */}
      <div style={{ marginTop: '30px' }}>
        <h4 style={{ margin: '0 0 20px 0', color: '#2c3e50' }}>Targets Overview</h4>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '20px'
        }}>
          {targetStatuses.map((target) => {
            const uptime = target.uptime || 0;
            const status = target.success ? 'up' : 'down';
            
            return (
              <div 
                key={target.target} 
                style={{
                  border: '1px solid #e1e8ed',
                  borderRadius: '12px',
                  padding: '20px',
                  backgroundColor: '#f8f9fa',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}
                onClick={() => handleTargetClick(target.target)}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '15px'
                }}>
                  <h4 style={{ 
                    margin: 0, 
                    color: '#3498db', 
                    fontSize: '16px',
                    wordBreak: 'break-word',
                    maxWidth: '70%'
                  }}>
                    {target.target}
                  </h4>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    backgroundColor: status === 'up' ? '#d4edda' : '#f8d7da',
                    color: status === 'up' ? '#155724' : '#721c24'
                  }}>
                    {status.toUpperCase()}
                  </span>
                </div>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '15px'
                }}>
                  <div>
                    <div style={{
                      fontSize: '28px',
                      fontWeight: 'bold',
                      color: uptime >= 99 ? '#27ae60' : uptime >= 95 ? '#f39c12' : '#e74c3c'
                    }}>
                      {uptime.toFixed(2)}%
                    </div>
                    <div style={{ fontSize: '12px', color: '#7f8c8d' }}>
                      Uptime
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '14px', color: '#7f8c8d', marginBottom: '4px' }}>
                      Response Time
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#2c3e50' }}>
                      {target.avgResponseTime ? `${(target.avgResponseTime * 1000).toFixed(2)} ms` : 'N/A'}
                    </div>
                  </div>
                </div>
                
                <div style={{
                  fontSize: '14px',
                  color: '#3498db',
                  borderTop: '1px solid #e1e8ed',
                  paddingTop: '12px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}>
                  <span>View Details</span>
                  <span style={{ fontSize: '16px' }}>→</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TargetsPage; 