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
    avatar: currentUser?.avatar || '',
  });
  const [message, setMessage] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(currentUser?.avatar || null);

  if (!currentUser) return <div className="text-center text-gray-400">User tidak ditemukan.</div>;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleProfileImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setProfileImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedData = { ...form };
    if (profileImagePreview && profileImagePreview !== currentUser?.avatar) {
      updatedData.avatar = profileImagePreview;
    }
    updateProfile(updatedData);
    setEditMode(false);
    setMessage('Profil berhasil diperbarui!');
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
        <button
          onClick={() => setActiveTab('forMe')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'forMe' 
              ? 'bg-white text-black' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          For Me
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-gray-900 p-8 rounded-lg border border-gray-700">
          <h1 className="text-3xl font-bold mb-6 text-white">Profil Saya</h1>
          {message && <div className="mb-4 text-green-400">{message}</div>}
          
          <div className="flex items-center space-x-6 mb-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center text-4xl text-white overflow-hidden">
                {profileImagePreview ? (
                  <img src={profileImagePreview} alt="avatar" className="w-24 h-24 object-cover" />
                ) : (
                  currentUser.name[0].toUpperCase()
                )}
              </div>
              {editMode && (
                <label className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <div>
              <div className="text-lg font-semibold text-white">{currentUser.role === 'admin' ? 'Admin' : 'User'}</div>
            </div>
          </div>

          {editMode ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Nama</label>
                <input type="text" name="name" value={form.name} onChange={handleChange} className="w-full p-2 rounded-md bg-gray-800 border border-gray-600 text-white" required />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Email</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full p-2 rounded-md bg-gray-800 border border-gray-600 text-white" required />
              </div>
              <div className="flex space-x-2">
                <button type="submit" className="px-4 py-2 bg-white text-black rounded-md font-semibold">Simpan</button>
                <button type="button" onClick={() => setEditMode(false)} className="px-4 py-2 bg-gray-700 text-white rounded-md">Batal</button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <div>
                <span className="text-gray-400">Nama:</span> <span className="text-white font-medium">{currentUser.name}</span>
              </div>
              <div>
                <span className="text-gray-400">Email:</span> <span className="text-white font-medium">{currentUser.email}</span>
              </div>
              <div>
                <span className="text-gray-400">Role:</span> <span className="text-white font-medium">{currentUser.role}</span>
              </div>
              <button onClick={() => setEditMode(true)} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md font-semibold">Edit Profil</button>
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="bg-gray-900 p-8 rounded-lg border border-gray-700">
          <h2 className="text-2xl font-bold mb-6 text-white">Riwayat Upload Materi</h2>
          
          <div className="space-y-4">
            {/* Approved Courses */}
            {myCourses.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Materi yang Sudah Di-approve ({myCourses.length})</h3>
                <div className="space-y-3">
                  {myCourses.map(course => (
                    <div key={course.id} className="bg-gray-800 p-4 rounded-lg border border-gray-600">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="text-white font-medium">{course.title}</h4>
                          <p className="text-gray-400 text-sm mt-1">{course.description}</p>
                          <p className="text-gray-500 text-xs mt-2">Tipe: {course.contentType}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(true)}
                          <Link to={`/course/${course.id}`} className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700">
                            Lihat
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pending Courses */}
            {myPendingCourses.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Materi Menunggu Approval ({myPendingCourses.length})</h3>
                <div className="space-y-3">
                  {myPendingCourses.map(course => (
                    <div key={course.id} className="bg-gray-800 p-4 rounded-lg border border-gray-600">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="text-white font-medium">{course.title}</h4>
                          <p className="text-gray-400 text-sm mt-1">{course.description}</p>
                          <p className="text-gray-500 text-xs mt-2">Tipe: {course.contentType}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(false)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {myCourses.length === 0 && myPendingCourses.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-400">Belum ada materi yang diupload.</p>
                <Link to="/submit" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Upload Materi Pertama
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* For Me Tab */}
      {activeTab === 'forMe' && (
        <div className="bg-gray-900 p-8 rounded-lg border border-gray-700">
          <h2 className="text-2xl font-bold mb-6 text-white">For Me - Semua Materi yang Sudah Di-approve</h2>
          
          {courses.length > 0 ? (
            <div className="max-h-96 overflow-y-auto pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map(course => (
                  <div key={course.id} className="bg-gray-800 rounded-lg overflow-hidden border border-gray-600 hover:border-gray-500 transition-colors">
                    <div className="p-4">
                      <h3 className="text-white font-medium mb-2">{course.title}</h3>
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">{course.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-xs">Oleh: {course.author.name}</span>
                        <Link 
                          to={`/course/${course.id}`} 
                          className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors"
                        >
                          Lihat & Komentar
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">Belum ada materi yang tersedia.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfilePage; 