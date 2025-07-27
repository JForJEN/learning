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

// CORS configuration for frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

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

// ==================== COURSE ENDPOINTS ====================

// Get all courses
app.get('/api/courses', async (req, res) => {
  try {
    const [rows] = await req.db.query(`
      SELECT c.*, u.name as author_name 
      FROM courses c 
      LEFT JOIN users u ON c.user_id = u.id 
      WHERE c.status = 'approved'
      ORDER BY c.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Gagal mengambil data courses' });
  } finally {
    req.db.end();
  }
});

// Create new course
app.post('/api/courses', upload.single('file'), async (req, res) => {
  const { title, description, contentType } = req.body;
  const userId = req.body.userId; // In real app, get from JWT token
  
  if (!title || !description || !contentType) {
    return res.status(400).json({ error: 'Title, description, dan content type harus diisi' });
  }
  
  try {
    const filePath = req.file ? req.file.path : null;
    const [result] = await req.db.query(
      'INSERT INTO courses (title, description, content_type, file_path, user_id) VALUES (?, ?, ?, ?, ?)',
      [title, description, contentType, filePath, userId]
    );
    
    const newCourse = { id: result.insertId, title, description, contentType, filePath, userId };
    res.status(201).json(newCourse);
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ error: 'Gagal membuat course' });
  } finally {
    req.db.end();
  }
});

// Approve course (admin only)
app.put('/api/courses/:id/approve', async (req, res) => {
  const { id } = req.params;
  
  try {
    const [result] = await req.db.query('UPDATE courses SET status = ? WHERE id = ?', ['approved', id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Course tidak ditemukan' });
    }
    
    res.json({ message: 'Course berhasil diapprove' });
  } catch (error) {
    console.error('Error approving course:', error);
    res.status(500).json({ error: 'Gagal approve course' });
  } finally {
    req.db.end();
  }
});

// Reject course (admin only)
app.delete('/api/courses/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const [result] = await req.db.query('DELETE FROM courses WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Course tidak ditemukan' });
    }
    
    res.json({ message: 'Course berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ error: 'Gagal hapus course' });
  } finally {
    req.db.end();
  }
});

// ==================== COMMENT ENDPOINTS ====================

// Get comments for a course
app.get('/api/courses/:courseId/comments', async (req, res) => {
  const { courseId } = req.params;
  
  try {
    const [rows] = await req.db.query(`
      SELECT c.*, u.name as author_name 
      FROM comments c 
      LEFT JOIN users u ON c.user_id = u.id 
      WHERE c.course_id = ? 
      ORDER BY c.created_at DESC
    `, [courseId]);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Gagal mengambil komentar' });
  } finally {
    req.db.end();
  }
});

// Add comment to a course
app.post('/api/courses/:courseId/comments', async (req, res) => {
  const { courseId } = req.params;
  const { content, userId, parentId } = req.body;
  
  if (!content) {
    return res.status(400).json({ error: 'Content harus diisi' });
  }
  
  try {
    const [result] = await req.db.query(
      'INSERT INTO comments (content, user_id, course_id, parent_id) VALUES (?, ?, ?, ?)',
      [content, userId, courseId, parentId || null]
    );
    
    const [commentRows] = await req.db.query(`
      SELECT c.*, u.name as author_name 
      FROM comments c 
      LEFT JOIN users u ON c.user_id = u.id 
      WHERE c.id = ?
    `, [result.insertId]);
    
    const newComment = {
      id: commentRows[0].id,
      content: commentRows[0].content,
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
    const [courseCount] = await req.db.query('SELECT COUNT(*) as count FROM courses WHERE status = "approved"');
    const [pendingCount] = await req.db.query('SELECT COUNT(*) as count FROM courses WHERE status = "pending"');
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

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Backend API berjalan di port ${port}`);
  console.log(`📊 Database: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
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