import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-6 mt-12">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="text-gray-400">
          © 2024 NGO Field Data Collection Dashboard. All rights reserved.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Built with React + Vite | Backend: Node.js + Express
        </p>
      </div>
    </footer>
  );
};

export default Footer;
