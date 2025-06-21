import React, { useState } from 'react';
import { formatDate, formatDuration } from '../utils/domainUtils';

const DowntimeHistory = ({ downtimes, onAnnotationChange }) => {
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDowntimes = downtimes.filter(downtime => {
    const matchesType = filterType === 'all' || downtime.annotation?.type === filterType;
    const matchesSearch = !searchTerm || 
      downtime.start.toLocaleString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      downtime.end.toLocaleString().toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesType && matchesSearch;
  });

  const handleAnnotationChange = (downtimeId, annotation) => {
    onAnnotationChange(downtimeId, annotation);
  };

  return (
    <div className="card">
      <h3>Downtime History</h3>
      
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div className="form-group">
          <label className="form-label">Filter by Type</label>
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            className="form-control"
            style={{ width: 'auto' }}
          >
            <option value="all">All</option>
            <option value="planned">Planned</option>
            <option value="unplanned">Unplanned</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
        
        <div className="form-group">
          <label className="form-label">Search</label>
          <input
            type="text"
            placeholder="Search by date..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-control"
            style={{ width: 'auto' }}
          />
        </div>
      </div>

      {filteredDowntimes.length === 0 ? (
        <div className="loading">No downtime periods found</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                  Start Time
                </th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                  End Time
                </th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                  Duration
                </th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                  Type
                </th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                  Notes
                </th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredDowntimes.map((downtime, index) => (
                <tr key={index}>
                  <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
                    {formatDate(downtime.start)}
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
                    {formatDate(downtime.end)}
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
                    {formatDuration(downtime.duration)}
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      backgroundColor: downtime.annotation?.type === 'planned' ? '#fff3cd' : 
                                     downtime.annotation?.type === 'maintenance' ? '#d1ecf1' : '#f8d7da',
                      color: downtime.annotation?.type === 'planned' ? '#856404' : 
                             downtime.annotation?.type === 'maintenance' ? '#0c5460' : '#721c24'
                    }}>
                      {downtime.annotation?.type || 'unplanned'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
                    {downtime.annotation?.notes || '-'}
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>
                    <button
                      className="btn btn-primary"
                      style={{ fontSize: '12px', padding: '4px 8px' }}
                      onClick={() => {
                        const type = prompt('Enter type (planned/unplanned/maintenance):', downtime.annotation?.type || 'unplanned');
                        const notes = prompt('Enter notes:', downtime.annotation?.notes || '');
                        if (type) {
                          handleAnnotationChange(index, { type, notes });
                        }
                      }}
                    >
                      Annotate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DowntimeHistory; 