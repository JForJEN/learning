<?php
// ========================================
// KONFIGURASI DATABASE RAILWAY
// ========================================
// Menggunakan environment variables untuk Railway
$host = getenv('DB_HOST') ?: 'localhost';
$dbname = getenv('DB_NAME') ?: 'railway';
$username = getenv('DB_USER') ?: 'root';
$password = getenv('DB_PASS') ?: '';
$dbport = getenv('DB_PORT') ?: '3306';

// ========================================
// DEBUG MODE - AKTIFKAN UNTUK BYETHOST
// ========================================
// Set true untuk melihat error di Byethost
define('DEBUG_MODE', true);

if (DEBUG_MODE) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}

// ========================================
// KONEKSI DATABASE DENGAN ERROR HANDLING
// ========================================
try {
    $dsn = "mysql:host=$host;port=$dbport;dbname=$dbname;charset=utf8mb4";
    $pdo = new PDO($dsn, $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    if (DEBUG_MODE) {
        echo "<!-- Database connected successfully -->";
    }
} catch(PDOException $e) {
    if (DEBUG_MODE) {
        die("Koneksi database gagal: " . $e->getMessage());
    } else {
        die("Database connection failed. Please check configuration.");
    }
}

// ========================================
// KONFIGURASI APLIKASI
// ========================================
define('SITE_NAME', 'StillLearning');
define('SITE_URL', getenv('APP_URL') ?: 'https://stilllearning-production-3b76.up.railway.app');
define('UPLOAD_PATH', getenv('UPLOAD_PATH') ?: 'uploads/');
define('MAX_FILE_SIZE', getenv('MAX_FILE_SIZE') ?: (10 * 1024 * 1024)); // 10MB untuk Railway

// Mulai session dengan error handling
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

// ========================================
// FUNGSI UTILITAS
// ========================================

// Fungsi untuk mengecek apakah user sudah login
function isLoggedIn() {
    return isset($_SESSION['user_id']);
}

// Fungsi untuk mengecek apakah user adalah admin
function isAdmin() {
    return isset($_SESSION['is_admin']) && $_SESSION['is_admin'] == 1;
}

// Fungsi untuk redirect
function redirect($url) {
    header("Location: $url");
    exit();
}

// Fungsi untuk escape HTML
function escape($string) {
    return htmlspecialchars($string, ENT_QUOTES, 'UTF-8');
}

// ========================================
// BYETHOST COMPATIBILITY
// ========================================
// Set timezone
date_default_timezone_set('Asia/Jakarta');

// Set memory limit untuk Byethost
ini_set('memory_limit', '128M');

// Set max execution time
ini_set('max_execution_time', 300);

// Check if required functions exist
if (!function_exists('password_hash')) {
    die("Password hashing not available. Please upgrade PHP version.");
}

if (DEBUG_MODE) {
    echo "<!-- Config loaded successfully -->";
}
?> 