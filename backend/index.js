require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 4000;

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
  const { name, email, avatar } = req.body;
  
  try {
    const [result] = await req.db.query(
      'UPDATE users SET name = ?, email = ?, avatar = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, email, avatar, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }
    
    const [updatedUser] = await req.db.query('SELECT id, name, email, role, avatar FROM users WHERE id = ?', [id]);
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

// Submit new course
app.post('/api/courses', upload.single('file'), async (req, res) => {
  const { title, description, contentType, content } = req.body;
  const authorId = req.body.authorId; // Akan dikirim dari frontend
  
  if (!title || !description || !contentType || !authorId) {
    return res.status(400).json({ error: 'Semua field wajib diisi' });
  }
  
  try {
    let filePath = null;
    let fileName = null;
    let fileSize = null;
    let fileType = null;
    
    if (req.file) {
      filePath = `/uploads/${req.file.filename}`;
      fileName = req.file.originalname;
      fileSize = req.file.size;
      fileType = req.file.mimetype;
    }
    
    const [result] = await req.db.query(`
      INSERT INTO courses (title, description, content, contentType, thumbnailUrl, author_id, fileName, fileSize, fileType, filePath, isPublished) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, FALSE)
    `, [title, description, content, contentType, 'https://picsum.photos/seed/course/600/400', authorId, fileName, fileSize, fileType, filePath]);
    
    res.status(201).json({ 
      id: result.insertId, 
      message: 'Course berhasil disubmit untuk review' 
    });
  } catch (error) {
    console.error('Error submitting course:', error);
    res.status(500).json({ error: 'Gagal submit course' });
  } finally {
    req.db.end();
  }
});

// Approve course (admin only)
app.put('/api/courses/:id/approve', async (req, res) => {
  const { id } = req.params;
  
  try {
    const [result] = await req.db.query(
      'UPDATE courses SET isPublished = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );
    
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

// ==================== COMMENTS ENDPOINTS ====================

// Add comment
app.post('/api/courses/:courseId/comments', async (req, res) => {
  const { courseId } = req.params;
  const { text, authorId, parentId } = req.body;
  
  if (!text || !authorId) {
    return res.status(400).json({ error: 'Text dan authorId wajib diisi' });
  }
  
  try {
    const [result] = await req.db.query(
      'INSERT INTO comments (course_id, author_id, text, parent_id) VALUES (?, ?, ?, ?)',
      [courseId, authorId, text, parentId || null]
    );
    
    // Get the created comment with author info
    const [commentRows] = await req.db.query(`
      SELECT c.*, u.name as author_name, u.id as author_id 
      FROM comments c 
      JOIN users u ON c.author_id = u.id 
      WHERE c.id = ?
    `, [result.insertId]);
    
    const comment = {
      id: commentRows[0].id,
      text: commentRows[0].text,
      timestamp: commentRows[0].created_at,
      author: {
        id: commentRows[0].author_id,
        name: commentRows[0].author_name
      },
      replies: []
    };
    
    res.status(201).json(comment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Gagal menambah komentar' });
  } finally {
    req.db.end();
  }
});

// Get comments for a course
app.get('/api/courses/:courseId/comments', async (req, res) => {
  const { courseId } = req.params;
  
  try {
    const [rows] = await req.db.query(`
      SELECT c.*, u.name as author_name, u.id as author_id 
      FROM comments c 
      JOIN users u ON c.author_id = u.id 
      WHERE c.course_id = ? 
      ORDER BY c.created_at ASC
    `, [courseId]);
    
    // Transform to nested structure
    const comments = rows
      .filter(comment => !comment.parent_id)
      .map(comment => ({
        id: comment.id,
        text: comment.text,
        timestamp: comment.created_at,
        author: {
          id: comment.author_id,
          name: comment.author_name
        },
        replies: rows
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
    
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Gagal mengambil komentar' });
  } finally {
    req.db.end();
  }
});

// Jalankan server
app.listen(port, () => {
  console.log(`🚀 Backend server berjalan di http://localhost:${port}`);
  console.log(`📁 Upload directory: ${path.join(__dirname, 'uploads')}`);
});
