import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SubmitCoursePage = () => {
  const { addCourseForApproval } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    contentType: 'article',
    content: ''
  });

  const [uploadedFile, setUploadedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadedFile(file);
    
    // Generate preview untuk gambar
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }

    // Auto-detect content type berdasarkan file extension
    const extension = file.name.split('.').pop().toLowerCase();
    const contentTypeMap = {
      'pdf': 'pdf',
      'mp4': 'video',
      'avi': 'video',
      'mov': 'video',
      'mp3': 'audio',
      'wav': 'audio',
      'jpg': 'image',
      'jpeg': 'image',
      'png': 'image',
      'gif': 'image',
      'txt': 'article',
      'md': 'article'
    };
    
    if (contentTypeMap[extension]) {
      setFormData(prev => ({ ...prev, contentType: contentTypeMap[extension] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const courseData = {
        ...formData,
        uploadedFile: uploadedFile
      };
      
      await addCourseForApproval(courseData);
      navigate('/');
    } catch (error) {
      console.error('Error submitting course:', error);
      alert('Gagal mengirim materi. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const removeFile = () => {
    setUploadedFile(null);
    setFilePreview(null);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-white">Submit Materi Baru</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-gray-900 p-6 rounded-lg border border-gray-700">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Judul Materi</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Masukkan judul materi"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Deskripsi</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="3"
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Jelaskan materi yang akan Anda bagikan"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Tipe Konten</label>
          <select
            name="contentType"
            value={formData.contentType}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="article">Artikel</option>
            <option value="video">Video</option>
            <option value="audio">Audio</option>
            <option value="image">Gambar</option>
            <option value="pdf">PDF</option>
          </select>
        </div>

        {formData.contentType === 'article' && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Konten Artikel</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows="10"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Tulis konten artikel Anda di sini..."
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Upload File (Opsional)</label>
          <input
            type="file"
            onChange={handleFileUpload}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            accept=".pdf,.mp4,.avi,.mov,.mp3,.wav,.jpg,.jpeg,.png,.gif,.txt,.md"
          />
          <p className="text-xs text-gray-400 mt-1">
            Format yang didukung: PDF, Video (MP4, AVI, MOV), Audio (MP3, WAV), Gambar (JPG, PNG, GIF), Teks (TXT, MD)
          </p>
        </div>

        {filePreview && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Preview File</label>
            <div className="relative">
              <img src={filePreview} alt="Preview" className="max-w-full h-auto rounded-md" />
              <button
                type="button"
                onClick={removeFile}
                className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {uploadedFile && (
          <div className="p-3 bg-gray-800 rounded-md">
            <p className="text-sm text-gray-300">File: {uploadedFile.name}</p>
            <p className="text-xs text-gray-400">Ukuran: {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        )}

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Mengirim...' : 'Submit Materi'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-700 transition-colors"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubmitCoursePage; 