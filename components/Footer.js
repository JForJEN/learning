import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 border-t border-gray-700 mt-auto">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">StillLearning</h3>
            <p className="text-gray-400 text-sm">
              Platform edukasi terbuka untuk semua. Berbagi pengetahuan, 
              belajar bersama, dan berkembang bersama.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Fitur</h3>
            <ul className="text-gray-400 text-sm space-y-2">
              <li>• Kursus Artikel & Multimedia</li>
              <li>• Sistem Komentar Hierarkis</li>
              <li>• Upload & Approval System</li>
              <li>• Panel Admin Terpadu</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Kontak</h3>
            <p className="text-gray-400 text-sm">
              Email: admin@stilllearning.com<br />
              Platform: Railway.app<br />
              Framework: React + Node.js
            </p>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-6 text-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} StillLearning. Dibuat dengan ❤️ untuk edukasi.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
