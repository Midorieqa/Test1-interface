import React, { useEffect, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from './store/authStore';
import { NavigationBar } from './components/NavigationBar';

const Login = React.lazy(() => import('./components/Login'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const NewsPage = React.lazy(() => import('./pages/NewsPage'));
const ContentPage = React.lazy(() => import('./pages/ContentPage'));
const CorpPage = React.lazy(() => import('./pages/CorpPage'));
const CompanyPage = React.lazy(() => import('./pages/CompanyPage'));
const Network = React.lazy(() => import('./pages/Network'));
const Settings = React.lazy(() => import('./pages/Settings'));
const Alerts = React.lazy(() => import('./pages/Alerts'));
const Search = React.lazy(() => import('./pages/Search'));

function App() {
  const { isAuthenticated } = useAuthStore();

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center min-h-[200px]">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
    </div>
  );

  if (!isAuthenticated) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <Login />
      </Suspense>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <NavigationBar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/news" element={<NewsPage />} />
              <Route path="/news/:id" element={<ContentPage />} />
              <Route path="/corp" element={<CorpPage />} />
              <Route path="/company/:name" element={<CompanyPage />} />
              <Route path="/network" element={<Network />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/search" element={<Search />} />
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
