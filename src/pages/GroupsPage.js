import React from 'react';
import DomainGrouping from '../components/DomainGrouping';

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
    <div style={{ padding: '20px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        marginBottom: '30px'
      }}>
        <span style={{ fontSize: '24px' }}>📁</span>
        <h1 style={{ margin: 0, color: '#2c3e50' }}>Domain Groups</h1>
      </div>

      {/* Combined Domain Grouping and Overview */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <DomainGrouping 
          targets={targets}
          targetStatuses={targetStatuses}
          onGroupChange={onGroupChange}
          onGroupClick={handleGroupClick}
        />
      </div>
    </div>
  );
};

export default GroupsPage; 