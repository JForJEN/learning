import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import bcrypt from 'bcrypt';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 4000;

// JWT Secret for production
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-here';

app.use(cors());
app.use(express.json());

// Konfigurasi koneksi MySQL
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'stilllearning_db',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
};

// Konfigurasi multer untuk upload file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Middleware untuk koneksi DB
app.use(async (req, res, next) => {
  try {
    req.db = await mysql.createConnection(dbConfig);
    next();
  } catch (error) {
    console.error('Gagal koneksi ke database:', error);
    res.status(500).json({ error: 'Gagal koneksi ke database' });
  }
});

// Serve static files
app.use('/uploads', express.static('uploads'));

// Serve static files from dist folder in production
if (process.env.NODE_ENV === 'production') {
  // Serve static files from dist folder
  app.use(express.static(path.join(__dirname, 'dist')));
  
  // Serve index.html for all non-API routes in production
  app.get('*', (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api/')) {
      return next();
    }
    // Skip health check routes
    if (req.path === '/' || req.path === '/test' || req.path === '/api/health') {
      return next();
    }
    // Serve React app for all other routes
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
} else {
  // In development, serve from root
  app.use(express.static(path.join(__dirname)));
}

// ==================== AUTH ENDPOINTS ====================

// Login user
app.post('/api/login', async (req, res) => {
  const { email, password, isAdmin } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email dan password harus diisi' });
  }
  try {
    const [rows] = await req.db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'User tidak ditemukan' });
    }
    const user = rows[0];
    if (isAdmin && user.role !== 'admin') {
      return res.status(403).json({ error: 'Akses admin ditolak' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Password salah' });
    }
    // Jangan kirim password ke client
    delete user.password;
    res.json(user);
  } catch (error) {
    console.error('Error login:', error);
    res.status(500).json({ error: 'Gagal login' });
  } finally {
    req.db.end();
  }
});

// Register user
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Nama, email, dan password harus diisi' });
  }
  try {
    const [existing] = await req.db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Email sudah terdaftar' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await req.db.query('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [name, email, hashedPassword, 'user']);
    const newUser = { id: result.insertId, name, email, role: 'user' };
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error register:', error);
    res.status(500).json({ error: 'Gagal registrasi' });
  } finally {
    req.db.end();
  }
});

// Update user profile
app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, address } = req.body;
  
  try {
    const [result] = await req.db.query(
      'UPDATE users SET name = ?, email = ?, phone = ?, address = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, email, phone, address, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }
    
    const [updatedUser] = await req.db.query('SELECT id, name, email, role, phone, address FROM users WHERE id = ?', [id]);
    res.json(updatedUser[0]);
  } catch (error) {
    console.error('Error update profile:', error);
    res.status(500).json({ error: 'Gagal update profil' });
  } finally {
    req.db.end();
  }
});

// ==================== COURSES ENDPOINTS ====================

// Get all published courses
app.get('/api/courses', async (req, res) => {
  try {
    const [rows] = await req.db.query(`
      SELECT c.*, u.name as author_name, u.id as author_id 
      FROM courses c 
      JOIN users u ON c.author_id = u.id 
      WHERE c.isPublished = 1 
      ORDER BY c.created_at DESC
    `);
    
    // Transform data untuk kompatibilitas dengan frontend
    const courses = rows.map(course => ({
      id: course.id,
      title: course.title,
      description: course.description,
      content: course.content,
      contentType: course.contentType,
      thumbnailUrl: course.thumbnailUrl,
      author: {
        id: course.author_id,
        name: course.author_name
      },
      isPublished: course.isPublished,
      fileName: course.fileName,
      fileSize: course.fileSize,
      fileType: course.fileType,
      filePath: course.filePath,
      comments: [], // Akan diisi terpisah
      created_at: course.created_at
    }));
    
    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Gagal mengambil data courses' });
  } finally {
    req.db.end();
  }
});

// Get pending courses (for admin)
app.get('/api/courses/pending', async (req, res) => {
  try {
    const [rows] = await req.db.query(`
      SELECT c.*, u.name as author_name, u.id as author_id 
      FROM courses c 
      JOIN users u ON c.author_id = u.id 
      WHERE c.isPublished = 0 
      ORDER BY c.created_at DESC
    `);
    
    const courses = rows.map(course => ({
      id: course.id,
      title: course.title,
      description: course.description,
      content: course.content,
      contentType: course.contentType,
      thumbnailUrl: course.thumbnailUrl,
      author: {
        id: course.author_id,
        name: course.author_name
      },
      isPublished: course.isPublished,
      fileName: course.fileName,
      fileSize: course.fileSize,
      fileType: course.fileType,
      filePath: course.filePath,
      created_at: course.created_at
    }));
    
    res.json(courses);
  } catch (error) {
    console.error('Error fetching pending courses:', error);
    res.status(500).json({ error: 'Gagal mengambil data pending courses' });
  } finally {
    req.db.end();
  }
});

// Get single course with comments
app.get('/api/courses/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const [courseRows] = await req.db.query(`
      SELECT c.*, u.name as author_name, u.id as author_id 
      FROM courses c 
      JOIN users u ON c.author_id = u.id 
      WHERE c.id = ?
    `, [id]);
    
    if (courseRows.length === 0) {
      return res.status(404).json({ error: 'Course tidak ditemukan' });
    }
    
    const course = courseRows[0];
    
    // Get comments for this course
    const [commentRows] = await req.db.query(`
      SELECT c.*, u.name as author_name, u.id as author_id 
      FROM comments c 
      JOIN users u ON c.author_id = u.id 
      WHERE c.course_id = ? 
      ORDER BY c.created_at ASC
    `, [id]);
    
    // Transform comments to nested structure
    const comments = commentRows
      .filter(comment => !comment.parent_id)
      .map(comment => ({
        id: comment.id,
        text: comment.text,
        timestamp: comment.created_at,
        author: {
          id: comment.author_id,
          name: comment.author_name
        },
        replies: commentRows
          .filter(reply => reply.parent_id === comment.id)
          .map(reply => ({
            id: reply.id,
            text: reply.text,
            timestamp: reply.created_at,
            author: {
              id: reply.author_id,
              name: reply.author_name
            },
            replies: []
          }))
      }));
    
    const courseData = {
      id: course.id,
      title: course.title,
      description: course.description,
      content: course.content,
      contentType: course.contentType,
      thumbnailUrl: course.thumbnailUrl,
      author: {
        id: course.author_id,
        name: course.author_name
      },
      isPublished: course.isPublished,
      fileName: course.fileName,
      fileSize: course.fileSize,
      fileType: course.fileType,
      filePath: course.filePath,
      comments: comments,
      created_at: course.created_at
    };
    
    res.json(courseData);
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({ error: 'Gagal mengambil data course' });
  } finally {
    req.db.end();
  }
});

// Create new course
app.post('/api/courses', upload.single('file'), async (req, res) => {
  const { title, description, content, contentType, authorId } = req.body;
  
  if (!title || !description || !contentType || !authorId) {
    return res.status(400).json({ error: 'Semua field harus diisi' });
  }
  
  try {
    let fileData = {};
    if (req.file) {
      fileData = {
        fileName: req.file.originalname,
        fileSize: req.file.size,
        fileType: req.file.mimetype,
        filePath: req.file.path
      };
    }
    
    const [result] = await req.db.query(`
      INSERT INTO courses (title, description, content, contentType, author_id, fileName, fileSize, fileType, filePath, isPublished) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      title, 
      description, 
      content || '', 
      contentType, 
      authorId,
      fileData.fileName || null,
      fileData.fileSize || null,
      fileData.fileType || null,
      fileData.filePath || null,
      false // Default to pending
    ]);
    
    const newCourse = {
      id: result.insertId,
      title,
      description,
      content,
      contentType,
      authorId: parseInt(authorId),
      isPublished: false,
      ...fileData
    };
    
    res.status(201).json(newCourse);
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ error: 'Gagal membuat course' });
  } finally {
    req.db.end();
  }
});

// Approve course
app.put('/api/courses/:id/approve', async (req, res) => {
  const { id } = req.params;
  
  try {
    const [result] = await req.db.query(
      'UPDATE courses SET isPublished = 1 WHERE id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Course tidak ditemukan' });
    }
    
    res.json({ message: 'Course berhasil disetujui' });
  } catch (error) {
    console.error('Error approving course:', error);
    res.status(500).json({ error: 'Gagal menyetujui course' });
  } finally {
    req.db.end();
  }
});

// Reject course
app.delete('/api/courses/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    // Get course info for file deletion
    const [courseRows] = await req.db.query('SELECT filePath FROM courses WHERE id = ?', [id]);
    
    if (courseRows.length === 0) {
      return res.status(404).json({ error: 'Course tidak ditemukan' });
    }
    
    // Delete file if exists
    if (courseRows[0].filePath && fs.existsSync(courseRows[0].filePath)) {
      fs.unlinkSync(courseRows[0].filePath);
    }
    
    // Delete course
    await req.db.query('DELETE FROM courses WHERE id = ?', [id]);
    
    res.json({ message: 'Course berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ error: 'Gagal menghapus course' });
  } finally {
    req.db.end();
  }
});

// ==================== COMMENTS ENDPOINTS ====================

// Add comment
app.post('/api/courses/:courseId/comments', async (req, res) => {
  const { courseId } = req.params;
  const { text, authorId, parentId } = req.body;
  
  if (!text || !authorId) {
    return res.status(400).json({ error: 'Text dan authorId harus diisi' });
  }
  
  try {
    const [result] = await req.db.query(`
      INSERT INTO comments (text, author_id, course_id, parent_id) 
      VALUES (?, ?, ?, ?)
    `, [text, authorId, courseId, parentId || null]);
    
    // Get the new comment with author info
    const [commentRows] = await req.db.query(`
      SELECT c.*, u.name as author_name, u.id as author_id 
      FROM comments c 
      JOIN users u ON c.author_id = u.id 
      WHERE c.id = ?
    `, [result.insertId]);
    
    const newComment = {
      id: commentRows[0].id,
      text: commentRows[0].text,
      timestamp: commentRows[0].created_at,
      author: {
        id: commentRows[0].author_id,
        name: commentRows[0].author_name
      },
      replies: []
    };
    
    res.status(201).json(newComment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Gagal menambah komentar' });
  } finally {
    req.db.end();
  }
});

// ==================== ADMIN ENDPOINTS ====================

// Get all users (admin only)
app.get('/api/admin/users', async (req, res) => {
  try {
    const [rows] = await req.db.query(`
      SELECT id, name, email, role, phone, address, created_at 
      FROM users 
      ORDER BY created_at DESC
    `);
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Gagal mengambil data users' });
  } finally {
    req.db.end();
  }
});

// Delete user (admin only)
app.delete('/api/admin/users/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const [result] = await req.db.query('DELETE FROM users WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }
    
    res.json({ message: 'User berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Gagal menghapus user' });
  } finally {
    req.db.end();
  }
});

// Get statistics (admin only)
app.get('/api/admin/stats', async (req, res) => {
  try {
    const [userCount] = await req.db.query('SELECT COUNT(*) as count FROM users WHERE role = "user"');
    const [courseCount] = await req.db.query('SELECT COUNT(*) as count FROM courses WHERE isPublished = 1');
    const [pendingCount] = await req.db.query('SELECT COUNT(*) as count FROM courses WHERE isPublished = 0');
    const [commentCount] = await req.db.query('SELECT COUNT(*) as count FROM comments');
    
    res.json({
      totalUsers: userCount[0].count,
      approvedCourses: courseCount[0].count,
      pendingCourses: pendingCount[0].count,
      totalComments: commentCount[0].count
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Gagal mengambil statistik' });
  } finally {
    req.db.end();
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Root health check endpoint for Railway
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'StillLearning API is running',
    timestamp: new Date().toISOString() 
  });
});

// Test endpoint for Railway healthcheck
app.get('/test', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Health check passed',
    timestamp: new Date().toISOString() 
  });
});

// Handle React routing, return all requests to React app
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server berjalan di port ${port}`);
  console.log(`📊 Database: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  if (process.env.NODE_ENV === 'production') {
    console.log('🌐 Production mode: Serving React app');
  }
  console.log('✅ Health check endpoints available at /, /test, /api/health');
});

// Error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
}); 