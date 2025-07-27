<?php
require_once 'config.php';

// Fungsi untuk hash password
function hashPassword($password) {
    return password_hash($password, PASSWORD_DEFAULT);
}

// Fungsi untuk verify password
function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}

// Fungsi untuk mendapatkan user berdasarkan ID
function getUserById($id) {
    global $pdo;
    $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
    $stmt->execute([$id]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

// Fungsi untuk mendapatkan semua course yang sudah diapprove
function getApprovedCourses() {
    global $pdo;
    $stmt = $pdo->prepare("
        SELECT c.*, u.name as author_name 
        FROM courses c 
        JOIN users u ON c.user_id = u.id 
        WHERE c.is_approved = 1 
        ORDER BY c.created_at DESC
    ");
    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

// Fungsi untuk mendapatkan course berdasarkan ID
function getCourseById($id) {
    global $pdo;
    $stmt = $pdo->prepare("
        SELECT c.*, u.name as author_name 
        FROM courses c 
        JOIN users u ON c.user_id = u.id 
        WHERE c.id = ?
    ");
    $stmt->execute([$id]);
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

// Fungsi untuk mendapatkan course yang pending approval
function getPendingCourses() {
    global $pdo;
    $stmt = $pdo->prepare("
        SELECT c.*, u.name as author_name 
        FROM courses c 
        JOIN users u ON c.user_id = u.id 
        WHERE c.is_approved = 0 
        ORDER BY c.created_at DESC
    ");
    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

// Fungsi untuk mendapatkan komentar course
function getCourseComments($courseId) {
    global $pdo;
    $stmt = $pdo->prepare("
        SELECT c.*, u.name as user_name 
        FROM comments c 
        JOIN users u ON c.user_id = u.id 
        WHERE c.course_id = ? 
        ORDER BY c.created_at ASC
    ");
    $stmt->execute([$courseId]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

// Fungsi untuk upload file
function uploadFile($file, $allowedTypes = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'mp4', 'mp3', 'doc', 'docx']) {
    if (!isset($file['tmp_name']) || empty($file['tmp_name'])) {
        return false;
    }

    $fileName = $file['name'];
    $fileSize = $file['size'];
    $fileTmp = $file['tmp_name'];
    $fileType = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));

    // Cek ukuran file
    if ($fileSize > MAX_FILE_SIZE) {
        return false;
    }

    // Cek tipe file
    if (!in_array($fileType, $allowedTypes)) {
        return false;
    }

    // Generate nama file unik
    $newFileName = uniqid() . '.' . $fileType;
    $uploadPath = UPLOAD_PATH . $newFileName;

    // Upload file
    if (move_uploaded_file($fileTmp, $uploadPath)) {
        return $newFileName;
    }

    return false;
}

// Fungsi untuk mendapatkan tipe file
function getFileType($filename) {
    $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
    $imageTypes = ['jpg', 'jpeg', 'png', 'gif'];
    $videoTypes = ['mp4', 'avi', 'mov', 'wmv'];
    $audioTypes = ['mp3', 'wav', 'ogg'];
    $documentTypes = ['pdf', 'doc', 'docx', 'ppt', 'pptx'];

    if (in_array($ext, $imageTypes)) return 'image';
    if (in_array($ext, $videoTypes)) return 'video';
    if (in_array($ext, $audioTypes)) return 'audio';
    if (in_array($ext, $documentTypes)) return 'document';
    
    return 'other';
}

// Fungsi untuk format tanggal
function formatDate($date) {
    return date('d F Y H:i', strtotime($date));
}

// Fungsi untuk mengecek apakah user sudah login
function requireLogin() {
    if (!isLoggedIn()) {
        redirect('pages/login.php');
    }
}

// Fungsi untuk mengecek apakah user adalah admin
function requireAdmin() {
    if (!isAdmin()) {
        redirect('index.php');
    }
}

// Fungsi untuk mendapatkan semua users
function getAllUsers() {
    global $pdo;
    $stmt = $pdo->prepare("SELECT * FROM users ORDER BY created_at DESC");
    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

// Fungsi untuk menghapus course
function deleteCourse($id) {
    global $pdo;
    $stmt = $pdo->prepare("DELETE FROM courses WHERE id = ?");
    return $stmt->execute([$id]);
}

// Fungsi untuk menghapus user
function deleteUser($id) {
    global $pdo;
    $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
    return $stmt->execute([$id]);
}
?> 