import React from 'react';
import { useAuth } from '../context/AuthContext';

const AdminDashboardPage = () => {
  const { pendingCourses, approveCourse } = useAuth();

  const handleApprove = (courseId) => {
    approveCourse(courseId);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-white">Dashboard Admin</h1>
      
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
                  <button
                    onClick={() => handleApprove(course.id)}
                    className="ml-4 px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors"
                  >
                    Approve
                  </button>
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
