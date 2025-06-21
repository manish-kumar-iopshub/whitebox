import React, { useState, useEffect } from 'react';
import { 
  createCustomGroups, 
  saveCustomGroups, 
  loadCustomGroups,
  calculateGroupUptime
} from '../utils/domainUtils';

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
    
    // Create domain groups
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
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h3 style={{ margin: 0, color: '#2c3e50' }}>Domain Groups</h3>
        <button
          onClick={() => setShowCustomForm(!showCustomForm)}
          style={{
            background: '#3498db',
            border: 'none',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          {showCustomForm ? 'Cancel' : '+ Add Custom Group'}
        </button>
      </div>

      {/* Custom Group Form */}
      {showCustomForm && (
        <div style={{
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '20px',
          border: '1px solid #e9ecef'
        }}>
          <h4 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>Create Custom Group</h4>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#2c3e50' }}>
              Group Name
            </label>
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Enter group name"
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#2c3e50' }}>
              Select Domains
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '10px',
              maxHeight: '200px',
              overflowY: 'auto',
              border: '1px solid #ddd',
              borderRadius: '6px',
              padding: '10px',
              backgroundColor: 'white'
            }}>
              {targets.map(domain => (
                <label key={domain} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}>
                  <input
                    type="checkbox"
                    checked={selectedDomains.includes(domain)}
                    onChange={() => handleDomainToggle(domain)}
                  />
                  {domain}
                </label>
              ))}
            </div>
          </div>
          
          <button
            onClick={handleAddCustomGroup}
            disabled={!newGroupName.trim() || selectedDomains.length === 0}
            style={{
              background: '#27ae60',
              border: 'none',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              opacity: (!newGroupName.trim() || selectedDomains.length === 0) ? 0.6 : 1
            }}
          >
            Create Group
          </button>
        </div>
      )}

      {/* Custom Groups List */}
      {customGroups.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>Custom Groups</h4>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '15px'
          }}>
            {customGroups.map(group => (
              <div key={group.name} style={{
                backgroundColor: '#e8f4fd',
                borderRadius: '8px',
                padding: '15px',
                border: '1px solid #b3d9ff'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '10px'
                }}>
                  <strong style={{ color: '#2c3e50' }}>{group.name}</strong>
                  <button
                    onClick={() => handleRemoveCustomGroup(group.name)}
                    style={{
                      background: '#e74c3c',
                      border: 'none',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Remove
                  </button>
                </div>
                <div style={{ fontSize: '14px', color: '#7f8c8d' }}>
                  {group.domains.length} domain{group.domains.length !== 1 ? 's' : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Groups Overview */}
      {Object.keys(domainGroups).length > 0 && (
        <div>
          <h4 style={{ margin: '0 0 20px 0', color: '#2c3e50' }}>Groups Overview</h4>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '20px'
          }}>
            {Object.entries(domainGroups).map(([groupName, domains]) => {
              const groupTargets = targetStatuses.filter(t => domains.includes(t.target));
              const groupUptime = calculateGroupUptime(groupTargets.map(t => t.uptime || 0));
              const upTargets = groupTargets.filter(t => t.success).length;
              const downTargets = groupTargets.length - upTargets;
              
              return (
                <div 
                  key={groupName} 
                  style={{
                    border: '1px solid #e1e8ed',
                    borderRadius: '12px',
                    padding: '20px',
                    backgroundColor: '#f8f9fa',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                  }}
                  onClick={() => handleGroupClick(groupName, domains)}
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
                    <h4 style={{ margin: 0, color: '#3498db', fontSize: '18px' }}>{groupName}</h4>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      backgroundColor: '#e1e8ed',
                      color: '#7f8c8d'
                    }}>
                      {domains.length} domains
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
                        color: (groupUptime || 0) >= 99 ? '#27ae60' : (groupUptime || 0) >= 95 ? '#f39c12' : '#e74c3c'
                      }}>
                        {(groupUptime || 0).toFixed(2)}%
                      </div>
                      <div style={{ fontSize: '12px', color: '#7f8c8d' }}>
                        Uptime
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#27ae60' }}>
                        {upTargets} up
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#e74c3c' }}>
                        {downTargets} down
                      </div>
                    </div>
                  </div>
                  
                  <div style={{
                    fontSize: '12px',
                    color: '#7f8c8d',
                    borderTop: '1px solid #e1e8ed',
                    paddingTop: '10px'
                  }}>
                    Click to view details →
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DomainGrouping; 