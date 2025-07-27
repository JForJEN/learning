import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const AdminDashboardPage = () => {
  const { pendingCourses, approveCourse, rejectCourse, getApiBaseUrl } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const API_BASE_URL = getApiBaseUrl();
        const response = await fetch(`${API_BASE_URL}/admin/stats`);
        
        if (response.ok) {
          const statsData = await response.json();
          setStats(statsData);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [getApiBaseUrl]);

  const handleApprove = async (courseId) => {
    try {
      await approveCourse(courseId);
    } catch (error) {
      console.error('Error approving course:', error);
    }
  };

  const handleReject = async (courseId) => {
    if (window.confirm('Apakah Anda yakin ingin menolak kursus ini?')) {
      try {
        await rejectCourse(courseId);
      } catch (error) {
        console.error('Error rejecting course:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-white">Dashboard Admin</h1>
      
      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-blue-600 p-6 rounded-lg border border-blue-500">
            <h3 className="text-lg font-semibold text-white mb-2">Total Users</h3>
            <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
          </div>
          <div className="bg-green-600 p-6 rounded-lg border border-green-500">
            <h3 className="text-lg font-semibold text-white mb-2">Kursus Disetujui</h3>
            <p className="text-3xl font-bold text-white">{stats.approvedCourses}</p>
          </div>
          <div className="bg-yellow-600 p-6 rounded-lg border border-yellow-500">
            <h3 className="text-lg font-semibold text-white mb-2">Menunggu Approval</h3>
            <p className="text-3xl font-bold text-white">{stats.pendingCourses}</p>
          </div>
          <div className="bg-purple-600 p-6 rounded-lg border border-purple-500">
            <h3 className="text-lg font-semibold text-white mb-2">Total Komentar</h3>
            <p className="text-3xl font-bold text-white">{stats.totalComments}</p>
          </div>
        </div>
      )}
      
      <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
        <h2 className="text-xl font-semibold mb-6 text-white">Materi Menunggu Approval</h2>
        
        {pendingCourses.length === 0 ? (
          <p className="text-gray-400 text-center py-8">Tidak ada materi yang menunggu approval.</p>
        ) : (
          <div className="space-y-6">
            {pendingCourses.map(course => (
              <div key={course.id} className="bg-gray-800 p-4 rounded-lg border border-gray-600">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">{course.title}</h3>
                    <p className="text-gray-400 mb-2">{course.description}</p>
                    <p className="text-sm text-gray-500">Oleh: {course.author.name}</p>
                    <p className="text-sm text-gray-500">Tipe: {course.contentType}</p>
                    {course.fileName && (
                      <div className="mt-2 p-2 bg-gray-700 rounded text-sm">
                        <p className="text-gray-300">File: {course.fileName}</p>
                        <p className="text-gray-400">Ukuran: {(course.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                        <p className="text-gray-400">Tipe: {course.fileType}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleApprove(course.id)}
                      className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(course.id)}
                      className="px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
