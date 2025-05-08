import React from 'react';
import { DataTable } from '../components/DataTable';
import { createColumnHelper } from '@tanstack/react-table';
import { Badge } from '../components/Badge';
import { ArrowUp, ArrowDown, HelpCircle } from 'lucide-react';
import Papa from 'papaparse';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface NewsItem {
  title: string;
  time: string;
  source: string;
  source_level: 'A' | 'B' | 'C' | 'D';
  source_reason: string;
  company: string;
  risklev: 'None' | 'Low' | 'Medium' | 'High';
  risktye: string;
  opplev: 'None' | 'Low' | 'Medium' | 'High';
  opptye: string;
}

const riskLevelOrder = ['None', 'Low', 'Medium', 'High'];
const sourceLevelOrder = ['A', 'B', 'C', 'D'];

const parseArrayField = (field: string) => {
  if (!field) return [];
  try {
    const cleaned = field.replace(/[\[\]']/g, '');
    if (!cleaned) return [];
    
    return cleaned
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);
  } catch (error) {
    console.error('Error parsing array field:', error);
    return [];
  }
};

const SourceLevelHelp = () => (
  <div className="absolute z-50 right-0 mt-2 w-80 bg-white rounded-lg shadow-lg p-4 border">
    <h3 className="font-medium text-gray-900 mb-2">Source Level Classification:</h3>
    <ul className="space-y-2 text-sm text-gray-700">
      <li><span className="font-medium">A:</span> Highly reputable, mainstream media with strict editorial standards (e.g., BBC, Reuters).</li>
      <li><span className="font-medium">B:</span> Professional or niche-specific outlet with good journalistic practices.</li>
      <li><span className="font-medium">C:</span> Commercial PR or marketing-driven platforms with mixed reliability.</li>
      <li><span className="font-medium">D:</span> Low-quality blogs or unregulated sites, potentially misleading.</li>
    </ul>
  </div>
);

export default function NewsPage() {
  const [data, setData] = useState<NewsItem[]>([]);
  const navigate = useNavigate();
  const columnHelper = createColumnHelper<NewsItem>();

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/newslevel.csv');
        const text = await response.text();
        const result = Papa.parse(text, { header: true });
        
        const parsedData = result.data.map((item: any) => ({
          title: item.title || '',
          time: item.time || '',
          source: item.source || '',
          source_level: item.source_level || 'D',
          source_reason: item.source_reason || '',
          company: item.company || '',
          risklev: item.risklev || 'None',
          risktye: item['Risk Types'] || '',
          opplev: item.opplev || 'None',
          opptye: item['Opportunity Types'] || '',
        }));
        
        setData(parsedData.filter((item: any) => item.title));
      } catch (error) {
        console.error('Error loading CSV:', error);
      }
    };

    loadData();
  }, []);

  const getColumnFrequencies = (columnId: string) => {
    if (!data.length) return [];

    if (columnId === 'risklev' || columnId === 'opplev') {
      const frequencies = data.reduce((acc, item) => {
        const value = item[columnId as keyof NewsItem] as string;
        acc[value] = (acc[value] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return riskLevelOrder.map(value => ({
        value,
        count: frequencies[value] || 0
      }));
    }

    if (columnId === 'source') {
      const frequencies = data.reduce((acc, item) => {
        const value = `${item.source_level}-Level`;
        acc[value] = (acc[value] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return sourceLevelOrder.map(level => ({
        value: `${level}-Level`,
        count: frequencies[`${level}-Level`] || 0
      }));
    }

    if (columnId === 'risktye' || columnId === 'opptye') {
      const frequencies = data.reduce((acc, item) => {
        const types = parseArrayField(item[columnId as keyof NewsItem] as string);
        types.forEach(type => {
          if (type) {
            acc[type] = (acc[type] || 0) + 1;
          }
        });
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(frequencies)
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count);
    }

    return [];
  };

  const columns = [
    columnHelper.accessor('title', {
      header: 'Title',
      cell: info => (
        <button
          onClick={() => navigate(`/news/${info.row.index}`)}
          className="text-left text-blue-600 hover:text-blue-800 hover:underline"
        >
          {info.getValue()}
        </button>
      ),
      enableColumnFilter: false,
      size: 400,
    }),
    columnHelper.accessor('time', {
      header: ({ column }) => {
        return (
          <div className="flex items-center gap-2">
            <span>Published Time</span>
            <button
              onClick={() => column.toggleSorting()}
              className="p-1 hover:bg-gray-100 rounded"
            >
              {column.getIsSorted() === "asc" ? (
                <ArrowUp className="h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ArrowDown className="h-4 w-4" />
              ) : (
                <ArrowUp className="h-4 w-4 text-gray-300" />
              )}
            </button>
          </div>
        );
      },
      cell: info => {
        const date = new Date(info.getValue());
        return date.toLocaleString();
      },
      sortingFn: (a, b) => {
        const dateA = new Date(a.original.time).getTime();
        const dateB = new Date(b.original.time).getTime();
        return dateA - dateB;
      },
      filterFn: (row, columnId, filterValue: [string, string]) => {
        if (!filterValue?.[0] || !filterValue?.[1]) return true;
        const cellDate = new Date(row.getValue(columnId));
        const [start, end] = filterValue;
        return cellDate >= new Date(start) && cellDate <= new Date(end);
      },
      size: 200,
    }),
    columnHelper.accessor('source', {
      header: ({ column }) => {
        return (
          <div className="flex items-center gap-2">
            <span>Source</span>
            <button
              onClick={() => column.toggleSorting()}
              className="p-1 hover:bg-gray-100 rounded"
            >
              {column.getIsSorted() === "asc" ? (
                <ArrowUp className="h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ArrowDown className="h-4 w-4" />
              ) : (
                <ArrowUp className="h-4 w-4 text-gray-300" />
              )}
            </button>
          </div>
        );
      },
      cell: info => (
        <div className="flex items-center gap-2">
          <span>{info.getValue()}</span>
          <span className="px-2 py-1 bg-gray-100 rounded text-sm">
            {info.row.original.source_level}
          </span>
        </div>
      ),
      sortingFn: (a, b) => {
        const levelA = sourceLevelOrder.indexOf(a.original.source_level);
        const levelB = sourceLevelOrder.indexOf(b.original.source_level);
        if (levelA === levelB) {
          return a.original.source.localeCompare(b.original.source);
        }
        return levelA - levelB;
      },
      filterFn: (row, columnId, filterValue: string[]) => {
        if (!filterValue?.length) return true;
        return filterValue.includes(`${row.original.source_level}-Level`);
      },
      size: 200,
    }),
    columnHelper.accessor('company', {
      header: 'Company',
      cell: info => info.getValue(),
      size: 120,
      enableColumnFilter: false,
    }),
    columnHelper.accessor('risklev', {
      header: ({ column }) => {
        return (
          <div className="flex items-center gap-2">
            <span>Risk Level</span>
            <button
              onClick={() => column.toggleSorting()}
              className="p-1 hover:bg-gray-100 rounded"
            >
              {column.getIsSorted() === "asc" ? (
                <ArrowUp className="h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ArrowDown className="h-4 w-4" />
              ) : (
                <ArrowUp className="h-4 w-4 text-gray-300" />
              )}
            </button>
          </div>
        );
      },
      cell: info => info.getValue(),
      sortingFn: (a, b) => 
        riskLevelOrder.indexOf(a.original.risklev) - 
        riskLevelOrder.indexOf(b.original.risklev),
      filterFn: (row, columnId, filterValue: string[]) => {
        if (!filterValue?.length) return true;
        return filterValue.includes(row.getValue(columnId));
      },
      size: 140,
    }),
    columnHelper.accessor('risktye', {
      header: 'Risk Type',
      cell: info => (
        <div className="flex flex-wrap gap-2">
          {parseArrayField(info.getValue()).map((type: string, index: number) => (
            type && <Badge key={index} label={type} />
          ))}
        </div>
      ),
      enableSorting: false,
      filterFn: (row, columnId, filterValue: string[]) => {
        if (!filterValue?.length) return true;
        const types = parseArrayField(row.getValue(columnId));
        return filterValue.some(value => types.includes(value));
      },
      size: 300,
    }),
    columnHelper.accessor('opplev', {
      header: ({ column }) => {
        return (
          <div className="flex items-center gap-2">
            <span className="whitespace-normal">Opportunity Level</span>
            <button
              onClick={() => column.toggleSorting()}
              className="p-1 hover:bg-gray-100 rounded"
            >
              {column.getIsSorted() === "asc" ? (
                <ArrowUp className="h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ArrowDown className="h-4 w-4" />
              ) : (
                <ArrowUp className="h-4 w-4 text-gray-300" />
              )}
            </button>
          </div>
        );
      },
      cell: info => info.getValue(),
      sortingFn: (a, b) => 
        riskLevelOrder.indexOf(a.original.opplev) - 
        riskLevelOrder.indexOf(b.original.opplev),
      filterFn: (row, columnId, filterValue: string[]) => {
        if (!filterValue?.length) return true;
        return filterValue.includes(row.getValue(columnId));
      },
      size: 180,
    }),
    columnHelper.accessor('opptye', {
      header: 'Opportunity Type',
      cell: info => (
        <div className="flex flex-wrap gap-2">
          {parseArrayField(info.getValue()).map((type: string, index: number) => (
            type && <Badge key={index} label={type} />
          ))}
        </div>
      ),
      enableSorting: false,
      filterFn: (row, columnId, filterValue: string[]) => {
        if (!filterValue?.length) return true;
        const types = parseArrayField(row.getValue(columnId));
        return filterValue.some(value => types.includes(value));
      },
      size: 300,
    }),
  ];

  return (
    <div className="space-y-6">
      <DataTable 
        columns={columns} 
        data={data} 
        getColumnFrequencies={getColumnFrequencies}
        type="news"
        sourceLevelHelp={<SourceLevelHelp />}
      />
    </div>
  );
}
