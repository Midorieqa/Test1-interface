import { create } from 'zustand';
import Papa from 'papaparse';

interface SearchResult {
  type: 'company' | 'news';
  id?: string; // Added ID field for news items
  title: string;
  time?: string;
  relevanceScore: number;
  company?: string;
  summary?: string;
  fullContent?: string;
  riskLevel?: string;
  opportunityLevel?: string;
}

interface SearchState {
  results: SearchResult[];
  loading: boolean;
  sortBy: 'relevance' | 'date';
  sortOrder: 'asc' | 'desc';
  search: (query: string) => Promise<void>;
  setSortBy: (sortBy: 'relevance' | 'date') => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
}

const calculateRelevanceScore = (item: any, query: string): number => {
  const searchTerms = query.toLowerCase().split(' ');
  let score = 0;

  // For news items
  if (item.title) {
    const titleMatches = searchTerms.filter(term => 
      item.title.toLowerCase().includes(term)
    ).length;
    score += titleMatches * 3;

    if (item.summary) {
      const summaryMatches = searchTerms.filter(term => 
        item.summary.toLowerCase().includes(term)
      ).length;
      score += summaryMatches * 2;
    }
  }
  // For company items
  else if (item.Company) {
    const companyMatches = searchTerms.filter(term => 
      item.Company.toLowerCase().includes(term)
    ).length;
    score += companyMatches * 4;
  }

  return score;
};

export const useSearchStore = create<SearchState>((set) => ({
  results: [],
  loading: false,
  sortBy: 'relevance',
  sortOrder: 'desc',

  search: async (query: string) => {
    set({ loading: true });
    try {
      // Load company data
      const corpResponse = await fetch('/corplevel.csv');
      const corpText = await corpResponse.text();
      const corpResult = Papa.parse(corpText, { header: true });
      
      // Load news data
      const newsResponse = await fetch('/newslevel.csv');
      const newsText = await newsResponse.text();
      const newsResult = Papa.parse(newsText, { header: true });

      const results: SearchResult[] = [];

      // Search companies
      corpResult.data
        .filter((item: any) => item.Company?.toLowerCase().includes(query.toLowerCase()))
        .forEach((item: any) => {
          results.push({
            type: 'company',
            title: item.Company,
            riskLevel: item['Overall Risk Level'],
            opportunityLevel: item['Overall Opportunity Level'],
            relevanceScore: calculateRelevanceScore(item, query)
          });
        });

      // Search news
      newsResult.data
        .filter((item: any, index: number) => {
          const searchTerms = query.toLowerCase().split(' ');
          return searchTerms.some(term => 
            item.title?.toLowerCase().includes(term) ||
            item.summary?.toLowerCase().includes(term)
          );
        })
        .forEach((item: any, index: number) => {
          results.push({
            type: 'news',
            id: index.toString(), // Use the actual index from the data
            title: item.title,
            time: item.time,
            company: item.company,
            summary: item.summary,
            riskLevel: item.risklev,
            opportunityLevel: item.opplev,
            relevanceScore: calculateRelevanceScore(item, query)
          });
        });

      set({ results, loading: false });
    } catch (error) {
      console.error('Error searching:', error);
      set({ results: [], loading: false });
    }
  },

  setSortBy: (sortBy) => set({ sortBy }),
  setSortOrder: (sortOrder) => set({ sortOrder })
}));
