import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState } from '../types';

// Example user data from CSV
const EXAMPLE_USER = {
  id: '1',
  email: 'test@hsbc.hk',
  username: 'HSBC Guest',
  superuser: false,
  configuration: {
      searchResultsPageSize: 10,
      newsTablePageSize: 10,
      corpListPageSize: 10
    },
    newsColumns: [
      { id: 'risk_analysis', label: 'Risk Analysis', enabled: true },
      { id: 'opportunity_analysis', label: 'Opportunity Analysis', enabled: true },
      { id: 'sentiment_analysis', label: 'Sentiment Analysis', enabled: true },
      { id: 'news_summary', label: 'News Summary', enabled: true }
    ],
    corpColumns: [
      { id: 'risk_analysis', label: 'Risk Analysis', enabled: true },
      { id: 'opportunity_analysis', label: 'Opportunity Analysis', enabled: true },
      { id: 'sentiment_analysis', label: 'Sentiment Analysis', enabled: true },
      { id: 'company_summary', label: 'Company Summary', enabled: true }
    ],
  created_at: ''
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      
      login: async (email: string, password: string) => {
        try {
          // For demo purposes, check against example user
          if (email === EXAMPLE_USER.email && password === '123456') {
            const userWithTimestamp = {
              ...EXAMPLE_USER,
              created_at: new Date().toISOString()
            };
            set({ 
              user: userWithTimestamp,
              isAuthenticated: true 
            });
            return true;
          }
          return false;
        } catch (error) {
          console.error('Login error:', error);
          return false;
        }
      },
      
      logout: async () => {
        set({ user: null, isAuthenticated: false });
      },
      
      register: async (email: string, password: string, username: string) => {
        try {
          // For demo purposes, only allow registering if email isn't taken
          if (email === EXAMPLE_USER.email) {
            throw new Error('Email already registered');
          }

          const newUser = {
            id: Math.random().toString(),
            email,
            username,
            superuser: false,
            configuration: EXAMPLE_USER.configuration,
            created_at: new Date().toISOString()
          };

          set({ 
            user: newUser,
            isAuthenticated: true 
          });

          return true;
        } catch (error) {
          console.error('Registration error:', error);
          return false;
        }
      },

      updateUserConfig: async (config: Record<string, any>) => {
        try {
          set(state => ({
            user: state.user ? {
              ...state.user,
              configuration: config
            } : null
          }));
        } catch (error) {
          console.error('Error updating user config:', error);
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated 
      })
    }
  )
);
