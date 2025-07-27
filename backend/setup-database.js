require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

// Konfigurasi database
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'stilllearning_db',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
};

async function setupDatabase() {
  let connection;
  
  try {
    // Koneksi tanpa database untuk membuat database
    connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      port: dbConfig.port
    });

    console.log('✅ Terhubung ke MySQL server');

    // Buat database jika belum ada
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    console.log(`✅ Database ${dbConfig.database} berhasil dibuat/ditemukan`);

    // Gunakan database
    await connection.execute(`USE ${dbConfig.database}`);

    // Buat tabel users
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('user', 'admin') DEFAULT 'user',
        avatar TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabel users berhasil dibuat');

    // Buat tabel courses
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS courses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        content TEXT,
        contentType ENUM('ARTICLE', 'VIDEO', 'AUDIO', 'IMAGE', 'PDF', 'WORD', 'PPT') NOT NULL,
        thumbnailUrl TEXT,
        author_id INT NOT NULL,
        isPublished BOOLEAN DEFAULT FALSE,
        fileName VARCHAR(255),
        fileSize INT,
        fileType VARCHAR(100),
        filePath TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Tabel courses berhasil dibuat');

    // Buat tabel comments
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        course_id INT NOT NULL,
        author_id INT NOT NULL,
        text TEXT NOT NULL,
        parent_id INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Tabel comments berhasil dibuat');

    // Insert data awal untuk admin
    const [existingAdmin] = await connection.execute('SELECT * FROM users WHERE email = ?', ['admin@stilllearning.com']);
    
    if (existingAdmin.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await connection.execute(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['Admin Ali', 'admin@stilllearning.com', hashedPassword, 'admin']
      );
      console.log('✅ Admin user berhasil dibuat (email: admin@stilllearning.com, password: admin123)');
    } else {
      console.log('ℹ️ Admin user sudah ada');
    }

    // Insert data awal untuk user
    const [existingUser] = await connection.execute('SELECT * FROM users WHERE email = ?', ['siti@stilllearning.com']);
    
    if (existingUser.length === 0) {
      const hashedPassword = await bcrypt.hash('user123', 10);
      await connection.execute(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['Student Siti', 'siti@stilllearning.com', hashedPassword, 'user']
      );
      console.log('✅ User berhasil dibuat (email: siti@stilllearning.com, password: user123)');
    } else {
      console.log('ℹ️ User sudah ada');
    }

    // Insert data awal untuk creator
    const [existingCreator] = await connection.execute('SELECT * FROM users WHERE email = ?', ['chandra@stilllearning.com']);
    
    if (existingCreator.length === 0) {
      const hashedPassword = await bcrypt.hash('creator123', 10);
      await connection.execute(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['Creator Chandra', 'chandra@stilllearning.com', hashedPassword, 'user']
      );
      console.log('✅ Creator user berhasil dibuat (email: chandra@stilllearning.com, password: creator123)');
    } else {
      console.log('ℹ️ Creator user sudah ada');
    }

    // Insert sample courses
    const [existingCourses] = await connection.execute('SELECT COUNT(*) as count FROM courses');
    
    if (existingCourses[0].count === 0) {
      // Ambil user IDs
      const [users] = await connection.execute('SELECT id FROM users');
      const adminId = users.find(u => u.id === 1)?.id || 1;
      const creatorId = users.find(u => u.id === 3)?.id || 3;

      // Insert sample courses
      await connection.execute(`
        INSERT INTO courses (title, description, content, contentType, thumbnailUrl, author_id, isPublished) VALUES 
        ('Pengantar React Hooks', 'Pelajari dasar-dasar React Hooks, dari useState hingga useEffect dan custom hooks.', 
         '# Memahami React Hooks\n\nReact Hooks adalah fungsi yang memungkinkan Anda "terhubung" ke fitur state dan siklus hidup React dari komponen fungsi.', 
         'ARTICLE', 'https://picsum.photos/seed/react/600/400', ?, TRUE),
        ('Desain Responsif dengan Tailwind CSS', 'Kuasai seni membuat tata letak responsif yang berfungsi di semua perangkat menggunakan Tailwind CSS.', 
         'https://www.w3schools.com/html/mov_bbb.mp4', 'VIDEO', 'https://picsum.photos/seed/tailwind/600/400', ?, TRUE),
        ('TypeScript Tingkat Lanjut', 'Selami lebih dalam fitur-fitur TypeScript tingkat lanjut seperti generics, decorators, dan mapped types.', 
         '/path/to/mock.pdf', 'PDF', 'https://picsum.photos/seed/typescript/600/400', ?, TRUE),
        ('Keindahan Alam (Fotografi)', 'Sebuah perjalanan visual melalui lanskap menakjubkan dan fotografi satwa liar.', 
         'https://picsum.photos/seed/nature-content/1200/800', 'IMAGE', 'https://picsum.photos/seed/nature/600/400', ?, TRUE)
      `, [adminId, adminId, creatorId, adminId]);

      console.log('✅ Sample courses berhasil dibuat');
    } else {
      console.log('ℹ️ Sample courses sudah ada');
    }

    console.log('\n🎉 Database setup selesai!');
    console.log('\n📋 Informasi Login:');
    console.log('Admin: admin@stilllearning.com / admin123');
    console.log('User: siti@stilllearning.com / user123');
    console.log('Creator: chandra@stilllearning.com / creator123');

  } catch (error) {
    console.error('❌ Error setup database:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDatabase(); 