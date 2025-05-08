import React, { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
  RowSelectionState,
} from '@tanstack/react-table';
import { ArrowUpDown, Download, ChevronDown, ChevronLeft, ChevronRight, RotateCcw, HelpCircle } from 'lucide-react';
import { useSettingsStore } from '../store/settingsStore';
import Papa from 'papaparse';

interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  getColumnFrequencies?: (columnId: string) => { value: string; count: number }[];
  type: 'news' | 'corp';
  sourceLevelHelp?: React.ReactNode;
}

export function DataTable<TData>({ data, columns, getColumnFrequencies, type, sourceLevelHelp }: DataTableProps<TData>) {
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [showFilters, setShowFilters] = useState<Record<string, boolean>>({});
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const [showSourceHelp, setShowSourceHelp] = useState(false);
  const { display } = useSettingsStore();

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
    enableRowSelection: true,
    initialState: {
      pagination: {
        pageSize: type === 'news' ? display.newsTablePageSize : display.corpListPageSize,
      },
    },
  });

  const handleExport = () => {
    const selectedRows = table.getSelectedRowModel().rows;
    const dataToExport = selectedRows.length > 0 
      ? selectedRows.map(row => row.original)
      : data;
    
    const csvData = Papa.unparse(dataToExport);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'exported_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleFilter = (columnId: string) => {
    setShowFilters(prev => ({
      ...prev,
      [columnId]: !prev[columnId]
    }));
  };

  const handleFilterChange = (columnId: string, value: string) => {
    const currentFilters = selectedFilters[columnId] || [];
    let newFilters: string[];
    
    if (currentFilters.includes(value)) {
      newFilters = currentFilters.filter(v => v !== value);
    } else {
      newFilters = [...currentFilters, value];
    }
    
    setSelectedFilters(prev => ({
      ...prev,
      [columnId]: newFilters
    }));
    
    const column = table.getColumn(columnId);
    if (column) {
      column.setFilterValue(newFilters.length ? newFilters : undefined);
    }
  };

  const resetDateFilter = () => {
    setDateRange({ start: '', end: '' });
    const column = table.getColumn('time');
    if (column) {
      column.setFilterValue(undefined);
    }
  };

  const renderFilter = (column: any) => {
    const columnId = column.id;
    const frequencies = getColumnFrequencies?.(columnId);

    if (columnId === 'time') {
      return (
        <div className="absolute z-50 mt-2 bg-white rounded-lg shadow-lg p-4 border min-w-[250px] left-0">
          <div className="space-y-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Date Range</span>
              <button
                onClick={resetDateFilter}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="datetime-local"
                value={dateRange.start}
                onChange={(e) => {
                  setDateRange(prev => ({ ...prev, start: e.target.value }));
                  if (dateRange.end) {
                    column.setFilterValue([e.target.value, dateRange.end]);
                  }
                }}
                className="w-full px-2 py-1 text-sm border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="datetime-local"
                value={dateRange.end}
                onChange={(e) => {
                  setDateRange(prev => ({ ...prev, end: e.target.value }));
                  if (dateRange.start) {
                    column.setFilterValue([dateRange.start, e.target.value]);
                  }
                }}
                className="w-full px-2 py-1 text-sm border rounded"
              />
            </div>
          </div>
        </div>
      );
    }

    if (frequencies) {
      const currentFilters = selectedFilters[columnId] || [];
      return (
        <div className="absolute z-50 mt-2 bg-white rounded-lg shadow-lg p-4 border min-w-[200px] max-h-[300px] overflow-y-auto left-0">
          {columnId === 'source' && (
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Source Level</span>
              <button
                onMouseEnter={() => setShowSourceHelp(true)}
                onMouseLeave={() => setShowSourceHelp(false)}
                className="p-1 hover:bg-gray-100 rounded relative"
              >
                <HelpCircle className="h-4 w-4 text-gray-400" />
                {showSourceHelp && sourceLevelHelp}
              </button>
            </div>
          )}
          {frequencies.map(({ value, count }) => (
            <label key={value} className="flex items-center space-x-2 py-1">
              <input
                type="checkbox"
                checked={currentFilters.includes(value)}
                onChange={() => handleFilterChange(columnId, value)}
                className="rounded border-gray-300"
              />
              <span className="text-sm">
                {value} ({count})
              </span>
            </label>
          ))}
        </div>
      );
    }

    return (
      <div className="absolute z-50 mt-2 bg-white rounded-lg shadow-lg p-4 border left-0">
        <input
          type="text"
          value={(column.getFilterValue() as string) ?? ''}
          onChange={e => column.setFilterValue(e.target.value)}
          className="w-full px-2 py-1 text-sm border rounded"
          placeholder={`Filter ${column.columnDef.header}...`}
        />
      </div>
    );
  };

  return (
    <div className="rounded-md border">
      <div className="flex justify-end p-4 border-b">
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Download className="h-4 w-4" />
          Export Selected
        </button>
      </div>
      <div className="overflow-auto max-h-[70vh]">
        <table className="w-full table-fixed">
          <thead className="sticky top-0 bg-white">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b">
                <th className="px-4 py-3 text-left w-[40px]">
                  <input
                    type="checkbox"
                    checked={table.getIsAllRowsSelected()}
                    onChange={table.getToggleAllRowsSelectedHandler()}
                    className="rounded border-gray-300"
                  />
                </th>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    style={{ width: header.column.columnDef.size }}
                  >
                    {header.isPlaceholder ? null : (
                      <div className="space-y-2">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getCanFilter() && (
                          <div className="relative">
                            <button
                              onClick={() => toggleFilter(header.column.id)}
                              className="text-xs text-gray-500 flex items-center gap-1"
                            >
                              Filter
                              <ChevronDown className="h-3 w-3" />
                            </button>
                            {showFilters[header.column.id] && renderFilter(header.column)}
                          </div>
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 w-[40px]">
                  <input
                    type="checkbox"
                    checked={row.getIsSelected()}
                    onChange={row.getToggleSelectedHandler()}
                    className="rounded border-gray-300"
                  />
                </td>
                {row.getVisibleCells().map((cell) => (
                  <td 
                    key={cell.id} 
                    className="px-4 py-3 text-sm text-gray-900"
                    style={{ width: cell.column.columnDef.size }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between px-4 py-3 border-t bg-white">
        <div className="flex items-center gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <span className="text-sm text-gray-700">
            Page {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount()}
          </span>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        <select
          value={table.getState().pagination.pageSize}
          onChange={e => table.setPageSize(Number(e.target.value))}
          className="px-2 py-1 border rounded text-sm"
        >
          {[10, 20, 30, 40, 50].map(pageSize => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
