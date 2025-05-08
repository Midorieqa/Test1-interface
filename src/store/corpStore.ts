import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CorpState {
  watchlist: string[];
  addToWatchlist: (company: string) => void;
  removeFromWatchlist: (company: string) => void;
  isWatched: (company: string) => boolean;
}

export const useCorpStore = create<CorpState>()(
  persist(
    (set, get) => ({
      watchlist: [],
      addToWatchlist: (company) => {
        set((state) => ({
          watchlist: [...state.watchlist, company]
        }));
      },
      removeFromWatchlist: (company) => {
        set((state) => ({
          watchlist: state.watchlist.filter(c => c !== company)
        }));
      },
      isWatched: (company) => {
        return get().watchlist.includes(company);
      }
    }),
    {
      name: 'corp-storage'
    }
  )
);
