import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || location.search.replace('?redirect=', '') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (!email || !password) {
      setError('Email dan password harus diisi');
      setLoading(false);
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
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      setError(err.message || 'Gagal login. Silakan periksa email dan password Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-gray-900 rounded-lg border border-gray-700">
      <h1 className="text-3xl font-bold mb-6 text-white text-center">Masuk</h1>
      {error && (
        <div className="mb-4 p-3 bg-red-900 text-red-400 rounded-md">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">Email</label>
          <input
            id="email"
            type="email"
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Masukkan email Anda"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">Password</label>
          <input
            id="password"
            type="password"
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Masukkan password Anda"
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
          disabled={loading}
          className="w-full py-2 bg-white text-black font-semibold rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Memproses...' : 'Masuk'}
        </button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-gray-400 text-sm">
          Belum punya akun?{' '}
          <a href="/register" className="text-blue-400 hover:text-blue-300">
            Daftar di sini
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
