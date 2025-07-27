import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SubmitCoursePage = () => {
  const { addCourseForApproval } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    contentType: 'ARTICLE',
    content: '',
    thumbnailUrl: 'https://picsum.photos/seed/course/600/400'
  });

  const [uploadedFile, setUploadedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

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
      'pdf': 'PDF',
      'doc': 'WORD',
      'docx': 'WORD',
      'ppt': 'PPT',
      'pptx': 'PPT',
      'mp4': 'VIDEO',
      'avi': 'VIDEO',
      'mov': 'VIDEO',
      'mp3': 'AUDIO',
      'wav': 'AUDIO',
      'jpg': 'IMAGE',
      'jpeg': 'IMAGE',
      'png': 'IMAGE',
      'gif': 'IMAGE',
      'txt': 'ARTICLE',
      'md': 'ARTICLE'
    };
    
    if (contentTypeMap[extension]) {
      setFormData(prev => ({ ...prev, contentType: contentTypeMap[extension] }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (uploadedFile) {
      const courseData = {
        ...formData,
        uploadedFile: uploadedFile,
        fileName: uploadedFile.name,
        fileSize: uploadedFile.size,
        fileType: uploadedFile.type
      };
      addCourseForApproval(courseData);
    } else {
      addCourseForApproval(formData);
    }
    
    navigate('/');
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
            className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-white focus:outline-none"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Deskripsi</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-white focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Upload File</label>
          <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
            <input
              type="file"
              onChange={handleFileUpload}
              accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.avi,.mov,.mp3,.wav,.jpg,.jpeg,.png,.gif,.txt,.md"
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="text-gray-400 mb-2">
                <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="text-sm text-gray-400">
                Klik untuk upload file atau drag and drop
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PDF, Word, PPT, Video, Audio, Gambar, atau Teks (max 50MB)
              </p>
            </label>
          </div>
        </div>

        {uploadedFile && (
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {filePreview ? (
                  <img src={filePreview} alt="preview" className="w-12 h-12 object-cover rounded" />
                ) : (
                  <div className="w-12 h-12 bg-gray-700 rounded flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                )}
                <div>
                  <p className="text-white font-medium">{uploadedFile.name}</p>
                  <p className="text-gray-400 text-sm">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button
                type="button"
                onClick={removeFile}
                className="text-red-400 hover:text-red-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Tipe Konten</label>
          <select
            name="contentType"
            value={formData.contentType}
            onChange={handleChange}
            className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-white focus:outline-none"
          >
            <option value="ARTICLE">Artikel</option>
            <option value="VIDEO">Video</option>
            <option value="AUDIO">Audio</option>
            <option value="IMAGE">Gambar</option>
            <option value="PDF">PDF</option>
            <option value="WORD">Word</option>
            <option value="PPT">PowerPoint</option>
          </select>
        </div>
        
        {!uploadedFile && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Konten (jika tidak upload file)</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows={10}
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-white focus:outline-none"
              placeholder="Masukkan konten materi Anda di sini..."
            />
          </div>
        )}
        
        <button
          type="submit"
          className="w-full py-3 bg-white text-black font-semibold rounded-md hover:bg-gray-200 transition-colors"
        >
          Submit untuk Review
        </button>
      </form>
    </div>
  );
};

export default SubmitCoursePage; 