import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 border-t border-gray-700 mt-auto">
      <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div className="text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} StillLearning .</p>
          <p className="mt-1"></p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
