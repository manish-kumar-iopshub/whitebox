import React from 'react';
import { useNavigate } from 'react-router-dom';
import TimeRangePicker from '../components/TimeRangePicker';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

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
    <div className="p-6">
      <div className="flex items-center gap-4 mb-8">
        <span className="text-2xl">🎯</span>
        <h1 className="m-0 text-2xl font-bold text-gray-900">All Targets</h1>
      </div>
      <TimeRangePicker 
        onTimeRangeChange={onTimeRangeChange}
        initialStart={timeRange.start}
        initialEnd={timeRange.end}
      />
      <h4 className="mt-8 mb-4 text-lg font-semibold text-blue-600">Targets Overview</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {targetStatuses.map((target) => {
          const uptime = target.uptime || 0;
          const status = target.success ? 'up' : 'down';
          return (
            <Card key={target.target} className="cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-md border border-gray-200 shadow-sm" onClick={() => handleTargetClick(target.target)}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="truncate text-blue-600 text-base font-semibold max-w-[70%]">{target.target}</CardTitle>
                <Badge variant={status === 'up' ? 'default' : 'destructive'}>{status.toUpperCase()}</Badge>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <div className={`text-2xl font-bold ${uptime >= 99 ? 'text-green-600' : uptime >= 95 ? 'text-yellow-600' : 'text-red-600'}`}>{uptime.toFixed(2)}%</div>
                    <div className="text-xs text-gray-500">Uptime</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500 mb-1">Response Time</div>
                    <div className="text-base font-bold text-gray-700">{target.avgResponseTime ? `${(target.avgResponseTime * 1000).toFixed(2)} ms` : 'N/A'}</div>
                  </div>
                </div>
                <div className="text-sm text-blue-600 border-t border-gray-200 pt-2 flex items-center justify-center gap-2 font-medium">
                  <span>View Details</span>
                  <span className="text-lg">→</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default TargetsPage; 