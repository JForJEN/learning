-- Database untuk aplikasi StillLearning PHP
-- Buat database jika belum ada
CREATE DATABASE IF NOT EXISTS stilllearning CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE stilllearning;

-- Tabel users
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    is_admin TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabel courses
CREATE TABLE IF NOT EXISTS courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    file_path VARCHAR(255),
    user_id INT NOT NULL,
    is_approved TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabel comments
CREATE TABLE IF NOT EXISTS comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert admin default
INSERT INTO users (name, email, password, is_admin, created_at) VALUES 
('Admin', 'admin@stilllearning.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, NOW());

-- Insert sample users
INSERT INTO users (name, email, password, phone, address, is_admin, created_at) VALUES 
('John Doe', 'john@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '08123456789', 'Jakarta, Indonesia', 0, NOW()),
('Jane Smith', 'jane@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '08765432109', 'Bandung, Indonesia', 0, NOW()),
('Bob Johnson', 'bob@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '08987654321', 'Surabaya, Indonesia', 0, NOW());

-- Insert sample courses
INSERT INTO courses (title, description, category, file_path, user_id, is_approved, created_at) VALUES 
('Pengenalan HTML dan CSS', 'Materi dasar untuk mempelajari HTML dan CSS. Cocok untuk pemula yang ingin belajar web development.', 'Teknologi', 'sample-html-css.pdf', 2, 1, NOW()),
('Dasar-dasar JavaScript', 'Belajar JavaScript dari nol hingga mahir. Materi ini mencakup konsep dasar hingga advanced.', 'Teknologi', 'javascript-basics.pdf', 2, 1, NOW()),
('Konsep Database MySQL', 'Panduan lengkap untuk memahami database MySQL dan cara menggunakannya.', 'Teknologi', 'mysql-guide.pdf', 3, 1, NOW()),
('Pemrograman PHP Dasar', 'Materi pembelajaran PHP untuk pemula. Mulai dari sintaks dasar hingga membuat aplikasi web sederhana.', 'Teknologi', 'php-basics.pdf', 3, 1, NOW()),
('Desain UI/UX Modern', 'Panduan lengkap untuk membuat desain UI/UX yang modern dan user-friendly.', 'Seni', 'uiux-design.pdf', 4, 1, NOW()),
('Kesehatan Mental di Era Digital', 'Materi tentang menjaga kesehatan mental di tengah perkembangan teknologi yang pesat.', 'Kesehatan', 'mental-health.pdf', 4, 0, NOW());

-- Insert sample comments
INSERT INTO comments (course_id, user_id, content, created_at) VALUES 
(1, 2, 'Materi yang sangat bagus dan mudah dipahami!', NOW()),
(1, 3, 'Terima kasih atas materinya, sangat membantu untuk pemula seperti saya.', NOW()),
(2, 4, 'Penjelasannya detail dan contoh-contohnya praktis.', NOW()),
(3, 2, 'Materi database yang komprehensif, recommended!', NOW()),
(4, 3, 'PHP memang bahasa yang powerful untuk web development.', NOW()),
(5, 4, 'Desain UI/UX yang modern sangat penting untuk user experience.', NOW());

-- Buat index untuk optimasi query
CREATE INDEX idx_courses_user_id ON courses(user_id);
CREATE INDEX idx_courses_approved ON courses(is_approved);
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_comments_course_id ON comments(course_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_admin ON users(is_admin); 