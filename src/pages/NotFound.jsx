import React from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '@/components/ThemeToggle';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <>
      <div className="fixed top-4 right-4 z-[100]">
        <ThemeToggle />
      </div>
      <div className="min-h-screen bg-gradient-to-br from-purple-500 to-purple-600 dark:from-gray-900 dark:to-purple-950 flex items-center justify-center px-4 transition-colors">
        <div className="bg-white dark:bg-gray-900 dark:border dark:border-gray-700 rounded-lg shadow-lg p-8 w-full max-w-md text-center text-gray-900 dark:text-gray-100">
          <h1 className="text-6xl font-bold text-purple-600 dark:text-purple-400 mb-4">404</h1>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Page Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Sorry, the page you're looking for doesn't exist. Please check the URL or go back to the
            home page.
          </p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition"
          >
            Go to Home
          </button>
        </div>
      </div>
    </>
  );
};

export default NotFound;
