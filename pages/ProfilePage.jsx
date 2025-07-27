import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const ProfilePage = () => {
  const { currentUser, updateProfile, courses, pendingCourses } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); 
  const [form, setForm] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    address: currentUser?.address || '',
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!currentUser) return <div className="text-center text-gray-400">User tidak ditemukan.</div>;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await updateProfile(form);
      setEditMode(false);
      setMessage('Profil berhasil diperbarui!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Gagal memperbarui profil. Silakan coba lagi.');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const myCourses = courses.filter(course => course.author.id === currentUser.id);
  const myPendingCourses = pendingCourses.filter(course => course.author.id === currentUser.id);

  const getStatusBadge = (isPublished) => {
    return isPublished ? 
      <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">Approved</span> :
      <span className="px-2 py-1 bg-yellow-600 text-white text-xs rounded-full">Pending</span>;
  };

  return (
    <div className="max-w-4xl mx-auto mt-12">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-900 p-1 rounded-lg mb-8">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'profile' 
              ? 'bg-white text-black' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Profil
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'history' 
              ? 'bg-white text-black' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Riwayat Upload
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-gray-900 p-8 rounded-lg border border-gray-700">
          <h1 className="text-3xl font-bold mb-6 text-white">Profil Saya</h1>
          {message && (
            <div className={`mb-4 p-3 rounded-md ${message.includes('berhasil') ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>
              {message}
            </div>
          )}
          
          <div className="flex items-center space-x-6 mb-8">
            <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center text-4xl text-white">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{currentUser.name}</h2>
              <p className="text-gray-400">{currentUser.email}</p>
              <p className="text-gray-400">{currentUser.role === 'admin' ? 'Administrator' : 'User'}</p>
            </div>
          </div>

          {editMode ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nama</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Telepon</label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="081234567890"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Alamat</label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Masukkan alamat lengkap"
                />
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Menyimpan...' : 'Simpan'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditMode(false);
                    setForm({
                      name: currentUser?.name || '',
                      email: currentUser?.email || '',
                      phone: currentUser?.phone || '',
                      address: currentUser?.address || '',
                    });
                  }}
                  className="px-6 py-2 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-700 transition-colors"
                >
                  Batal
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nama</label>
                <p className="text-white">{currentUser.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <p className="text-white">{currentUser.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Telepon</label>
                <p className="text-white">{currentUser.phone || 'Belum diisi'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Alamat</label>
                <p className="text-white">{currentUser.address || 'Belum diisi'}</p>
              </div>
              <button
                onClick={() => setEditMode(true)}
                className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
              >
                Edit Profil
              </button>
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="bg-gray-900 p-8 rounded-lg border border-gray-700">
          <h2 className="text-2xl font-bold mb-6 text-white">Riwayat Upload Materi</h2>
          
          {myCourses.length === 0 && myPendingCourses.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Anda belum mengupload materi apapun.</p>
          ) : (
            <div className="space-y-6">
              {myCourses.map(course => (
                <div key={course.id} className="bg-gray-800 p-4 rounded-lg border border-gray-600">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">{course.title}</h3>
                      <p className="text-gray-400 mb-2">{course.description}</p>
                      <p className="text-sm text-gray-500">Tipe: {course.contentType}</p>
                      {getStatusBadge(course.isPublished)}
                    </div>
                    <Link
                      to={`/course/${course.id}`}
                      className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Lihat
                    </Link>
                  </div>
                </div>
              ))}
              
              {myPendingCourses.map(course => (
                <div key={course.id} className="bg-gray-800 p-4 rounded-lg border border-gray-600">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">{course.title}</h3>
                      <p className="text-gray-400 mb-2">{course.description}</p>
                      <p className="text-sm text-gray-500">Tipe: {course.contentType}</p>
                      {getStatusBadge(course.isPublished)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfilePage; 