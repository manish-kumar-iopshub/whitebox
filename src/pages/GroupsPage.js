import React, { useState, useMemo } from 'react';
import DomainGrouping from '../components/DomainGrouping';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Clock, Search } from 'lucide-react';

const GroupsPage = ({ 
  targets, 
  targetStatuses, 
  domainGroups, 
  timeRange,
  onGroupChange
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleGroupClick = (groupName, domains) => {
    // Navigate to group detail page
    const encodedGroupName = encodeURIComponent(groupName);
    window.location.href = `/groups/${encodedGroupName}`;
  };

  // Filter groups based on search query
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim() || !domainGroups) {
      return domainGroups;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = {};
    
    Object.entries(domainGroups).forEach(([groupName, domains]) => {
      if (groupName.toLowerCase().includes(query)) {
        filtered[groupName] = domains;
      }
    });
    
    return filtered;
  }, [domainGroups, searchQuery]);

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-8">
        <span className="text-2xl">📁</span>
        <h1 className="m-0 text-2xl font-bold text-gray-900">Domain Groups</h1>
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
            placeholder="Search groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4"
          />
        </div>
        {searchQuery && domainGroups && (
          <p className="mt-2 text-sm text-gray-600">
            Showing {Object.keys(filteredGroups).length} of {Object.keys(domainGroups).length} groups
          </p>
        )}
      </div>

      <Card className="shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Groups Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <DomainGrouping 
            targets={targets}
            targetStatuses={targetStatuses}
            onGroupChange={onGroupChange}
            onGroupClick={handleGroupClick}
            filteredGroups={filteredGroups}
            searchQuery={searchQuery}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default GroupsPage; 