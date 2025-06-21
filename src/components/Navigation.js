import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
  const location = useLocation();
  
  const navItems = [
    {
      id: 'groups',
      path: '/groups',
      label: 'Groups',
      icon: '📁',
      description: 'Domain groupings'
    },
    {
      id: 'targets',
      path: '/targets',
      label: 'Targets',
      icon: '🎯',
      description: 'All monitoring targets'
    },
    {
      id: 'reports',
      path: '/reports',
      label: 'Reports',
      icon: '📄',
      description: 'Generate reports'
    },
    {
      id: 'settings',
      path: '/settings',
      label: 'Settings',
      icon: '⚙️',
      description: 'Configuration'
    }
  ];

  const isActive = (path) => {
    return location.pathname === path || 
           (path === '/groups' && location.pathname === '/') ||
           (path === '/targets' && location.pathname.startsWith('/targets/'));
  };

  return (
    <nav style={{
      backgroundColor: '#2c3e50',
      padding: '0 20px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px'
        }}>
          <Link to="/groups" style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textDecoration: 'none'
          }}>
            <span>🔍</span>
            <span>Blackbox Monitor</span>
          </Link>
        </div>

        <div style={{
          display: 'flex',
          gap: '5px'
        }}>
          {navItems.map(item => (
            <Link
              key={item.id}
              to={item.path}
              style={{
                background: isActive(item.path) ? '#3498db' : 'transparent',
                border: 'none',
                color: 'white',
                padding: '15px 20px',
                cursor: 'pointer',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                position: 'relative',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = isActive(item.path) ? '#2980b9' : '#34495e';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = isActive(item.path) ? '#3498db' : 'transparent';
              }}
              title={item.description}
            >
              <span style={{ fontSize: '16px' }}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 