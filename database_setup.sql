-- =====================================================
-- StillLearning Database Setup
-- Database: stilllearning_db
-- =====================================================

-- Gunakan database
USE stilllearning_db;

-- =====================================================
-- Tabel users
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    avatar TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- Tabel courses
-- =====================================================
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
);

-- =====================================================
-- Tabel comments
-- =====================================================
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
);

-- =====================================================
-- Insert Data Awal
-- =====================================================

-- Insert Admin User
INSERT INTO users (name, email, password, role) VALUES 
('Admin Ali', 'admin@stilllearning.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Insert User 1
INSERT INTO users (name, email, password, role) VALUES 
('Student Siti', 'siti@stilllearning.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Insert User 2
INSERT INTO users (name, email, password, role) VALUES 
('Creator Chandra', 'chandra@stilllearning.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- =====================================================
-- Insert Sample Courses
-- =====================================================

-- Course 1: React Hooks
INSERT INTO courses (title, description, content, contentType, thumbnailUrl, author_id, isPublished) VALUES 
('Pengantar React Hooks', 
 'Pelajari dasar-dasar React Hooks, dari useState hingga useEffect dan custom hooks.', 
 '# Memahami React Hooks

React Hooks adalah fungsi yang memungkinkan Anda "terhubung" ke fitur state dan siklus hidup React dari komponen fungsi. Hooks tidak berfungsi di dalam kelas — mereka memungkinkan Anda menggunakan React tanpa kelas.

## State Hook: `useState`

`useState` adalah Hook yang memungkinkan Anda menambahkan state React ke komponen fungsi.

```javascript
import React, { useState } from "react";

function Example() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Anda mengklik {count} kali</p>
      <button onClick={() => setCount(count + 1)}>
        Klik saya
      </button>
    </div>
  );
}
```

## Effect Hook: `useEffect`

Effect Hook, `useEffect`, menambahkan kemampuan untuk melakukan efek samping dari komponen fungsi.',
 'ARTICLE', 
 'https://picsum.photos/seed/react/600/400', 
 (SELECT id FROM users WHERE email = 'admin@stilllearning.com'), 
 TRUE);

-- Course 2: Tailwind CSS
INSERT INTO courses (title, description, content, contentType, thumbnailUrl, author_id, isPublished) VALUES 
('Desain Responsif dengan Tailwind CSS', 
 'Kuasai seni membuat tata letak responsif yang berfungsi di semua perangkat menggunakan Tailwind CSS.', 
 'https://www.w3schools.com/html/mov_bbb.mp4',
 'VIDEO', 
 'https://picsum.photos/seed/tailwind/600/400', 
 (SELECT id FROM users WHERE email = 'admin@stilllearning.com'), 
 TRUE);

-- Course 3: TypeScript
INSERT INTO courses (title, description, content, contentType, thumbnailUrl, author_id, isPublished) VALUES 
('TypeScript Tingkat Lanjut', 
 'Selami lebih dalam fitur-fitur TypeScript tingkat lanjut seperti generics, decorators, dan mapped types.', 
 '/path/to/mock.pdf',
 'PDF', 
 'https://picsum.photos/seed/typescript/600/400', 
 (SELECT id FROM users WHERE email = 'chandra@stilllearning.com'), 
 TRUE);

-- Course 4: Fotografi
INSERT INTO courses (title, description, content, contentType, thumbnailUrl, author_id, isPublished) VALUES 
('Keindahan Alam (Fotografi)', 
 'Sebuah perjalanan visual melalui lanskap menakjubkan dan fotografi satwa liar.', 
 'https://picsum.photos/seed/nature-content/1200/800',
 'IMAGE', 
 'https://picsum.photos/seed/nature/600/400', 
 (SELECT id FROM users WHERE email = 'siti@stilllearning.com'), 
 TRUE);

-- =====================================================
-- Insert Sample Comments
-- =====================================================

-- Comment untuk Course 1
INSERT INTO comments (course_id, author_id, text) VALUES 
((SELECT id FROM courses WHERE title = 'Pengantar React Hooks' LIMIT 1), 
 (SELECT id FROM users WHERE email = 'siti@stilllearning.com'), 
 'Ini pengantar yang bagus! Akhirnya saya mengerti useState.');

-- Reply untuk comment di atas
INSERT INTO comments (course_id, author_id, text, parent_id) VALUES 
((SELECT id FROM courses WHERE title = 'Pengantar React Hooks' LIMIT 1), 
 (SELECT id FROM users WHERE email = 'admin@stilllearning.com'), 
 'Senang mendengarnya membantu!',
 (SELECT id FROM comments WHERE text LIKE '%useState%' LIMIT 1));

-- =====================================================
-- Verifikasi Data
-- =====================================================

-- Tampilkan semua tabel yang dibuat
SHOW TABLES;

-- Tampilkan struktur tabel users
DESCRIBE users;

-- Tampilkan struktur tabel courses
DESCRIBE courses;

-- Tampilkan struktur tabel comments
DESCRIBE comments;

-- Tampilkan data users
SELECT id, name, email, role, created_at FROM users;

-- Tampilkan data courses
SELECT c.id, c.title, c.contentType, c.isPublished, u.name as author 
FROM courses c 
JOIN users u ON c.author_id = u.id;

-- Tampilkan data comments
SELECT c.id, c.text, u.name as author, co.title as course_title
FROM comments c 
JOIN users u ON c.author_id = u.id
JOIN courses co ON c.course_id = co.id;

-- =====================================================
-- Informasi Login Default
-- =====================================================
-- 
-- Password untuk semua user adalah: 'password'
-- (Sudah di-hash menggunakan bcrypt)
-- 
-- Admin: admin@stilllearning.com / password
-- User: siti@stilllearning.com / password  
-- Creator: chandra@stilllearning.com / password
--
-- ===================================================== 