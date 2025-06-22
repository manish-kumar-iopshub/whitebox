import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Card, CardContent } from './ui/card';

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
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        <Link to="/groups" className="flex items-center gap-2 text-xl font-semibold text-gray-900 no-underline hover:text-blue-600 transition-colors">
          <span>🔍</span>
          <span>Blackbox Monitor</span>
        </Link>
        <div className="flex gap-1">
          {navItems.map(item => (
            <Link
              key={item.id}
              to={item.path}
              title={item.description}
              className={
                `flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 no-underline
                ${isActive(item.path)
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                `
              }
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 