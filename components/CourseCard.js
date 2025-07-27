import React from 'react';
import { Link } from 'react-router-dom';
import { IconArticle, IconImage, IconPDF, IconAudio, IconVideo } from './Icons';

const ContentTypeIcon = ({ type }) => {
  const iconClasses = "w-5 h-5 text-gray-400";
  switch (type) {
    case 'article': return <IconArticle className={iconClasses} />;
    case 'image': return <IconImage className={iconClasses} />;
    case 'pdf': return <IconPDF className={iconClasses} />;
    case 'audio': return <IconAudio className={iconClasses} />;
    case 'video': return <IconVideo className={iconClasses} />;
    default: return <IconArticle className={iconClasses} />;
  }
};

const CourseCard = ({ course }) => {
  const renderPreview = () => {
    if (course.thumbnailUrl) {
      return (
        <img className="h-48 w-full object-cover" src={course.thumbnailUrl} alt={course.title} />
      );
    }
    
    switch (course.contentType) {
      case 'video':
        return course.filePath ? (
          <video className="h-48 w-full object-cover" src={course.filePath} controls muted />
        ) : (
          <div className="h-48 w-full flex items-center justify-center bg-gray-800">
            <ContentTypeIcon type={course.contentType} />
          </div>
        );
      case 'audio':
        return course.filePath ? (
          <div className="h-48 w-full flex items-center justify-center bg-gray-800">
            <audio src={course.filePath} controls />
          </div>
        ) : (
          <div className="h-48 w-full flex items-center justify-center bg-gray-800">
            <ContentTypeIcon type={course.contentType} />
          </div>
        );
      case 'image':
        return course.filePath ? (
          <img className="h-48 w-full object-cover" src={course.filePath} alt={course.title} />
        ) : (
          <div className="h-48 w-full flex items-center justify-center bg-gray-800">
            <ContentTypeIcon type={course.contentType} />
          </div>
        );
      default:
        return (
          <div className="h-48 w-full flex items-center justify-center bg-gray-800">
            <ContentTypeIcon type={course.contentType} />
          </div>
        );
    }
  };

  return (
    <Link to={`/course/${course.id}`} className="block group">
      <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-700 hover:border-white transition-all duration-300 h-full flex flex-col transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-gray-800/50">
        <div className="relative">
          {renderPreview()}
          <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-0 transition-opacity"></div>
        </div>
        <div className="p-5 flex flex-col flex-grow">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-bold text-white group-hover:text-gray-100">{course.title}</h3>
            <div className="flex-shrink-0 ml-2" title={`Tipe Konten: ${course.contentType}`}>
              <ContentTypeIcon type={course.contentType} />
            </div>
          </div>
          <p className="text-sm text-gray-400 flex-grow">{course.description}</p>
          <div className="mt-4 text-xs text-gray-500">
            <span>Oleh {course.author.name}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
