import React from 'react';
import { FiMoon, FiSun } from 'react-icons/fi';
import { useTheme } from '@/context/ThemeContext';

const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={
        'inline-flex items-center justify-center p-2 rounded-lg border transition-colors ' +
        'border-gray-300 bg-white text-amber-600 hover:bg-gray-50 ' +
        'dark:border-gray-600 dark:bg-gray-800 dark:text-amber-300 dark:hover:bg-gray-700 ' +
        className
      }
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      {isDark ? <FiSun className="h-5 w-5" aria-hidden /> : <FiMoon className="h-5 w-5" aria-hidden />}
    </button>
  );
};

export default ThemeToggle;
