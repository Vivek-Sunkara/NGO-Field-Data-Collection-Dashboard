import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-6 mt-12 dark:bg-gray-950 dark:border-t dark:border-gray-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="text-gray-400 dark:text-gray-500">
          © 2024 NGO Field Data Collection Dashboard. All rights reserved.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-600 mt-2">
          Built with React + Vite | Backend: Node.js + Express
        </p>
      </div>
    </footer>
  );
};

export default Footer;
