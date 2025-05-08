import React, { useState } from 'react';
import { useSettingsStore, PageSize } from '../store/settingsStore';
import { useAuthStore } from '../store/authStore';
import { GripVertical, RotateCcw } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const pageSizeOptions: PageSize[] = [10, 20, 30, 50];

export default function Settings() {
  const {
    display,
    newsColumns,
    corpColumns,
    setPageSize,
    updateColumnConfig,
    resetNewsColumns,
    resetCorpColumns,
  } = useSettingsStore();

  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'display' | 'account'>('display');

  const handleDragEnd = (result: any, type: 'news' | 'corp') => {
    if (!result.destination) return;

    const items = type === 'news' ? [...newsColumns] : [...corpColumns];
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    updateColumnConfig(type, items);
  };

  const toggleColumn = (columnId: string, type: 'news' | 'corp') => {
    const columns = type === 'news' ? newsColumns : corpColumns;
    const updatedColumns = columns.map(col =>
      col.id === columnId ? { ...col, enabled: !col.enabled } : col
    );
    updateColumnConfig(type, updatedColumns);
  };

  return (
    <div className="flex gap-6">
      {/* Sidebar */}
      <div className="w-64 bg-white rounded-lg shadow-sm p-4">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Settings</h2>
          <p className="text-sm text-gray-500 mt-1">for Hatsune Miku</p>
        </div>
        <nav>
          <div className="space-y-1">
            <button
              onClick={() => setActiveTab('display')}
              className={`w-full text-left px-3 py-2 rounded-lg ${
                activeTab === 'display'
                  ? 'bg-blue-50 text-blue-600'
                  : 'hover:bg-gray-50'
              }`}
            >
              Display
            </button>
            <button
              onClick={() => setActiveTab('account')}
              className={`w-full text-left px-3 py-2 rounded-lg ${
                activeTab === 'account'
                  ? 'bg-blue-50 text-blue-600'
                  : 'hover:bg-gray-50'
              }`}
            >
              Account
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-white rounded-lg shadow-sm p-6">
        {activeTab === 'display' && (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Items Per Page</h3>
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left font-medium text-gray-500 pb-2">Section</th>
                    <th className="text-left font-medium text-gray-500 pb-2">Items</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="py-2 text-gray-700">Search Results</td>
                    <td>
                      <select
                        value={display.searchResultsPageSize}
                        onChange={(e) => setPageSize('searchResultsPageSize', Number(e.target.value) as PageSize)}
                        className="px-3 py-1 border rounded"
                      >
                        {pageSizeOptions.map(size => (
                          <option key={size} value={size}>{size}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 text-gray-700">News Table</td>
                    <td>
                      <select
                        value={display.newsTablePageSize}
                        onChange={(e) => setPageSize('newsTablePageSize', Number(e.target.value) as PageSize)}
                        className="px-3 py-1 border rounded"
                      >
                        {pageSizeOptions.map(size => (
                          <option key={size} value={size}>{size}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 text-gray-700">Corporate List</td>
                    <td>
                      <select
                        value={display.corpListPageSize}
                        onChange={(e) => setPageSize('corpListPageSize', Number(e.target.value) as PageSize)}
                        className="px-3 py-1 border rounded"
                      >
                        {pageSizeOptions.map(size => (
                          <option key={size} value={size}>{size}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">News Content Sections</h3>
                <button
                  onClick={resetNewsColumns}
                  className="flex items-center gap-2 px-3 py-1 text-sm rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset to Default
                </button>
              </div>
              <DragDropContext onDragEnd={(result) => handleDragEnd(result, 'news')}>
                <Droppable droppableId="news-columns">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-2"
                    >
                      {newsColumns.map((column, index) => (
                        <Draggable
                          key={column.id}
                          draggableId={column.id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <div {...provided.dragHandleProps}>
                                  <GripVertical className="h-5 w-5 text-gray-400" />
                                </div>
                                <label className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={column.enabled}
                                    onChange={() => toggleColumn(column.id, 'news')}
                                    className="rounded"
                                  />
                                  <span className="text-gray-700">{column.label}</span>
                                </label>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Corporate Content Sections</h3>
                <button
                  onClick={resetCorpColumns}
                  className="flex items-center gap-2 px-3 py-1 text-sm rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset to Default
                </button>
              </div>
              <DragDropContext onDragEnd={(result) => handleDragEnd(result, 'corp')}>
                <Droppable droppableId="corp-columns">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-2"
                    >
                      {corpColumns.map((column, index) => (
                        <Draggable
                          key={column.id}
                          draggableId={column.id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <div {...provided.dragHandleProps}>
                                  <GripVertical className="h-5 w-5 text-gray-400" />
                                </div>
                                <label className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={column.enabled}
                                    onChange={() => toggleColumn(column.id, 'corp')}
                                    className="rounded"
                                  />
                                  <span className="text-gray-700">{column.label}</span>
                                </label>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          </div>
        )}

        {activeTab === 'account' && (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h3>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-blue-600">Account settings will be available soon.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
