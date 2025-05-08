import React, { useEffect, useState } from 'react';
import { useCorpStore } from '../store/corpStore';
import { useSettingsStore } from '../store/settingsStore';
import { Star, StarOff, ArrowUpDown, Filter, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';

interface CorpData {
  Company: string;
  'Overall Risk Level': string;
  'Overall Opportunity Level': string;
}

type SortField = 'company' | 'risk' | 'opportunity';
type SortOrder = 'asc' | 'desc';
type FilterLevel = 'None' | 'Low' | 'Medium' | 'High';

interface SortConfig {
  field: SortField;
  order: SortOrder;
  priority: number;
}

const getLevelColor = (level: string | undefined, type: 'risk' | 'opportunity') => {
  if (!level) return type === 'risk' ? 'bg-red-50' : 'bg-green-50';
  
  const colors = {
    risk: {
      'None': 'bg-white',
      'Low': 'bg-red-50',
      'Medium': 'bg-red-100',
      'High': 'bg-red-200'
    },
    opportunity: {
      'None': 'bg-white',
      'Low': 'bg-green-50',
      'Medium': 'bg-green-100',
      'High': 'bg-green-200'
    }
  };
  return colors[type][level] || colors[type]['None'];
};

const levelOrder = ['None', 'Low', 'Medium', 'High'];

export default function CorpPage() {
  const { display } = useSettingsStore();
  const [corpData, setCorpData] = useState<CorpData[]>([]);
  const { watchlist, addToWatchlist, removeFromWatchlist, isWatched } = useCorpStore();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);

  const [watchlistSortConfigs, setWatchlistSortConfigs] = useState<SortConfig[]>([
    { field: 'company', order: 'asc', priority: 0 }
  ]);
  const [showWatchlistSortMenu, setShowWatchlistSortMenu] = useState(false);
  const [watchlistRiskFilter, setWatchlistRiskFilter] = useState<FilterLevel[]>([]);
  const [watchlistOpportunityFilter, setWatchlistOpportunityFilter] = useState<FilterLevel[]>([]);
  const [showWatchlistFilterMenu, setShowWatchlistFilterMenu] = useState(false);

  const [corpListSortConfigs, setCorpListSortConfigs] = useState<SortConfig[]>([
    { field: 'company', order: 'asc', priority: 0 }
  ]);
  const [showCorpListSortMenu, setShowCorpListSortMenu] = useState(false);
  const [corpListRiskFilter, setCorpListRiskFilter] = useState<FilterLevel[]>([]);
  const [corpListOpportunityFilter, setCorpListOpportunityFilter] = useState<FilterLevel[]>([]);
  const [showCorpListFilterMenu, setShowCorpListFilterMenu] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/corplevel.csv');
        const text = await response.text();
        const result = Papa.parse(text, { header: true });
        setCorpData(result.data as CorpData[]);
      } catch (error) {
        console.error('Error loading corp data:', error);
      }
    };

    loadData();
  }, []);

  const handleWatchlistToggle = (company: string) => {
    if (isWatched(company)) {
      removeFromWatchlist(company);
    } else {
      addToWatchlist(company);
    }
  };

  const sortData = (data: CorpData[], configs: SortConfig[]) => {
    return [...data].sort((a, b) => {
      for (const config of configs) {
        let comparison = 0;
        
        switch (config.field) {
          case 'company':
            comparison = a.Company.localeCompare(b.Company);
            break;
          case 'risk':
            comparison = levelOrder.indexOf(a['Overall Risk Level']) - levelOrder.indexOf(b['Overall Risk Level']);
            break;
          case 'opportunity':
            comparison = levelOrder.indexOf(a['Overall Opportunity Level']) - levelOrder.indexOf(b['Overall Opportunity Level']);
            break;
        }
        
        if (comparison !== 0) {
          return config.order === 'asc' ? comparison : -comparison;
        }
      }
      return 0;
    });
  };

  const filterData = (data: CorpData[], riskFilter: FilterLevel[], opportunityFilter: FilterLevel[]) => {
    return data.filter(corp => {
      const riskMatch = riskFilter.length === 0 || riskFilter.includes(corp['Overall Risk Level'] as FilterLevel);
      const opportunityMatch = opportunityFilter.length === 0 || opportunityFilter.includes(corp['Overall Opportunity Level'] as FilterLevel);
      return riskMatch && opportunityMatch;
    });
  };

  const toggleSortConfig = (field: SortField, configs: SortConfig[], setConfigs: React.Dispatch<React.SetStateAction<SortConfig[]>>) => {
    setConfigs(current => {
      const existingIndex = current.findIndex(config => config.field === field);
      const newConfigs = [...current];

      if (existingIndex >= 0) {
        newConfigs[existingIndex] = {
          ...newConfigs[existingIndex],
          order: newConfigs[existingIndex].order === 'asc' ? 'desc' : 'asc'
        };
      } else {
        newConfigs.push({
          field,
          order: 'asc',
          priority: current.length
        });
      }

      return newConfigs;
    });
  };

  const moveSortPriority = (field: SortField, direction: 'up' | 'down', configs: SortConfig[], setConfigs: React.Dispatch<React.SetStateAction<SortConfig[]>>) => {
    setConfigs(current => {
      const index = current.findIndex(config => config.field === field);
      if (index < 0) return current;

      const newConfigs = [...current];
      if (direction === 'up' && index > 0) {
        [newConfigs[index], newConfigs[index - 1]] = [newConfigs[index - 1], newConfigs[index]];
      } else if (direction === 'down' && index < newConfigs.length - 1) {
        [newConfigs[index], newConfigs[index + 1]] = [newConfigs[index + 1], newConfigs[index]];
      }

      return newConfigs;
    });
  };

  const removeSortConfig = (field: SortField, setConfigs: React.Dispatch<React.SetStateAction<SortConfig[]>>) => {
    setConfigs(current => current.filter(config => config.field !== field));
  };

  const toggleFilter = (level: FilterLevel, type: 'risk' | 'opportunity', isWatchlist: boolean) => {
    const setFilter = type === 'risk' 
      ? (isWatchlist ? setWatchlistRiskFilter : setCorpListRiskFilter)
      : (isWatchlist ? setWatchlistOpportunityFilter : setCorpListOpportunityFilter);
    const currentFilter = type === 'risk'
      ? (isWatchlist ? watchlistRiskFilter : corpListRiskFilter)
      : (isWatchlist ? watchlistOpportunityFilter : corpListOpportunityFilter);
    
    if (currentFilter.includes(level)) {
      setFilter(currentFilter.filter(l => l !== level));
    } else {
      setFilter([...currentFilter, level]);
    }
  };

  const SortMenu = ({ 
    configs, 
    setConfigs, 
    onClose 
  }: { 
    configs: SortConfig[], 
    setConfigs: React.Dispatch<React.SetStateAction<SortConfig[]>>,
    onClose: () => void 
  }) => (
    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg p-4 border z-50">
      <h3 className="font-medium text-gray-700 mb-2">Sort Priority</h3>
      <div className="space-y-2">
        {configs.map((config, index) => (
          <div key={config.field} className="flex items-center justify-between bg-gray-50 p-2 rounded">
            <div className="flex items-center gap-2">
              <span className="text-sm">
                {config.field === 'company' ? 'Name' : 
                 config.field === 'risk' ? 'Risk Level' : 'Opportunity Level'}
              </span>
              <button
                onClick={() => {
                  setConfigs(current => {
                    const newConfigs = [...current];
                    newConfigs[index] = {
                      ...newConfigs[index],
                      order: newConfigs[index].order === 'asc' ? 'desc' : 'asc'
                    };
                    return newConfigs;
                  });
                }}
                className="p-1 hover:bg-gray-200 rounded"
              >
                {config.order === 'asc' ? (
                  <ArrowUp className="h-4 w-4" />
                ) : (
                  <ArrowDown className="h-4 w-4" />
                )}
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => moveSortPriority(config.field, 'up', configs, setConfigs)}
                disabled={index === 0}
                className="text-gray-500 hover:text-gray-700 disabled:opacity-30"
              >
                ↑
              </button>
              <button
                onClick={() => moveSortPriority(config.field, 'down', configs, setConfigs)}
                disabled={index === configs.length - 1}
                className="text-gray-500 hover:text-gray-700 disabled:opacity-30"
              >
                ↓
              </button>
              <button
                onClick={() => removeSortConfig(config.field, setConfigs)}
                className="text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 space-x-2">
        {['company', 'risk', 'opportunity'].map(field => {
          if (configs.some(config => config.field === field)) return null;
          return (
            <button
              key={field}
              onClick={() => toggleSortConfig(field as SortField, configs, setConfigs)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              + Add {field === 'company' ? 'Name' : 
                     field === 'risk' ? 'Risk Level' : 'Opportunity Level'}
            </button>
          );
        })}
      </div>
    </div>
  );

  const FilterMenu = ({ 
    riskFilter,
    opportunityFilter,
    isWatchlist
  }: { 
    riskFilter: FilterLevel[],
    opportunityFilter: FilterLevel[],
    isWatchlist: boolean
  }) => (
    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg p-4 border z-50">
      <div className="space-y-4">
        <div>
          <h3 className="font-medium text-gray-700 mb-2">Risk Level</h3>
          <div className="space-y-2">
            {levelOrder.map(level => (
              <label key={level} className="flex items-center">
                <input
                  type="checkbox"
                  checked={riskFilter.includes(level as FilterLevel)}
                  onChange={() => toggleFilter(level as FilterLevel, 'risk', isWatchlist)}
                  className="mr-2 rounded"
                />
                <span className="text-sm">{level}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-medium text-gray-700 mb-2">Opportunity Level</h3>
          <div className="space-y-2">
            {levelOrder.map(level => (
              <label key={level} className="flex items-center">
                <input
                  type="checkbox"
                  checked={opportunityFilter.includes(level as FilterLevel)}
                  onChange={() => toggleFilter(level as FilterLevel, 'opportunity', isWatchlist)}
                  className="mr-2 rounded"
                />
                <span className="text-sm">{level}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const filteredAndSortedCorpData = sortData(
    filterData(corpData, corpListRiskFilter, corpListOpportunityFilter),
    corpListSortConfigs
  );
  
  const sortedWatchlistData = sortData(
    filterData(
      corpData.filter(corp => watchlist.includes(corp.Company)),
      watchlistRiskFilter,
      watchlistOpportunityFilter
    ),
    watchlistSortConfigs
  );

  const itemsPerPage = display.corpListPageSize;
  const totalPages = Math.ceil(filteredAndSortedCorpData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCorpData = filteredAndSortedCorpData.slice(startIndex, startIndex + itemsPerPage);

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`px-3 py-1 rounded ${
            currentPage === i
              ? 'bg-blue-600 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex items-center justify-between mt-6 pb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          {startPage > 1 && (
            <>
              <button
                onClick={() => setCurrentPage(1)}
                className="px-3 py-1 rounded text-gray-600 hover:bg-gray-100"
              >
                1
              </button>
              {startPage > 2 && <span className="px-2">...</span>}
            </>
          )}
          {pages}
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className="px-2">...</span>}
              <button
                onClick={() => setCurrentPage(totalPages)}
                className="px-3 py-1 rounded text-gray-600 hover:bg-gray-100"
              >
                {totalPages}
              </button>
            </>
          )}
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        <select
          value={display.corpListPageSize}
          onChange={(e) => {
            const newSize = Number(e.target.value);
            setCurrentPage(1);
            useSettingsStore.getState().setPageSize('corpListPageSize', newSize as 10 | 20 | 30 | 50);
          }}
          className="px-3 py-2 border rounded-lg"
        >
          {[10, 20, 30, 50].map(size => (
            <option key={size} value={size}>Show {size}</option>
          ))}
        </select>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Watchlist Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">My Watchlist</h2>
          <div className="flex gap-4">
            <div className="relative">
              <button
                onClick={() => setShowWatchlistSortMenu(!showWatchlistSortMenu)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <ArrowUpDown className="h-5 w-5 text-gray-600" />
              </button>
              {showWatchlistSortMenu && (
                <SortMenu
                  configs={watchlistSortConfigs}
                  setConfigs={setWatchlistSortConfigs}
                  onClose={() => setShowWatchlistSortMenu(false)}
                />
              )}
            </div>
            <div className="relative">
              <button
                onClick={() => setShowWatchlistFilterMenu(!showWatchlistFilterMenu)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <Filter className="h-5 w-5 text-gray-600" />
              </button>
              {showWatchlistFilterMenu && (
                <FilterMenu
                  riskFilter={watchlistRiskFilter}
                  opportunityFilter={watchlistOpportunityFilter}
                  isWatchlist={true}
                />
              )}
            </div>
          </div>
        </div>
        {watchlist.length === 0 ? (
          <p className="text-gray-500">No companies in your watchlist</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedWatchlistData.map(corp => (
              <button
                key={corp.Company}
                onClick={() => navigate(`/company/${corp.Company}`)}
                className="block text-left bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
              >
                <div className="font-medium text-gray-900">{corp.Company}</div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <div className={`p-2 rounded ${getLevelColor(corp['Overall Risk Level'], 'risk')}`}>
                    <div className="text-sm font-bold">{corp['Overall Risk Level']?.toUpperCase()}</div>
                    <div className="text-xs text-gray-500">RISK LEVEL</div>
                  </div>
                  <div className={`p-2 rounded ${getLevelColor(corp['Overall Opportunity Level'], 'opportunity')}`}>
                    <div className="text-sm font-bold">{corp['Overall Opportunity Level']?.toUpperCase()}</div>
                    <div className="text-xs text-gray-500">OPPORTUNITY LEVEL</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Corporate List Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Corporate List</h2>
          <div className="flex gap-4">
            <div className="relative">
              <button
                onClick={() => setShowCorpListSortMenu(!showCorpListSortMenu)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <ArrowUpDown className="h-5 w-5 text-gray-600" />
              </button>
              {showCorpListSortMenu && (
                <SortMenu
                  configs={corpListSortConfigs}
                  setConfigs={setCorpListSortConfigs}
                  onClose={() => setShowCorpListSortMenu(false)}
                />
              )}
            </div>
            <div className="relative">
              <button
                onClick={() => setShowCorpListFilterMenu(!showCorpListFilterMenu)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <Filter className="h-5 w-5 text-gray-600" />
              </button>
              {showCorpListFilterMenu && (
                <FilterMenu
                  riskFilter={corpListRiskFilter}
                  opportunityFilter={corpListOpportunityFilter}
                  isWatchlist={false}
                />
              )}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {paginatedCorpData.map((corp) => (
            <div key={corp.Company} className="flex items-center bg-gray-50 rounded-lg p-4">
              <button
                onClick={() => navigate(`/company/${corp.Company}`)}
                className="flex-1 grid grid-cols-3 gap-4 text-left"
              >
                <div className="font-medium text-gray-900">{corp.Company}</div>
                <div className={`p-2 rounded ${getLevelColor(corp['Overall Risk Level'], 'risk')}`}>
                  <div className="text-lg font-bold">{corp['Overall Risk Level']?.toUpperCase()}</div>
                  <div className="text-xs text-gray-500">RISK LEVEL</div>
                </div>
                <div className={`p-2 rounded ${getLevelColor(corp['Overall Opportunity Level'], 'opportunity')}`}>
                  <div className="text-lg font-bold">{corp['Overall Opportunity Level']?.toUpperCase()}</div>
                  <div className="text-xs text-gray-500">OPPORTUNITY LEVEL</div>
                </div>
              </button>
              <button
                onClick={() => handleWatchlistToggle(corp.Company)}
                className="ml-4 p-2 rounded-full hover:bg-gray-200"
              >
                {isWatched(corp.Company) ? (
                  <Star className="h-6 w-6 text-yellow-400 fill-current" />
                ) : (
                  <StarOff className="h-6 w-6 text-gray-400" />
                )}
              </button>
            </div>
          ))}
        </div>
        {renderPagination()}
      </div>
    </div>
  );
}
