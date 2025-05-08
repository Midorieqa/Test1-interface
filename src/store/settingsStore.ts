import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PageSize = 10 | 20 | 30 | 50;

interface DisplaySettings {
  searchResultsPageSize: PageSize;
  newsTablePageSize: PageSize;
  corpListPageSize: PageSize;
}

export interface ColumnConfig {
  id: string;
  label: string;
  enabled: boolean;
}

export interface SettingsState {
  display: DisplaySettings;
  newsColumns: ColumnConfig[];
  corpColumns: ColumnConfig[];
  setPageSize: (key: keyof DisplaySettings, size: PageSize) => void;
  updateColumnConfig: (type: 'news' | 'corp', columns: ColumnConfig[]) => void;
  resetNewsColumns: () => void;
  resetCorpColumns: () => void;
  loadUserSettings: () => void;
  saveUserSettings: () => void;
}

const defaultNewsColumns: ColumnConfig[] = [
  { id: 'risk_analysis', label: 'Risk Analysis', enabled: true },
  { id: 'opportunity_analysis', label: 'Opportunity Analysis', enabled: true },
  { id: 'sentiment_analysis', label: 'Sentiment Analysis', enabled: true },
  { id: 'news_summary', label: 'News Summary', enabled: true },
  { id: 'other_sources', label: 'Other Sources', enabled: true },
];

const defaultCorpColumns: ColumnConfig[] = [
  { id: 'risk_analysis', label: 'Risk Analysis', enabled: true },
  { id: 'opportunity_analysis', label: 'Opportunity Analysis', enabled: true },
  { id: 'sentiment_analysis', label: 'Sentiment Analysis', enabled: true },
  { id: 'company_summary', label: 'Company Summary', enabled: true },
  { id: 'network_analysis', label: 'Network Analysis', enabled: true },
];

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      display: {
        searchResultsPageSize: 10,
        newsTablePageSize: 10,
        corpListPageSize: 10,
      },
      newsColumns: defaultNewsColumns,
      corpColumns: defaultCorpColumns,

      setPageSize: (key, size) =>
        set((state) => ({
          display: {
            ...state.display,
            [key]: size,
          },
        })),

      updateColumnConfig: (type, columns) =>
        set((state) => ({
          [type === 'news' ? 'newsColumns' : 'corpColumns']: columns,
        })),

      resetNewsColumns: () =>
        set((state) => ({
          ...state,
          newsColumns: defaultNewsColumns,
        })),

      resetCorpColumns: () =>
        set((state) => ({
          ...state,
          corpColumns: defaultCorpColumns,
        })),

      loadUserSettings: () => {
        // Settings are automatically loaded from localStorage
      },

      saveUserSettings: () => {
        // Settings are automatically persisted to localStorage
      },
    }),
    {
      name: 'settings-storage',
    }
  )
);
