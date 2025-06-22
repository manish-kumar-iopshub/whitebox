import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Clock, Search } from 'lucide-react';
import { findTargetGroup } from '../utils/domainUtils';

const TargetsPage = ({ 
  targetStatuses, 
  timeRange, 
  onTimeRangeChange,
  domainGroups
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleTargetClick = (target) => {
    navigate(`/targets/${encodeURIComponent(target)}`);
  };

  // Filter targets based on search query
  const filteredTargets = useMemo(() => {
    if (!searchQuery.trim()) {
      return targetStatuses;
    }
    
    const query = searchQuery.toLowerCase();
    return targetStatuses.filter(target => 
      target.target.toLowerCase().includes(query)
    );
  }, [targetStatuses, searchQuery]);

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-8">
        <span className="text-2xl">🎯</span>
        <h1 className="m-0 text-2xl font-bold text-gray-900">All Targets</h1>
      </div>
      
      {/* Data Period Note */}
      <div className="flex items-center gap-2 mb-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <Clock className="h-4 w-4 text-blue-600" />
        <span className="text-sm text-blue-700">Showing uptime data for the last 2 days</span>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search targets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4"
          />
        </div>
        {searchQuery && (
          <p className="mt-2 text-sm text-gray-600">
            Showing {filteredTargets.length} of {targetStatuses.length} targets
          </p>
        )}
      </div>

      <Card className="shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Targets Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTargets.map((target) => {
              const uptime = target.uptime || 0;
              const groupName = findTargetGroup(target.target, domainGroups);
              return (
                <Card 
                  key={target.target} 
                  className="cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-md border border-gray-200 shadow-sm" 
                  onClick={() => handleTargetClick(target.target)}
                >
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="truncate text-blue-600 text-base font-semibold max-w-[70%]">
                      {target.target}
                    </CardTitle>
                    <Badge variant={uptime >= 99 ? 'default' : uptime >= 95 ? 'secondary' : 'destructive'}>
                      {uptime.toFixed(2)}%
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-gray-600 mb-2">
                      {groupName ? `Group: ${groupName}` : 'No group assigned'}
                    </div>
                    <div className="text-sm text-blue-600 font-medium flex items-center gap-2">
                      <span>Click to view details</span>
                      <span className="text-lg">→</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredTargets.length === 0 && searchQuery && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No targets found matching "{searchQuery}"</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TargetsPage; 