import { create } from 'zustand';
import Papa from 'papaparse';
import { NewsItem } from '../types';

interface NewsState {
  news: NewsItem[];
  loading: boolean;
  searchTerm: string;
  sortOrder: 'asc' | 'desc';
  setSearchTerm: (term: string) => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  getFilteredNews: () => NewsItem[];
  initializeNews: () => Promise<void>;
}

export const useNewsStore = create<NewsState>((set, get) => ({
  news: [],
  loading: false,
  searchTerm: '',
  sortOrder: 'desc',

  initializeNews: async () => {
    set({ loading: true });
    try {
      const response = await fetch('/sampledataforinterface.csv');
      const text = await response.text();
      const { data } = Papa.parse(text, { header: true });
      
      const news = data.map((item: any, index: number) => ({
        id: String(index),
        source: item.source || '',
        title: item.title || '',
        published: item.published || '',
        triples_prompt_4omini: item.triples_prompt_4omini || '',
        summary_prompt_4omini: item.summary_prompt_4omini || '',
        company_scores_4o_mini: item.company_scores_4o_mini || ''
      }));

      set({ news, loading: false });
    } catch (error) {
      console.error('Error loading news:', error);
      set({ loading: false });
    }
  },

  setSearchTerm: (searchTerm: string) => set({ searchTerm }),
  setSortOrder: (sortOrder: 'asc' | 'desc') => set({ sortOrder }),

  getFilteredNews: () => {
    const { news, searchTerm, sortOrder } = get();
    
    return news
      .filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.summary_prompt_4omini.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        const dateA = new Date(a.published).getTime();
        const dateB = new Date(b.published).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });
  },
}));
