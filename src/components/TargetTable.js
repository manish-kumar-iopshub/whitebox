import React, { useMemo } from 'react';
import { useTable, useSortBy, useFilters, useGlobalFilter } from 'react-table';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from './ui/table';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';

const TargetTable = ({ data, onTargetClick }) => {
  const columns = useMemo(
    () => [
      {
        Header: 'Target',
        accessor: 'target',
        Cell: ({ value }) => (
          <button 
            className="text-discord-blurple underline hover:no-underline p-0 bg-transparent border-none cursor-pointer"
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
          <Badge variant={value ? 'default' : 'destructive'}>
            {value ? 'UP' : 'DOWN'}
          </Badge>
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
    <Card>
      <CardHeader>
        <CardTitle>Target Status</CardTitle>
        <div className="max-w-xs">
          <Input
            type="text"
            placeholder="Search targets..."
            value={state.globalFilter || ''}
            onChange={e => setGlobalFilter(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        <Table {...getTableProps()}>
          <TableHeader>
            {headerGroups.map(headerGroup => (
              <TableRow {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map(column => (
                  <TableHead
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                    className="cursor-pointer"
                  >
                    {column.render('Header')}
                    <span className="ml-1">
                      {column.isSorted
                        ? column.isSortedDesc
                          ? ' 🔽'
                          : ' 🔼'
                        : ''}
                    </span>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody {...getTableBodyProps()}>
            {rows.map(row => {
              prepareRow(row);
              return (
                <TableRow {...row.getRowProps()}>
                  {row.cells.map(cell => (
                    <TableCell {...cell.getCellProps()}>
                      {cell.render('Cell')}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default TargetTable; 