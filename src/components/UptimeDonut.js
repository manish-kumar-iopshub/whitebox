import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const UptimeDonut = ({ uptime, title, size = 200 }) => {
  // Handle null/undefined uptime values
  const safeUptime = uptime === null || uptime === undefined || isNaN(uptime) ? 0 : uptime;
  
  const data = [
    { name: 'Uptime', value: safeUptime, color: '#28a745' },
    { name: 'Downtime', value: 100 - safeUptime, color: '#dc3545' }
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const displayValue = value === null || value === undefined || isNaN(value) ? 0 : value;
      return (
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #ccc',
          padding: '10px',
          borderRadius: '4px'
        }}>
          <p><strong>{payload[0].name}:</strong> {displayValue.toFixed(2)}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <h3>{title}</h3>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: size + 50 }}>
        <ResponsiveContainer width={size} height={size}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={size * 0.3}
              outerRadius={size * 0.4}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '10px' }}>
        {safeUptime.toFixed(2)}%
      </div>
      <div style={{ fontSize: '14px', color: '#666' }}>
        Uptime
      </div>
    </div>
  );
};

export default UptimeDonut; 