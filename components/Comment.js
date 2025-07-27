import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { IconUser } from './Icons';

const Comment = ({ courseId, comment }) => {
  const { addComment, currentUser, isAuthenticated } = useAuth();
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');

  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (replyText.trim()) {
      addComment(courseId, replyText, comment.id);
      setReplyText('');
      setIsReplying(false);
    }
  };

  const timeAgo = (dateString) => {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " tahun yang lalu";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " bulan yang lalu";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " hari yang lalu";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " jam yang lalu";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " menit yang lalu";
    return Math.floor(seconds) + " detik yang lalu";
  };

  return (
    <div className="flex space-x-4">
      <div className="flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
          <IconUser className="w-6 h-6 text-gray-400" />
        </div>
      </div>
      <div className="flex-grow">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-white">{comment.author.name}</p>
            <p className="text-xs text-gray-400">{timeAgo(comment.timestamp)}</p>
          </div>
          <p className="text-gray-300 mt-2">{comment.text}</p>
        </div>
        {/* Tombol reply hanya untuk user yang sudah login */}
        {isAuthenticated && (
          <div className="mt-2 flex items-center space-x-4">
            <button onClick={() => setIsReplying(!isReplying)} className="text-xs font-semibold text-gray-400 hover:text-white transition">
              Balas
            </button>
          </div>
        )}
        {isReplying && (
          <form onSubmit={handleReplySubmit} className="mt-3 ml-4">
            <textarea
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-1 focus:ring-white focus:outline-none transition"
              rows={2}
              placeholder={`Membalas ${comment.author.name}...`}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              required
            ></textarea>
            <div className="flex justify-end space-x-2 mt-2">
              <button type="button" onClick={() => setIsReplying(false)} className="px-3 py-1 text-xs bg-gray-600 text-white rounded-md hover:bg-gray-500">Batal</button>
              <button type="submit" disabled={!replyText.trim()} className="px-3 py-1 text-xs bg-white text-black font-semibold rounded-md hover:bg-gray-200 disabled:bg-gray-400">Kirim</button>
            </div>
          </form>
        )}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 pl-6 border-l-2 border-gray-700 space-y-4">
            {comment.replies.map(reply => (
              <Comment key={reply.id} courseId={courseId} comment={reply} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Comment;
