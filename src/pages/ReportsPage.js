import React from 'react';
import TimeRangePicker from '../components/TimeRangePicker';
import ReportGenerator from '../components/ReportGenerator';

const ReportsPage = ({ 
  targetStatuses, 
  timeRange, 
  onTimeRangeChange, 
  customGroups 
}) => {
  return (
    <div style={{ padding: '20px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        marginBottom: '30px'
      }}>
        <span style={{ fontSize: '24px' }}>📄</span>
        <h1 style={{ margin: 0, color: '#2c3e50' }}>Reports</h1>
      </div>

      {/* Time Range Picker */}
      <TimeRangePicker 
        onTimeRangeChange={onTimeRangeChange}
        initialStart={timeRange.start}
        initialEnd={timeRange.end}
      />

      {/* Report Generator */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <ReportGenerator 
          targets={targetStatuses}
          timeRange={timeRange}
          customGroups={Object.entries(customGroups).map(([name, domains]) => ({ name, domains }))}
        />
      </div>

      {/* Report Templates */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        marginTop: '20px'
      }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50' }}>Report Templates</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          <div style={{
            border: '1px solid #e1e8ed',
            borderRadius: '8px',
            padding: '20px',
            backgroundColor: '#f8f9fa'
          }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#3498db' }}>📊 Summary Report</h4>
            <p style={{ margin: '0 0 15px 0', color: '#7f8c8d', fontSize: '14px' }}>
              Overview of all targets with status and uptime percentages
            </p>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#7f8c8d', fontSize: '14px' }}>
              <li>Overall uptime statistics</li>
              <li>Target status summary</li>
              <li>Group overview</li>
            </ul>
          </div>
          
          <div style={{
            border: '1px solid #e1e8ed',
            borderRadius: '8px',
            padding: '20px',
            backgroundColor: '#f8f9fa'
          }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#3498db' }}>📋 Detailed Report</h4>
            <p style={{ margin: '0 0 15px 0', color: '#7f8c8d', fontSize: '14px' }}>
              Comprehensive information including response times and metrics
            </p>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#7f8c8d', fontSize: '14px' }}>
              <li>Individual target details</li>
              <li>Response time analysis</li>
              <li>Downtime history</li>
            </ul>
          </div>
          
          <div style={{
            border: '1px solid #e1e8ed',
            borderRadius: '8px',
            padding: '20px',
            backgroundColor: '#f8f9fa'
          }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#3498db' }}>📈 CSV Export</h4>
            <p style={{ margin: '0 0 15px 0', color: '#7f8c8d', fontSize: '14px' }}>
              Raw data in spreadsheet format for further analysis
            </p>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#7f8c8d', fontSize: '14px' }}>
              <li>Machine-readable format</li>
              <li>Excel/Google Sheets compatible</li>
              <li>Custom analysis ready</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage; 