import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSearchStore } from '../store/searchStore';
import { useSettingsStore } from '../store/settingsStore';
import { ArrowUpDown, HelpCircle, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '../components/Badge';

export default function Search() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const { results, loading, sortBy, sortOrder, search, setSortBy, setSortOrder } = useSearchStore();
  const { display, setPageSize } = useSettingsStore();
  const [showSortHelp, setShowSortHelp] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (query) {
      search(query);
    }
  }, [query, search]);

  const sortedResults = [...results].sort((a, b) => {
    if (sortBy === 'relevance') {
      return sortOrder === 'desc' 
        ? b.relevanceScore - a.relevanceScore
        : a.relevanceScore - b.relevanceScore;
    } else {
      if (!a.time || !b.time) return sortOrder === 'desc' ? -1 : 1;
      return sortOrder === 'desc'
        ? new Date(b.time).getTime() - new Date(a.time).getTime()
        : new Date(a.time).getTime() - new Date(b.time).getTime();
    }
  });

  const companyResults = sortedResults.filter(result => result.type === 'company');
  const newsResults = sortedResults.filter(result => result.type === 'news');

  const itemsPerPage = display.searchResultsPageSize;
  const totalPages = Math.ceil(newsResults.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedNews = newsResults.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize('searchResultsPageSize', size as 10 | 20 | 30 | 50);
    setCurrentPage(1);
  };

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
          onClick={() => handlePageChange(i)}
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
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        {startPage > 1 && (
          <>
            <button
              onClick={() => handlePageChange(1)}
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
              onClick={() => handlePageChange(totalPages)}
              className="px-3 py-1 rounded text-gray-600 hover:bg-gray-100"
            >
              {totalPages}
            </button>
          </>
        )}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Search Results for "{query}"</h2>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Company Results */}
          {companyResults.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-semibold mb-4">Companies</h3>
              <div className="grid grid-cols-1 gap-4">
                {companyResults.map((result, index) => (
                  <button
                    key={index}
                    onClick={() => navigate(`/company/${result.title}`)}
                    className="block text-left bg-gray-50 rounded-lg p-4 hover:bg-gray-100"
                  >
                    <div className="grid grid-cols-3 gap-4">
                      <div className="font-medium text-gray-900">{result.title}</div>
                      <div className={`p-2 rounded ${result.riskLevel ? 'bg-red-50' : 'bg-gray-50'}`}>
                        <div className="text-sm font-bold">{result.riskLevel?.toUpperCase() || 'N/A'}</div>
                        <div className="text-xs text-gray-500">RISK LEVEL</div>
                      </div>
                      <div className={`p-2 rounded ${result.opportunityLevel ? 'bg-green-50' : 'bg-gray-50'}`}>
                        <div className="text-sm font-bold">{result.opportunityLevel?.toUpperCase() || 'N/A'}</div>
                        <div className="text-xs text-gray-500">OPPORTUNITY LEVEL</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* News Results */}
          {newsResults.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">News ({newsResults.length} results)</h3>
                <div className="flex items-center gap-4">
                  <select
                    value={display.searchResultsPageSize}
                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                    className="px-3 py-2 border rounded-lg"
                  >
                    {[10, 20, 30, 50].map(size => (
                      <option key={size} value={size}>Show {size}</option>
                    ))}
                  </select>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'relevance' | 'date')}
                    className="px-3 py-2 border rounded-lg"
                  >
                    <option value="relevance">Sort by Relevance</option>
                    <option value="date">Sort by Date</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="p-2 rounded-lg hover:bg-gray-100"
                  >
                    <ArrowUpDown className="h-5 w-5 text-gray-600" />
                  </button>
                  <div className="relative">
                    <button
                      onMouseEnter={() => setShowSortHelp(true)}
                      onMouseLeave={() => setShowSortHelp(false)}
                      className="p-2 rounded-lg hover:bg-gray-100"
                    >
                      <HelpCircle className="h-5 w-5 text-gray-600" />
                    </button>
                    {showSortHelp && (
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg p-4 border z-50">
                        <h3 className="font-medium mb-2">Default Sort Logic:</h3>
                        <ol className="text-sm space-y-2">
                          <li>1. Companies appear first</li>
                          <li>2. News items are sorted by:
                            <ul className="ml-4 mt-1">
                              <li>• Title matches (highest priority)</li>
                              <li>• Summary matches</li>
                              <li>• Number of occurrences</li>
                            </ul>
                          </li>
                        </ol>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                {paginatedNews.map((result, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <button
                      onClick={() => navigate(`/news/${result.id}`)}
                      className="block text-left w-full"
                    >
                      <h4 className="font-medium text-blue-600 hover:text-blue-800">
                        {result.title}
                      </h4>
                      <div className="flex items-center gap-4 mt-2">
                        {result.time && (
                          <span className="text-sm text-gray-500">
                            {new Date(result.time).toLocaleString()}
                          </span>
                        )}
                        {result.riskLevel && (
                          <span className="text-sm">
                            Risk Level: <Badge label={result.riskLevel} />
                          </span>
                        )}
                        {result.opportunityLevel && (
                          <span className="text-sm">
                            Opportunity Level: <Badge label={result.opportunityLevel} />
                          </span>
                        )}
                      </div>
                      {result.company && (
                        <div className="mt-2">
                          <Badge label={result.company} />
                        </div>
                      )}
                      {result.summary && (
                        <ul className="mt-3 list-disc pl-5 space-y-1 text-gray-700">
                          {result.summary.split('-').filter(point => point.trim()).map((point, i) => (
                            <li key={i}>{point.trim()}</li>
                          ))}
                        </ul>
                      )}
                    </button>
                  </div>
                ))}
              </div>
              {totalPages > 1 && (
                <div className="mt-6">
                  {renderPagination()}
                  <div className="text-center mt-2 text-sm text-gray-500">
                    Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, newsResults.length)} of {newsResults.length} results
                  </div>
                </div>
              )}
            </div>
          )}

          {results.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No results found for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
