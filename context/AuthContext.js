import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [pendingCourses, setPendingCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dynamic API URL based on current location
  const getApiBaseUrl = () => {
    if (typeof window !== 'undefined') {
      // Use current hostname to ensure we're using the right domain
      const currentHost = window.location.hostname;
      const currentProtocol = window.location.protocol;
      
      console.log('🌐 Current hostname:', currentHost);
      console.log('🔗 Current protocol:', currentProtocol);
      
      if (currentHost.includes('railway.app')) {
        return `${currentProtocol}//${currentHost}/api`;
      }
    }
    
    // Fallback for development
    return 'http://localhost:4000/api';
  };

  const API_BASE_URL = getApiBaseUrl();

  console.log('🔧 API_BASE_URL:', API_BASE_URL);
  console.log('🌐 Current location:', window.location.href);
  console.log('🏭 NODE_ENV:', process.env.NODE_ENV);

  // Force reload if wrong URL is detected
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hostname.includes('railway.app')) {
      const currentApiUrl = getApiBaseUrl();
      const expectedHost = 'stilllearning-production-3b76.up.railway.app';
      
      if (!currentApiUrl.includes(expectedHost)) {
        console.error('❌ Wrong API URL detected!', currentApiUrl);
        console.log('🔄 Forcing page reload...');
        window.location.reload(true);
      }
    }
  }, []);

  const fetchCourses = async () => {
    try {
      console.log('🔄 Fetching courses from:', `${API_BASE_URL}/courses`);
      const [publishedRes, pendingRes] = await Promise.all([
        fetch(`${API_BASE_URL}/courses`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }),
        fetch(`${API_BASE_URL}/courses/pending`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        })
      ]);
      
      console.log('📥 Published courses response:', publishedRes.status);
      console.log('📥 Pending courses response:', pendingRes.status);
      
      if (publishedRes.ok && pendingRes.ok) {
        const published = await publishedRes.json();
        const pending = await pendingRes.json();
        console.log('✅ Courses fetched successfully:', { published: published.length, pending: pending.length });
        setCourses(published);
        setPendingCourses(pending);
      } else {
        console.error('❌ Failed to fetch courses:', { published: publishedRes.status, pending: pendingRes.status });
      }
    } catch (error) {
      console.error('❌ Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const login = async ({ email, password, isAdmin }) => {
    try {
      console.log('🚀 Sending login request to:', `${API_BASE_URL}/login`);
      console.log('📤 Request data:', { email, password, isAdmin });
      
      const res = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password, isAdmin }),
      });
      
      console.log('📥 Response status:', res.status);
      console.log('📥 Response headers:', Object.fromEntries(res.headers.entries()));
      
      if (!res.ok) {
        const error = await res.json();
        console.error('❌ Backend error:', error);
        throw new Error(error.error || 'Login gagal');
      }
      
      const user = await res.json();
      console.log('✅ Login successful, user data:', user);
      setCurrentUser(user);
      return true;
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const register = async ({ name, email, password }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Registrasi gagal');
      }
      
      const user = await res.json();
      setCurrentUser(user);
      return true;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  const updateProfile = async (updates) => {
    if (!currentUser) return;
    
    try {
      const res = await fetch(`${API_BASE_URL}/users/${currentUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      
      if (!res.ok) {
        throw new Error('Gagal update profil');
      }
      
      const updatedUser = await res.json();
      setCurrentUser(updatedUser);
      
      if (updates.name) {
        setCourses(prev => prev.map(course =>
          course.author.id === updatedUser.id
            ? { ...course, author: { ...course.author, name: updatedUser.name } }
            : course
        ));
        setPendingCourses(prev => prev.map(course =>
          course.author.id === updatedUser.id
            ? { ...course, author: { ...course.author, name: updatedUser.name } }
            : course
        ));
      }
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  const addCourseForApproval = async (courseData) => {
    if (!currentUser) return;
    
    try {
      const formData = new FormData();
      formData.append('title', courseData.title);
      formData.append('description', courseData.description);
      formData.append('contentType', courseData.contentType);
      formData.append('content', courseData.content || '');
      formData.append('authorId', currentUser.id);
      
      if (courseData.uploadedFile) {
        formData.append('file', courseData.uploadedFile);
      }
      
      const res = await fetch(`${API_BASE_URL}/courses`, {
        method: 'POST',
        body: formData,
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Gagal submit course');
      }
      
      await fetchCourses();
      
      return await res.json();
    } catch (error) {
      console.error('Add course error:', error);
      throw error;
    }
  };

  const approveCourse = async (courseId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/courses/${courseId}/approve`, {
        method: 'PUT',
      });
      
      if (!res.ok) {
        throw new Error('Gagal approve course');
      }
      
      await fetchCourses();
    } catch (error) {
      console.error('Approve course error:', error);
      throw error;
    }
  };

  const rejectCourse = async (courseId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) {
        throw new Error('Gagal reject course');
      }
      
      await fetchCourses();
    } catch (error) {
      console.error('Reject course error:', error);
      throw error;
    }
  };

  const addComment = async (courseId, text, parentCommentId) => {
    if (!currentUser) return;
    
    try {
      const res = await fetch(`${API_BASE_URL}/courses/${courseId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          authorId: currentUser.id,
          parentId: parentCommentId || null
        }),
      });
      
      if (!res.ok) {
        throw new Error('Gagal menambah komentar');
      }
      
      const newComment = await res.json();
      
      const updateCourseComments = (courseList) => courseList.map(course => {
        if (course.id === courseId) {
          if (parentCommentId) {
            return {
              ...course,
              comments: course.comments.map(comment => {
                if (comment.id === parentCommentId) {
                  return { ...comment, replies: [...comment.replies, newComment] };
                }
                return comment;
              })
            };
          } else {
            return { ...course, comments: [...course.comments, newComment] };
          }
        }
        return course;
      });
      
      setCourses(updateCourseComments);
      setPendingCourses(updateCourseComments);
    } catch (error) {
      console.error('Add comment error:', error);
      throw error;
    }
  };

  const isAuthenticated = !!currentUser;
  const isAdmin = currentUser?.role === 'admin';

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      isAuthenticated, 
      isAdmin, 
      login, 
      logout, 
      register, 
      courses, 
      pendingCourses, 
      addCourseForApproval, 
      approveCourse, 
      rejectCourse,
      addComment, 
      updateProfile,
      loading,
      getApiBaseUrl
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};