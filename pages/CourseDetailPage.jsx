import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CommentSection from '../components/CommentSection';

const CourseContent = ({ course }) => {
  switch (course.contentType) {
    case 'article':
      return <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: course.content.replace(/\n/g, '<br/>') }} />;
    case 'video':
      return course.filePath ? (
        <video className="w-full rounded-lg" src={course.filePath} controls />
      ) : (
        <div className="p-6 bg-gray-800 rounded-lg text-center">
          <p className="mb-4">Video tidak tersedia.</p>
        </div>
      );
    case 'audio':
      return course.filePath ? (
        <audio className="w-full" src={course.filePath} controls />
      ) : (
        <div className="p-6 bg-gray-800 rounded-lg text-center">
          <p className="mb-4">Audio tidak tersedia.</p>
        </div>
      );
    case 'image':
      return course.filePath ? (
        <img className="w-full rounded-lg" src={course.filePath} alt={course.title} />
      ) : (
        <div className="p-6 bg-gray-800 rounded-lg text-center">
          <p className="mb-4">Gambar tidak tersedia.</p>
        </div>
      );
    case 'pdf':
      return course.filePath ? (
        <div className="p-6 bg-gray-800 rounded-lg text-center">
          <p className="mb-4">Konten ini tersedia sebagai dokumen PDF.</p>
          <a href={course.filePath} target="_blank" rel="noopener noreferrer" className="inline-block bg-white text-black font-semibold px-6 py-2 rounded-md hover:bg-gray-200 transition-colors">
            Unduh PDF
          </a>
        </div>
      ) : (
        <div className="p-6 bg-gray-800 rounded-lg text-center">
          <p className="mb-4">PDF tidak tersedia.</p>
        </div>
      );
    default:
      return <p>Tipe konten tidak didukung.</p>;
  }
};

const CourseDetailPage = () => {
  const { courseId } = useParams();
  const { isAuthenticated, getApiBaseUrl } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const API_BASE_URL = getApiBaseUrl();
        const response = await fetch(`${API_BASE_URL}/courses/${courseId}`);
        
        if (response.ok) {
          const courseData = await response.json();
          setCourse(courseData);
        } else {
          console.error('Failed to fetch course');
        }
      } catch (error) {
        console.error('Error fetching course:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId, getApiBaseUrl]);

  const handleLoginRedirect = () => {
    navigate('/login', { state: { from: { pathname: `/course/${courseId}` } } });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!course) {
    return <div className="text-center text-gray-400">Kursus tidak ditemukan.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-4xl font-black text-white sm:text-5xl">{course.title}</h1>
        <p className="mt-2 text-lg text-gray-400">oleh {course.author.name}</p>
      </header>
      
      <div className="bg-gray-800/50 p-6 sm:p-8 rounded-lg border border-gray-700">
        {/* Konten selalu bisa dilihat oleh semua user (guest dan login) */}
        <CourseContent course={course} />
      </div>
      
      {/* Comment Section - guest bisa lihat komentar tapi tidak bisa komentar */}
      <CommentSection courseId={course.id} comments={course.comments} />
    </div>
  );
};

export default CourseDetailPage;
