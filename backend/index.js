require("dotenv").config();
const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const port = process.env.PORT || 4000;
const __dirname = path.resolve();

// === Middleware
app.use(cors({
  origin: true, // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json());

// === Request logging middleware
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  console.log(`🌐 Origin: ${req.headers.origin}`);
  console.log(`🔗 Referer: ${req.headers.referer}`);
  next();
});

// === Serve static files from React build
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
}

// === Database Pool (Railway MySQL)
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection on startup
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    console.error('🔧 Environment variables:');
    console.error('   DB_HOST:', process.env.DB_HOST);
    console.error('   DB_PORT:', process.env.DB_PORT);
    console.error('   DB_USER:', process.env.DB_USER);
    console.error('   DB_NAME:', process.env.DB_NAME);
    console.error('   DB_PASSWORD:', process.env.DB_PASSWORD ? '***SET***' : '***NOT SET***');
  } else {
    console.log('✅ Database connected successfully');
    console.log('🔧 Connection details:');
    console.log('   Host:', process.env.DB_HOST);
    console.log('   Port:', process.env.DB_PORT);
    console.log('   Database:', process.env.DB_NAME);
    connection.release();
  }
});

// === Upload directory
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// === Serve uploaded files
app.use("/uploads", express.static(uploadDir));

// === Serve files with proper headers
app.get("/uploads/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadDir, filename);
  
  if (fs.existsSync(filePath)) {
    const ext = path.extname(filename).toLowerCase();
    
    // Set proper content type based on file extension
    const contentTypes = {
      '.mp4': 'video/mp4',
      '.avi': 'video/x-msvideo',
      '.mov': 'video/quicktime',
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.ppt': 'application/vnd.ms-powerpoint',
      '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    };
    
    const contentType = contentTypes[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Accept-Ranges', 'bytes');
    
    // For video/audio files, support range requests
    if (contentType.startsWith('video/') || contentType.startsWith('audio/')) {
      const stat = fs.statSync(filePath);
      const fileSize = stat.size;
      const range = req.headers.range;
      
      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(filePath, { start, end });
        const head = {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': contentType,
        };
        res.writeHead(206, head);
        file.pipe(res);
      } else {
        res.writeHead(200, {
          'Content-Length': fileSize,
          'Content-Type': contentType,
        });
        fs.createReadStream(filePath).pipe(res);
      }
    } else {
      res.sendFile(filePath);
    }
  } else {
    res.status(404).json({ error: "File tidak ditemukan" });
  }
});

// === Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + unique + path.extname(file.originalname));
  }
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

// === Root route (Railway health check)
app.get("/", (req, res) => {
  res.send("Backend Railway berjalan dengan baik");
});

// === Simple test endpoint
app.get("/test", (req, res) => {
  res.json({
    message: "Backend is working!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    apiUrl: "https://stilllearning-production-3b76.up.railway.app/api"
  });
});

// === Health check with database
app.get("/health", async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query("SELECT 1");
    res.json({ 
      status: "OK", 
      database: "Connected",
      environment: process.env.NODE_ENV,
      port: process.env.PORT || 4000
    });
  } catch (err) {
    console.error("Health check error:", err.message);
    res.status(500).json({ 
      status: "ERROR", 
      database: "Disconnected",
      error: err.message,
      environment: process.env.NODE_ENV,
      port: process.env.PORT || 4000
    });
  } finally {
    if (conn) conn.release();
  }
});

// === Test database connection
app.get("/api/test-db", async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    
    // Test basic connection
    await conn.query("SELECT 1");
    
    // Test users table
    const [users] = await conn.query("SELECT COUNT(*) as count FROM users");
    
    // Test courses table
    const [courses] = await conn.query("SELECT COUNT(*) as count FROM courses");
    
    // Test comments table
    const [comments] = await conn.query("SELECT COUNT(*) as count FROM comments");
    
    res.json({
      status: "Database connected successfully",
      tables: {
        users: users[0].count,
        courses: courses[0].count,
        comments: comments[0].count
      },
      connection: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME
      }
    });
  } catch (err) {
    console.error("Database test error:", err.message);
    res.status(500).json({ 
      status: "Database connection failed",
      error: err.message,
      connection: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME
      }
    });
  } finally {
    if (conn) conn.release();
  }
});

// === Check environment variables
app.get("/api/env-check", (req, res) => {
  res.json({
    environment: process.env.NODE_ENV,
    database: {
      host: process.env.DB_HOST || "NOT SET",
      port: process.env.DB_PORT || "NOT SET",
      user: process.env.DB_USER || "NOT SET",
      database: process.env.DB_NAME || "NOT SET",
      password: process.env.DB_PASSWORD ? "SET" : "NOT SET"
    },
    port: process.env.PORT || "NOT SET"
  });
});

// === LOGIN
app.post("/api/login", async (req, res) => {
  const { email, password, isAdmin } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email & password wajib diisi" });

  let conn;
  try {
    conn = await pool.getConnection();
    const [rows] = await conn.query("SELECT * FROM users WHERE email = ?", [email]);

    if (rows.length === 0) return res.status(401).json({ error: "User tidak ditemukan" });

    const user = rows[0];
    if (isAdmin && user.role !== "admin") return res.status(403).json({ error: "Akses admin ditolak" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Password salah" });

    delete user.password;
    res.json(user);
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: "Gagal login" });
  } finally {
    if (conn) conn.release();
  }
});

// === REGISTER
app.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: "Semua field wajib diisi" });

  let conn;
  try {
    conn = await pool.getConnection();

    const [existing] = await conn.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) return res.status(409).json({ error: "Email sudah terdaftar" });

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await conn.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'user')",
      [name, email, hashed]
    );

    res.status(201).json({ id: result.insertId, name, email, role: "user" });
  } catch (err) {
    console.error("Register error:", err.message);
    res.status(500).json({ error: "Registrasi gagal" });
  } finally {
    if (conn) conn.release();
  }
});

// === GET COURSES
app.get("/api/courses", async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const [rows] = await conn.query(`
      SELECT c.*, u.name as author_name, u.id as author_id
      FROM courses c
      JOIN users u ON c.author_id = u.id
      WHERE c.isPublished = 1
      ORDER BY c.created_at DESC
    `);

    const courses = rows.map(c => ({
      id: c.id,
      title: c.title,
      description: c.description,
      content: c.content,
      contentType: c.contentType,
      thumbnailUrl: c.thumbnailUrl,
      author: { id: c.author_id, name: c.author_name },
      isPublished: c.isPublished,
      fileName: c.fileName,
      fileSize: c.fileSize,
      fileType: c.fileType,
      filePath: c.filePath,
      created_at: c.created_at,
      comments: []
    }));

    res.json(courses);
  } catch (err) {
    console.error("Get courses error:", err.message);
    res.status(500).json({ error: "Gagal mengambil courses" });
  } finally {
    if (conn) conn.release();
  }
});

// === GET COURSE BY ID
app.get("/api/courses/:id", async (req, res) => {
  const { id } = req.params;
  let conn;
  try {
    conn = await pool.getConnection();
    const [rows] = await conn.query(`
      SELECT c.*, u.name as author_name, u.id as author_id
      FROM courses c
      JOIN users u ON c.author_id = u.id
      WHERE c.id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Course tidak ditemukan" });
    }

    const course = rows[0];
    
    // Get comments for this course
    const [comments] = await conn.query(`
      SELECT c.*, u.name as author_name
      FROM comments c
      JOIN users u ON c.author_id = u.id
      WHERE c.course_id = ? AND c.parent_id IS NULL
      ORDER BY c.created_at DESC
    `, [id]);

    // Get replies for each comment
    const commentsWithReplies = await Promise.all(comments.map(async (comment) => {
      const [replies] = await conn.query(`
        SELECT c.*, u.name as author_name
        FROM comments c
        JOIN users u ON c.author_id = u.id
        WHERE c.parent_id = ?
        ORDER BY c.created_at ASC
      `, [comment.id]);
      
      return { ...comment, replies };
    }));

    const courseWithComments = {
      id: course.id,
      title: course.title,
      description: course.description,
      content: course.content,
      contentType: course.contentType,
      thumbnailUrl: course.thumbnailUrl,
      author: { id: course.author_id, name: course.author_name },
      isPublished: course.isPublished,
      fileName: course.fileName,
      fileSize: course.fileSize,
      fileType: course.fileType,
      filePath: course.filePath,
      created_at: course.created_at,
      comments: commentsWithReplies
    };

    res.json(courseWithComments);
  } catch (err) {
    console.error("Get course by ID error:", err.message);
    res.status(500).json({ error: "Gagal mengambil course" });
  } finally {
    if (conn) conn.release();
  }
});

// === GET PENDING COURSES
app.get("/api/courses/pending", async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const [rows] = await conn.query(`
      SELECT c.*, u.name as author_name, u.id as author_id
      FROM courses c
      JOIN users u ON c.author_id = u.id
      WHERE c.isPublished = 0
      ORDER BY c.created_at DESC
    `);

    const courses = rows.map(c => ({
      id: c.id,
      title: c.title,
      description: c.description,
      content: c.content,
      contentType: c.contentType,
      thumbnailUrl: c.thumbnailUrl,
      author: { id: c.author_id, name: c.author_name },
      isPublished: c.isPublished,
      fileName: c.fileName,
      fileSize: c.fileSize,
      fileType: c.fileType,
      filePath: c.filePath,
      created_at: c.created_at,
      comments: []
    }));

    res.json(courses);
  } catch (err) {
    console.error("Get pending courses error:", err.message);
    res.status(500).json({ error: "Gagal mengambil pending courses" });
  } finally {
    if (conn) conn.release();
  }
});

// === ADD COURSE
app.post("/api/courses", upload.single("file"), async (req, res) => {
  const { title, description, contentType, content, authorId } = req.body;
  if (!title || !description || !contentType || !authorId) {
    return res.status(400).json({ error: "Semua field wajib diisi" });
  }

  let conn;
  try {
    conn = await pool.getConnection();

    let filePath = null, fileName = null, fileSize = null, fileType = null;

    if (req.file) {
      filePath = req.file.path;
      fileName = req.file.originalname;
      fileSize = req.file.size;
      fileType = req.file.mimetype;
    }

    const [result] = await conn.query(
      `INSERT INTO courses (title, description, content, contentType, thumbnailUrl, author_id, fileName, fileSize, fileType, filePath, isPublished)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, FALSE)`,
      [
        title,
        description,
        content,
        contentType,
        "https://picsum.photos/seed/course/600/400",
        authorId,
        fileName,
        fileSize,
        fileType,
        filePath
      ]
    );

    res.status(201).json({ id: result.insertId, message: "Berhasil submit course (pending)" });
  } catch (err) {
    console.error("Submit course error:", err.message);
    res.status(500).json({ error: "Gagal submit course" });
  } finally {
    if (conn) conn.release();
  }
});

// === APPROVE COURSE
app.put("/api/courses/:id/approve", async (req, res) => {
  const { id } = req.params;
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query("UPDATE courses SET isPublished = 1 WHERE id = ?", [id]);
    res.json({ message: "Course berhasil diapprove" });
  } catch (err) {
    console.error("Approve course error:", err.message);
    res.status(500).json({ error: "Gagal approve course" });
  } finally {
    if (conn) conn.release();
  }
});

// === ADD COMMENT
app.post("/api/courses/:courseId/comments", async (req, res) => {
  const { courseId } = req.params;
  const { text, authorId, parentId } = req.body;
  
  if (!text || !authorId) {
    return res.status(400).json({ error: "Text dan authorId wajib diisi" });
  }

  let conn;
  try {
    conn = await pool.getConnection();
    const [result] = await conn.query(
      "INSERT INTO comments (text, author_id, course_id, parent_id) VALUES (?, ?, ?, ?)",
      [text, authorId, courseId, parentId || null]
    );

    const [newComment] = await conn.query(`
      SELECT c.*, u.name as author_name 
      FROM comments c
      JOIN users u ON c.author_id = u.id
      WHERE c.id = ?
    `, [result.insertId]);

    res.status(201).json(newComment[0]);
  } catch (err) {
    console.error("Add comment error:", err.message);
    res.status(500).json({ error: "Gagal menambah komentar" });
  } finally {
    if (conn) conn.release();
  }
});

// === UPDATE USER PROFILE
app.put("/api/users/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({ error: "Name dan email wajib diisi" });
  }

  let conn;
  try {
    conn = await pool.getConnection();
    
    // Check if email already exists for other users
    const [existing] = await conn.query(
      "SELECT id FROM users WHERE email = ? AND id != ?",
      [email, id]
    );
    
    if (existing.length > 0) {
      return res.status(409).json({ error: "Email sudah digunakan" });
    }

    await conn.query(
      "UPDATE users SET name = ?, email = ? WHERE id = ?",
      [name, email, id]
    );

    const [updatedUser] = await conn.query(
      "SELECT id, name, email, role FROM users WHERE id = ?",
      [id]
    );

    res.json(updatedUser[0]);
  } catch (err) {
    console.error("Update user error:", err.message);
    res.status(500).json({ error: "Gagal update user" });
  } finally {
    if (conn) conn.release();
  }
});

// === START SERVER
app.listen(port, () => {
  console.log(`🚀 Server berjalan di port ${port}`);
  console.log(`📁 Upload directory: ${uploadDir}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
  console.log(`🗄️ Database: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
});

// === Catch all handler for SPA routing (must be last)
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}
