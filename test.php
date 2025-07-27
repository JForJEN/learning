<?php
// ========================================
// TEST FILE - StillLearning PHP
// ========================================
// File ini untuk testing semua fungsi sebelum upload ke Byethost

echo "<h1>🧪 StillLearning PHP - System Test</h1>";
echo "<style>body{font-family:Arial;margin:20px;background:#f0f0f0;} .test{background:white;padding:15px;margin:10px 0;border-radius:5px;} .success{background:#d4edda;border-left:4px solid #28a745;} .error{background:#f8d7da;border-left:4px solid #dc3545;} .warning{background:#fff3cd;border-left:4px solid #ffc107;}</style>";

// Test 1: PHP Version
echo "<div class='test'>";
echo "<h3>✅ Test 1: PHP Version</h3>";
echo "PHP Version: " . phpversion();
if (version_compare(PHP_VERSION, '7.4.0') >= 0) {
    echo " <span style='color:green;'>✓ Compatible</span>";
} else {
    echo " <span style='color:red;'>✗ Need PHP 7.4+</span>";
}
echo "</div>";

// Test 2: Required Extensions
echo "<div class='test'>";
echo "<h3>✅ Test 2: Required Extensions</h3>";
$required_extensions = ['pdo', 'pdo_mysql', 'fileinfo', 'session'];
foreach ($required_extensions as $ext) {
    if (extension_loaded($ext)) {
        echo "✓ $ext <br>";
    } else {
        echo "✗ $ext (Missing)<br>";
    }
}
echo "</div>";

// Test 3: Database Connection
echo "<div class='test'>";
echo "<h3>✅ Test 3: Database Connection</h3>";
try {
    require_once 'config.php';
    echo "✓ Database connection successful<br>";
    echo "✓ PDO connection established<br>";
} catch (Exception $e) {
    echo "✗ Database connection failed: " . $e->getMessage() . "<br>";
}
echo "</div>";

// Test 4: File Permissions
echo "<div class='test'>";
echo "<h3>✅ Test 4: File Permissions</h3>";
$upload_dir = 'uploads/';
if (is_dir($upload_dir)) {
    echo "✓ Uploads directory exists<br>";
    if (is_writable($upload_dir)) {
        echo "✓ Uploads directory is writable<br>";
    } else {
        echo "✗ Uploads directory is not writable<br>";
    }
} else {
    echo "✗ Uploads directory does not exist<br>";
}
echo "</div>";

// Test 5: Functions Test
echo "<div class='test'>";
echo "<h3>✅ Test 5: Functions Test</h3>";
try {
    require_once 'functions.php';
    echo "✓ Functions file loaded successfully<br>";
    
    // Test password hashing
    $test_password = 'test123';
    $hashed = hashPassword($test_password);
    if (verifyPassword($test_password, $hashed)) {
        echo "✓ Password hashing works<br>";
    } else {
        echo "✗ Password hashing failed<br>";
    }
    
    // Test escape function
    $test_string = '<script>alert("test")</script>';
    $escaped = escape($test_string);
    if ($escaped !== $test_string) {
        echo "✓ HTML escaping works<br>";
    } else {
        echo "✗ HTML escaping failed<br>";
    }
    
} catch (Exception $e) {
    echo "✗ Functions test failed: " . $e->getMessage() . "<br>";
}
echo "</div>";

// Test 6: Database Tables
echo "<div class='test'>";
echo "<h3>✅ Test 6: Database Tables</h3>";
try {
    $tables = ['users', 'courses', 'comments'];
    foreach ($tables as $table) {
        $stmt = $pdo->prepare("SHOW TABLES LIKE ?");
        $stmt->execute([$table]);
        if ($stmt->rowCount() > 0) {
            echo "✓ Table '$table' exists<br>";
        } else {
            echo "✗ Table '$table' missing<br>";
        }
    }
} catch (Exception $e) {
    echo "✗ Database tables test failed: " . $e->getMessage() . "<br>";
}
echo "</div>";

// Test 7: Sample Data
echo "<div class='test'>";
echo "<h3>✅ Test 7: Sample Data</h3>";
try {
    // Check admin user
    $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM users WHERE is_admin = 1");
    $stmt->execute();
    $admin_count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    echo "✓ Admin users: $admin_count<br>";
    
    // Check regular users
    $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM users WHERE is_admin = 0");
    $stmt->execute();
    $user_count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    echo "✓ Regular users: $user_count<br>";
    
    // Check courses
    $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM courses");
    $stmt->execute();
    $course_count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    echo "✓ Total courses: $course_count<br>";
    
} catch (Exception $e) {
    echo "✗ Sample data test failed: " . $e->getMessage() . "<br>";
}
echo "</div>";

// Test 8: File Upload Test
echo "<div class='test'>";
echo "<h3>✅ Test 8: File Upload Configuration</h3>";
echo "Upload max filesize: " . ini_get('upload_max_filesize') . "<br>";
echo "Post max size: " . ini_get('post_max_size') . "<br>";
echo "Max file uploads: " . ini_get('max_file_uploads') . "<br>";
echo "File uploads enabled: " . (ini_get('file_uploads') ? 'Yes' : 'No') . "<br>";
echo "</div>";

// Test 9: Session Test
echo "<div class='test'>";
echo "<h3>✅ Test 9: Session Test</h3>";
if (session_status() === PHP_SESSION_ACTIVE) {
    echo "✓ Sessions are working<br>";
} else {
    echo "✗ Sessions are not working<br>";
}
echo "Session save path: " . session_save_path() . "<br>";
echo "</div>";

// Test 10: URL Configuration
echo "<div class='test'>";
echo "<h3>✅ Test 10: URL Configuration</h3>";
echo "Current URL: " . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'] . "<br>";
echo "SITE_URL configured: " . SITE_URL . "<br>";
echo "<strong>⚠️ Remember to update SITE_URL in config.php with your Byethost domain!</strong><br>";
echo "</div>";

// Summary
echo "<div class='test' style='background:#e2e3e5;'>";
echo "<h3>📋 Test Summary</h3>";
echo "<p><strong>Jika semua test menunjukkan ✓ (hijau), maka sistem siap untuk diupload ke Byethost!</strong></p>";
echo "<p><strong>Langkah selanjutnya:</strong></p>";
echo "<ol>";
echo "<li>Update kredensial database di config.php</li>";
echo "<li>Update SITE_URL dengan domain Byethost Anda</li>";
echo "<li>Upload semua file ke Byethost</li>";
echo "<li>Import database SQL</li>";
echo "<li>Set permission folder uploads/</li>";
echo "<li>Test website online</li>";
echo "</ol>";
echo "</div>";

echo "<div class='test' style='background:#d1ecf1;'>";
echo "<h3>🔑 Default Login Credentials</h3>";
echo "<p><strong>Admin:</strong> admin@stilllearning.com / password</p>";
echo "<p><strong>Users:</strong> john@example.com, jane@example.com, bob@example.com / password</p>";
echo "</div>";
?> 