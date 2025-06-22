import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';

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
        <div className="bg-white border border-border p-3 rounded-lg shadow-lg">
          <p className="font-medium"><strong>{payload[0].name}:</strong> {displayValue.toFixed(2)}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="text-center">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center items-center" style={{ height: size + 50 }}>
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
        <div className="text-2xl font-bold mt-3">
          {safeUptime.toFixed(2)}%
        </div>
        <div className="text-sm text-muted-foreground">
          Uptime
        </div>
      </CardContent>
    </Card>
  );
};

export default UptimeDonut; 