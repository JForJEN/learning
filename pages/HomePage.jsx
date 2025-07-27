import React from 'react';
import CourseCard from '../components/CourseCard';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const { courses } = useAuth();
  
  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-4xl font-black text-center tracking-tight text-white sm:text-5xl lg:text-6xl">
          Jangan Pernah Berhenti Belajar
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-center text-lg text-gray-400">
          Jelajahi dunia pengetahuan. Telusuri kursus kami dan mulailah perjalanan Anda hari ini.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {courses.map(course => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>

      {courses.length === 0 && (
          <div className="text-center py-16">
              <p className="text-gray-500">Tidak ada kursus yang tersedia saat ini. Silakan kembali lagi nanti!</p>
          </div>
      )}
    </div>
  );
};

export default HomePage;
