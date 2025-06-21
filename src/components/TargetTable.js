import React, { useMemo } from 'react';
import { useTable, useSortBy, useFilters, useGlobalFilter } from 'react-table';

const TargetTable = ({ data, onTargetClick }) => {
  const columns = useMemo(
    () => [
      {
        Header: 'Target',
        accessor: 'target',
        Cell: ({ value }) => (
          <button 
            className="btn btn-link" 
            style={{ padding: 0, textDecoration: 'underline', color: '#007bff' }}
            onClick={() => onTargetClick(value)}
          >
            {value}
          </button>
        ),
      },
      {
        Header: 'Status',
        accessor: 'success',
        Cell: ({ value }) => (
          <span style={{
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 'bold',
            backgroundColor: value ? '#d4edda' : '#f8d7da',
            color: value ? '#155724' : '#721c24'
          }}>
            {value ? 'UP' : 'DOWN'}
          </span>
        ),
      },
      {
        Header: 'Uptime %',
        accessor: 'uptime',
        Cell: ({ value }) => {
          if (value === null || value === undefined || isNaN(value)) {
            return 'N/A';
          }
          return `${value.toFixed(2)}%`;
        },
      },
      {
        Header: 'Avg Response Time',
        accessor: 'avgResponseTime',
        Cell: ({ value }) => {
          if (value === null || value === undefined || isNaN(value)) {
            return 'N/A';
          }
          return `${(value * 1000).toFixed(2)} ms`;
        },
      },
      {
        Header: 'Last Check',
        accessor: 'lastCheck',
        Cell: ({ value }) => {
          if (!value) {
            return 'N/A';
          }
          return new Date(value).toLocaleString();
        },
      },
    ],
    [onTargetClick]
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state,
    setGlobalFilter,
  } = useTable(
    {
      columns,
      data,
    },
    useFilters,
    useGlobalFilter,
    useSortBy
  );

  return (
    <div className="card">
      <h3>Target Status</h3>
      <div className="form-group">
        <input
          type="text"
          placeholder="Search targets..."
          value={state.globalFilter || ''}
          onChange={e => setGlobalFilter(e.target.value)}
          className="form-control"
          style={{ maxWidth: '300px' }}
        />
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table {...getTableProps()} style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            {headerGroups.map(headerGroup => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map(column => (
                  <th
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                    style={{
                      padding: '12px',
                      textAlign: 'left',
                      borderBottom: '2px solid #ddd',
                      backgroundColor: '#f8f9fa',
                      cursor: 'pointer'
                    }}
                  >
                    {column.render('Header')}
                    <span>
                      {column.isSorted
                        ? column.isSortedDesc
                          ? ' 🔽'
                          : ' 🔼'
                        : ''}
                    </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {rows.map(row => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map(cell => (
                    <td
                      {...cell.getCellProps()}
                      style={{
                        padding: '12px',
                        borderBottom: '1px solid #ddd'
                      }}
                    >
                      {cell.render('Cell')}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TargetTable; 