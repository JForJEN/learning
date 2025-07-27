import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CommentSection from '../components/CommentSection';

const CourseContent = ({ course }) => {
  switch (course.contentType) {
    case 'ARTICLE':
      return <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: course.content.replace(/\n/g, '<br/>') }} />;
    case 'VIDEO':
      return <video className="w-full rounded-lg" src={course.filePath} controls />;
    case 'AUDIO':
      return <audio className="w-full" src={course.filePath} controls />;
    case 'IMAGE':
      return <img className="w-full rounded-lg" src={course.filePath} alt={course.title} />;
    case 'PDF':
      return (
        <div className="p-6 bg-gray-800 rounded-lg text-center">
            <p className="mb-4">Konten ini tersedia sebagai dokumen PDF.</p>
            <a href={course.filePath} target="_blank" rel="noopener noreferrer" className="inline-block bg-white text-black font-semibold px-6 py-2 rounded-md hover:bg-gray-200 transition-colors">
            Unduh PDF
            </a>
        </div>
      );
    case 'WORD':
      return (
        <div className="p-6 bg-gray-800 rounded-lg text-center">
            <p className="mb-4">Konten ini tersedia sebagai dokumen Word.</p>
            <a href={course.filePath} target="_blank" rel="noopener noreferrer" className="inline-block bg-white text-black font-semibold px-6 py-2 rounded-md hover:bg-gray-200 transition-colors">
            Unduh Word
            </a>
        </div>
      );
    case 'PPT':
      return (
        <div className="p-6 bg-gray-800 rounded-lg text-center">
            <p className="mb-4">Konten ini tersedia sebagai presentasi PowerPoint.</p>
            <a href={course.filePath} target="_blank" rel="noopener noreferrer" className="inline-block bg-white text-black font-semibold px-6 py-2 rounded-md hover:bg-gray-200 transition-colors">
            Unduh PowerPoint
            </a>
        </div>
      );
    default:
      return <p>Tipe konten tidak didukung.</p>;
  }
};

const CourseDetailPage = () => {
  const { courseId } = useParams();
  const { isAuthenticated, courses } = useAuth();
  const [course, setCourse] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const foundCourse = courses.find(c => c.id === Number(courseId));
    setCourse(foundCourse || null);
  }, [courseId, courses]);

  const handleLoginRedirect = () => {
    // Simpan URL saat ini ke state navigasi
    navigate('/login', { state: { from: { pathname: `/course/${courseId}` } } });
  };

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
