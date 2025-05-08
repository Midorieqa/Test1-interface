import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { LogIn, UserPlus, AlertCircle } from 'lucide-react';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuthStore();

  const validateForm = () => {
    if (!email || !password) {
      throw new Error('Please fill in all required fields');
    }
    if (!isLogin && !username) {
      throw new Error('Display Name is required for registration');
    }
    if (!isLogin && password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Please enter a valid email address');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      validateForm();

      if (isLogin) {
        const result = await login(email, password);
        if (!result) {
          throw new Error('Invalid email or password. Please try again.');
        }
      } else {
        try {
          await register(email, password, username);
        } catch (error: any) {
          const errorMessage = error?.message?.toLowerCase() || '';
          
          if (errorMessage.includes('email already registered') || 
              errorMessage.includes('username or email already taken')) {
            throw new Error('This email is already registered. Please try logging in instead.');
          } else if (errorMessage.includes('email registration is currently disabled')) {
            throw new Error('Email registration is currently disabled. Please contact support.');
          } else {
            throw error;
          }
        }
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      
      const errorMessage = error?.message?.toLowerCase() || '';
      
      if (errorMessage.includes('invalid login credentials')) {
        setError('Invalid email or password. Please check your credentials and try again.');
      } else if (errorMessage.includes('email already registered') || 
                 errorMessage.includes('user already registered') ||
                 errorMessage.includes('username or email already taken')) {
        setError('This email is already registered. Please try logging in instead.');
      } else if (errorMessage.includes('email registration is currently disabled')) {
        setError('Email registration is currently disabled. Please contact support.');
      } else if (errorMessage.includes('password should be at least 6 characters')) {
        setError('Password must be at least 6 characters long.');
      } else if (errorMessage.includes('email address') && errorMessage.includes('invalid')) {
        setError('Please enter a valid email address (e.g., user@example.com)');
      } else if (errorMessage.includes('please fill in all required fields')) {
        setError('Please fill in all required fields.');
      } else if (errorMessage.includes('display name is required')) {
        setError('Please enter a display name.');
      } else {
        setError('An error occurred. Please check your information and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setError('');
    setEmail('');
    setPassword('');
    setUsername('');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            {isLogin ? 'Sign in to your account' : 'Create new account'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isLogin ? 'Welcome back!' : 'Join us today'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center text-red-700">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            {!isLogin && (
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Display Name
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required={!isLogin}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Enter your display name"
                />
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="user@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                minLength={6}
              />
              {!isLogin && (
                <p className="mt-1 text-sm text-gray-500">
                  Password must be at least 6 characters long
                </p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                loading ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {isLogin ? (
                <LogIn className="h-5 w-5 mr-2" />
              ) : (
                <UserPlus className="h-5 w-5 mr-2" />
              )}
              {loading ? 'Processing...' : (isLogin ? 'Sign in' : 'Sign up')}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                clearForm();
              }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {isLogin ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
