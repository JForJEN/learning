import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { login, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isAdminLogin, setIsAdminLogin] = useState(false);

  const from = location.state?.from?.pathname || location.search.replace('?redirect=', '') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Email dan password harus diisi');
      return;
    }
    
    console.log('🔍 Login attempt:', { 
      email, 
      password, 
      isAdmin: isAdminLogin,
      from: from 
    });
    
    try {
      const success = await login({ email, password, isAdmin: isAdminLogin });
      console.log('✅ Login result:', success);
      
      if (success) {
        if (isAdminLogin) {
          navigate('/admin');
        } else {
          navigate(from);
        }
      } else {
        setError('Gagal login. Silakan periksa email dan password Anda.');
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      setError('Gagal login. Silakan periksa email dan password Anda.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-gray-900 rounded-lg border border-gray-700">
      <h1 className="text-3xl font-bold mb-6 text-white text-center">Masuk</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</label>
          <input
            id="email"
            type="email"
            className="w-full p-2 rounded-md bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300">Password</label>
          <input
            id="password"
            type="password"
            className="w-full p-2 rounded-md bg-gray-800 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="flex items-center space-x-2">
          <input
            id="admin-login"
            type="checkbox"
            checked={isAdminLogin}
            onChange={() => setIsAdminLogin(!isAdminLogin)}
            className="h-4 w-4 text-yellow-500 focus:ring-yellow-400 border-gray-600 rounded"
          />
          <label htmlFor="admin-login" className="text-sm text-gray-300">Login sebagai Admin</label>
        </div>
        <button
          type="submit"
          className="w-full py-2 bg-white text-black font-semibold rounded-md hover:bg-gray-200 transition-colors"
        >
          Masuk
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
