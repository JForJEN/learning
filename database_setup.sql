-- =====================================================
-- STILLLEARNING DATABASE SETUP
-- =====================================================

-- Drop database if exists and create new one
DROP DATABASE IF EXISTS stilllearning_db;
CREATE DATABASE stilllearning_db;
USE stilllearning_db;

-- =====================================================
-- USERS TABLE
-- =====================================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    avatar VARCHAR(255) DEFAULT NULL,
    phone VARCHAR(20) DEFAULT NULL,
    address TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- COURSES TABLE
-- =====================================================
CREATE TABLE courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    content TEXT DEFAULT NULL,
    contentType ENUM('article', 'video', 'audio', 'pdf', 'image') NOT NULL,
    thumbnailUrl VARCHAR(255) DEFAULT NULL,
    fileName VARCHAR(255) DEFAULT NULL,
    fileSize BIGINT DEFAULT NULL,
    fileType VARCHAR(100) DEFAULT NULL,
    filePath VARCHAR(255) DEFAULT NULL,
    author_id INT NOT NULL,
    isPublished BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- COMMENTS TABLE
-- =====================================================
CREATE TABLE comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    text TEXT NOT NULL,
    author_id INT NOT NULL,
    course_id INT NOT NULL,
    parent_id INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
);

-- =====================================================
-- SAMPLE DATA
-- =====================================================

-- Insert default admin user
INSERT INTO users (name, email, password, role) VALUES 
('Admin StillLearning', 'admin@stilllearning.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Insert sample users
INSERT INTO users (name, email, password, role, phone, address) VALUES 
('John Doe', 'john@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', '081234567890', 'Jakarta, Indonesia'),
('Jane Smith', 'jane@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', '081234567891', 'Bandung, Indonesia'),
('Bob Johnson', 'bob@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', '081234567892', 'Surabaya, Indonesia');

-- Insert sample courses (approved)
INSERT INTO courses (title, description, content, contentType, author_id, isPublished) VALUES 
('Pengenalan JavaScript', 'Belajar dasar-dasar JavaScript untuk pemula. Kursus ini akan mengajarkan konsep fundamental seperti variabel, fungsi, dan kontrol alur.', 'JavaScript adalah bahasa pemrograman yang sangat populer untuk pengembangan web. Dalam kursus ini, Anda akan mempelajari dasar-dasar JavaScript termasuk variabel, tipe data, fungsi, dan kontrol alur program.', 'article', 2, TRUE),
('HTML dan CSS Dasar', 'Pelajari HTML dan CSS untuk membuat website yang menarik dan responsif. Kursus ini cocok untuk pemula yang ingin memulai karir di bidang web development.', 'HTML (HyperText Markup Language) adalah bahasa markup standar untuk membuat halaman web. CSS (Cascading Style Sheets) digunakan untuk styling dan layout halaman web.', 'article', 3, TRUE),
('React.js untuk Pemula', 'Kursus lengkap React.js dari dasar hingga mahir. Pelajari cara membuat aplikasi web modern dengan React.js.', 'React.js adalah library JavaScript untuk membangun user interface. Dalam kursus ini, Anda akan mempelajari komponen, state, props, dan hooks.', 'article', 2, TRUE);

-- Insert sample courses (pending)
INSERT INTO courses (title, description, content, contentType, author_id, isPublished) VALUES 
('Node.js Backend Development', 'Pelajari cara membuat backend API dengan Node.js dan Express. Kursus ini akan mengajarkan konsep server-side programming.', 'Node.js adalah runtime JavaScript yang memungkinkan Anda menjalankan JavaScript di server. Express adalah framework web untuk Node.js.', 'article', 3, FALSE),
('Database Design', 'Pelajari konsep dan praktik terbaik dalam merancang database. Kursus ini mencakup normalisasi, relasi, dan optimasi query.', 'Database design adalah proses merancang struktur database yang efisien dan mudah dipelihara. Kursus ini akan mengajarkan konsep normalisasi dan relasi antar tabel.', 'article', 4, FALSE);

-- Insert sample comments
INSERT INTO comments (text, author_id, course_id) VALUES 
('Kursus yang sangat bagus untuk pemula!', 3, 1),
('Terima kasih atas penjelasannya yang detail', 4, 1),
('Saya sudah mencoba dan hasilnya sangat memuaskan', 2, 2);

-- Insert sample replies
INSERT INTO comments (text, author_id, course_id, parent_id) VALUES 
('Setuju sekali!', 4, 1, 1),
('Sama-sama! Senang bisa membantu', 2, 1, 2);

-- =====================================================
-- INDEXES FOR OPTIMIZATION
-- =====================================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_courses_author ON courses(author_id);
CREATE INDEX idx_courses_published ON courses(isPublished);
CREATE INDEX idx_courses_created ON courses(created_at);
CREATE INDEX idx_comments_course ON comments(course_id);
CREATE INDEX idx_comments_author ON comments(author_id);
CREATE INDEX idx_comments_parent ON comments(parent_id); 