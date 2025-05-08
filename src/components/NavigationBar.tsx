import React, { useState } from 'react';
import { Search, Settings, Bell, ChevronDown } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export function NavigationBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchQuery = formData.get('search') as string;
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    setShowSearch(false);
  };

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-4">
            {/* Search Icon/Form */}
            <div className="relative">
              {showSearch ? (
                <form onSubmit={handleSearch} className="w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="search"
                      name="search"
                      placeholder="Search..."
                      autoFocus
                      onBlur={() => setShowSearch(false)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setShowSearch(true)}
                  className="p-2 rounded-full text-gray-400 hover:text-gray-500"
                >
                  <Search className="h-6 w-6" />
                </button>
              )}
            </div>

            {/* Navigation Links */}
            <div className="flex space-x-4">
              <Link 
                to="/dashboard" 
                className={`px-3 py-2 rounded-md text-sm relative group ${
                  isActive('/dashboard') 
                    ? 'font-bold text-gray-900' 
                    : 'font-medium text-gray-700 hover:text-gray-900'
                }`}
              >
                Dashboard
                <div className={`absolute bottom-0 left-0 w-full h-0.5 bg-gray-900 transform ${
                  isActive('/dashboard') 
                    ? 'opacity-100' 
                    : 'opacity-0 group-hover:opacity-100'
                } transition-opacity duration-200`} />
              </Link>
              <Link 
                to="/news" 
                className={`px-3 py-2 rounded-md text-sm relative group ${
                  isActive('/news') 
                    ? 'font-bold text-gray-900' 
                    : 'font-medium text-gray-700 hover:text-gray-900'
                }`}
              >
                News
                <div className={`absolute bottom-0 left-0 w-full h-0.5 bg-gray-900 transform ${
                  isActive('/news') 
                    ? 'opacity-100' 
                    : 'opacity-0 group-hover:opacity-100'
                } transition-opacity duration-200`} />
              </Link>
              <Link 
                to="/corp" 
                className={`px-3 py-2 rounded-md text-sm relative group ${
                  isActive('/corp') || isActive('/company')
                    ? 'font-bold text-gray-900' 
                    : 'font-medium text-gray-700 hover:text-gray-900'
                }`}
              >
                Corp
                <div className={`absolute bottom-0 left-0 w-full h-0.5 bg-gray-900 transform ${
                  isActive('/corp') || isActive('/company')
                    ? 'opacity-100' 
                    : 'opacity-0 group-hover:opacity-100'
                } transition-opacity duration-200`} />
              </Link>
              <Link 
                to="/network" 
                className={`px-3 py-2 rounded-md text-sm relative group ${
                  isActive('/network') 
                    ? 'font-bold text-gray-900' 
                    : 'font-medium text-gray-700 hover:text-gray-900'
                }`}
              >
                Network
                <div className={`absolute bottom-0 left-0 w-full h-0.5 bg-gray-900 transform ${
                  isActive('/network') 
                    ? 'opacity-100' 
                    : 'opacity-0 group-hover:opacity-100'
                } transition-opacity duration-200`} />
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            {user?.superuser && (
              <button
                onClick={() => navigate('/admin')}
                className="p-2 rounded-full text-gray-400 hover:text-gray-500"
              >
                Admin
              </button>
            )}
            <button
              onClick={() => navigate('/settings')}
              className="p-2 rounded-full text-gray-400 hover:text-gray-500"
            >
              <Settings className="h-6 w-6" />
            </button>

            <button
              onClick={() => navigate('/alerts')}
              className="p-2 rounded-full text-gray-400 hover:text-gray-500"
            >
              <Bell className="h-6 w-6" />
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2 text-sm"
              >
                <span>Hello, <span className="font-bold">{user?.username}</span></span>
                <ChevronDown className="h-4 w-4" />
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                  <div className="py-1">
                    <button
                      onClick={() => {
                        logout();
                        navigate('/');
                        setShowDropdown(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
