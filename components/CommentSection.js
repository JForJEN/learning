import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Comment from './Comment';

const CommentSection = ({ courseId, comments }) => {
  const { isAuthenticated, addComment, currentUser } = useAuth();
  const [newComment, setNewComment] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      addComment(courseId, newComment);
      setNewComment('');
    }
  };

  return (
    <div className="mt-12">
      <h3 className="text-2xl font-bold mb-6 text-white">Diskusi</h3>
      <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
        {/* Form komentar hanya untuk user yang sudah login */}
        {isAuthenticated ? (
          <form onSubmit={handleSubmit} className="mb-8">
            <textarea
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-white focus:outline-none transition"
              rows={3}
              placeholder={`Berkomentar sebagai ${currentUser?.name}...`}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              required
            ></textarea>
            <button
              type="submit"
              className="mt-3 px-6 py-2 bg-white text-black font-semibold rounded-md hover:bg-gray-200 transition-colors disabled:bg-gray-500"
              disabled={!newComment.trim()}
            >
              Kirim Komentar
            </button>
          </form>
        ) : (
          <div className="mb-8 p-4 bg-gray-800 rounded-lg text-center">
            <p className="text-gray-400 mb-2">Silakan masuk untuk berpartisipasi dalam diskusi.</p>
            <button
              onClick={() => window.location.href = '/login'}
              className="px-4 py-2 bg-white text-black font-semibold rounded-md hover:bg-gray-200 transition-colors"
            >
              Masuk
            </button>
          </div>
        )}
        
        <div className="space-y-6">
          {comments.length > 0 ? (
            comments.map(comment => (
              <Comment key={comment.id} courseId={courseId} comment={comment} />
            ))
          ) : (
            <p className="text-gray-400 text-center py-4">Belum ada komentar. Jadilah yang pertama memulai diskusi!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentSection;
