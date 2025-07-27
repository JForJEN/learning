import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IconBook, IconPlus, IconUser, IconAdmin, IconLogout } from './Icons';

const Header = () => {
  const { currentUser, logout, isAuthenticated } = useAuth();

  const activeLinkStyle = {
    color: 'white',
    backgroundColor: '#333',
  };

  return (
    <header className="bg-gray-900 border-b border-gray-700 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center space-x-2 text-white text-xl font-bold">
              <IconBook className="h-8 w-8" />
              <span>StillLearning</span>
            </Link>
            <nav className="hidden md:flex md:ml-10 md:space-x-4">
               <NavLink 
                to="/submit" 
                className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                style={({ isActive }) => isActive ? activeLinkStyle : {}}
               >
                Kirim Kursus
              </NavLink>
              {currentUser?.role === 'admin' && (
                <NavLink 
                  to="/admin" 
                  className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  style={({ isActive }) => isActive ? activeLinkStyle : {}}
                >
                  Panel Admin
                </NavLink>
              )}
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <div className="flex items-center text-sm text-gray-300">
                  {currentUser?.role === 'admin' ? <IconAdmin className="w-5 h-5 mr-2 text-yellow-400"/> : <IconUser className="w-5 h-5 mr-2" />}
                  <span className="hidden sm:inline">Selamat datang, {currentUser?.name}</span>
                </div>
                <Link
                  to="/profile"
                  className="bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Profil
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center bg-gray-800 text-gray-300 hover:bg-red-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  <IconLogout className="w-5 h-5 mr-1" />
                  Keluar
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400 hidden sm:inline">Lihat konten gratis tanpa login</span>
                 <Link
                  to="/login"
                  className="bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Masuk
                </Link>
                <Link
                  to="/register"
                  className="bg-white text-black hover:bg-gray-200 px-4 py-2 rounded-md text-sm font-bold transition-colors"
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
