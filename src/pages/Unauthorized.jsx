import React from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '@/components/ThemeToggle';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <>
      <div className="fixed top-4 right-4 z-[100]">
        <ThemeToggle />
      </div>
      <div className="min-h-screen bg-gradient-to-br from-red-500 to-red-600 dark:from-gray-900 dark:to-red-950 flex items-center justify-center px-4 transition-colors">
        <div className="bg-white dark:bg-gray-900 dark:border dark:border-gray-700 rounded-lg shadow-lg p-8 w-full max-w-md text-center text-gray-900 dark:text-gray-100">
          <h1 className="text-6xl font-bold text-red-600 dark:text-red-400 mb-4">🚫</h1>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You don't have permission to access this page. Please check your role or contact the
            administrator.
          </p>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition"
          >
            Back to Login
          </button>
        </div>
      </div>
    </>
  );
};

export default Unauthorized;
