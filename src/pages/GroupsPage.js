import React from 'react';
import DomainGrouping from '../components/DomainGrouping';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';

const GroupsPage = ({ 
  targets, 
  targetStatuses, 
  domainGroups, 
  timeRange,
  onGroupChange
}) => {
  const handleGroupClick = (groupName, domains) => {
    // Navigate to group detail page
    const encodedGroupName = encodeURIComponent(groupName);
    window.location.href = `/groups/${encodedGroupName}`;
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-8">
        <span className="text-2xl">📁</span>
        <h1 className="m-0 text-2xl font-bold text-gray-900">Domain Groups</h1>
      </div>
      <Card className="shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Domain Grouping & Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <DomainGrouping 
            targets={targets}
            targetStatuses={targetStatuses}
            onGroupChange={onGroupChange}
            onGroupClick={handleGroupClick}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default GroupsPage; 