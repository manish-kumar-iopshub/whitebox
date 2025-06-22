import React, { useState, useEffect } from 'react';
import { 
  createCustomGroups, 
  saveCustomGroups, 
  loadCustomGroups,
  calculateGroupUptime
} from '../utils/domainUtils';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

const DomainGrouping = ({ 
  targets, 
  onGroupChange, 
  targetStatuses = [],
  onGroupClick 
}) => {
  const [customGroups, setCustomGroups] = useState([]);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedDomains, setSelectedDomains] = useState([]);
  const [domainGroups, setDomainGroups] = useState({});

  useEffect(() => {
    const savedGroups = loadCustomGroups();
    setCustomGroups(savedGroups);
    const groups = createCustomGroups(targets, savedGroups);
    setDomainGroups(groups);
    onGroupChange(groups);
  }, [targets, customGroups, onGroupChange]);

  const handleAddCustomGroup = () => {
    if (newGroupName.trim() && selectedDomains.length > 0) {
      const newGroup = {
        name: newGroupName.trim(),
        domains: selectedDomains
      };
      const updatedGroups = [...customGroups, newGroup];
      setCustomGroups(updatedGroups);
      saveCustomGroups(updatedGroups);
      setNewGroupName('');
      setSelectedDomains([]);
      setShowCustomForm(false);
    }
  };

  const handleRemoveCustomGroup = (groupName) => {
    const updatedGroups = customGroups.filter(group => group.name !== groupName);
    setCustomGroups(updatedGroups);
    saveCustomGroups(updatedGroups);
  };

  const handleDomainToggle = (domain) => {
    setSelectedDomains(prev => 
      prev.includes(domain) 
        ? prev.filter(d => d !== domain)
        : [...prev, domain]
    );
  };

  const handleGroupClick = (groupName, domains) => {
    if (onGroupClick) {
      onGroupClick(groupName, domains);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 m-0">Domain Groups</h3>
        <Button onClick={() => setShowCustomForm(!showCustomForm)} variant="default">
          {showCustomForm ? 'Cancel' : '+ Add Custom Group'}
        </Button>
      </div>
      {showCustomForm && (
        <Card className="mb-6 shadow-sm border border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900">Create Custom Group</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <label className="block mb-1 text-sm font-medium text-gray-700">Group Name</label>
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Enter group name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 text-sm font-medium text-gray-700">Select Domains</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto border border-gray-300 rounded-md p-2 bg-white">
                {targets.map(domain => (
                  <label key={domain} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={selectedDomains.includes(domain)}
                      onChange={() => handleDomainToggle(domain)}
                      className="accent-blue-600"
                    />
                    {domain}
                  </label>
                ))}
              </div>
            </div>
            <Button
              onClick={handleAddCustomGroup}
              disabled={!newGroupName.trim() || selectedDomains.length === 0}
              variant="default"
              className="mt-2"
            >
              Create Group
            </Button>
          </CardContent>
        </Card>
      )}
      {customGroups.length > 0 && (
        <div className="mb-6">
          <h4 className="mb-2 text-blue-600 text-base font-semibold">Custom Groups</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customGroups.map(group => (
              <Card key={group.name} className="bg-blue-50 border border-blue-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="truncate text-base font-semibold text-gray-900">{group.name}</CardTitle>
                  <Button size="sm" variant="destructive" onClick={() => handleRemoveCustomGroup(group.name)}>
                    Remove
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600">{group.domains.length} domain{group.domains.length !== 1 ? 's' : ''}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      {Object.keys(domainGroups).length > 0 && (
        <div>
          <h4 className="mb-4 text-blue-600 text-base font-semibold">Groups Overview</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(domainGroups).map(([groupName, domains]) => {
              const groupTargets = targetStatuses.filter(t => domains.includes(t.target));
              const groupUptime = calculateGroupUptime(groupTargets.map(t => t.uptime || 0));
              return (
                <Card 
                  key={groupName} 
                  className="cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-md border border-gray-200 shadow-sm"
                  onClick={() => handleGroupClick(groupName, domains)}
                >
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="truncate text-blue-600 text-base font-semibold max-w-[70%]">{groupName}</CardTitle>
                    <Badge variant={groupUptime >= 99 ? 'default' : groupUptime >= 95 ? 'secondary' : 'destructive'}>{groupUptime.toFixed(2)}%</Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-gray-600 mb-2">{domains.length} target{domains.length !== 1 ? 's' : ''}</div>
                    <div className="text-sm text-blue-600 font-medium flex items-center gap-2">
                      <span>Click to view details</span>
                      <span className="text-lg">→</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DomainGrouping; 