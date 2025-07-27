<?php
require_once '../functions.php';

// Cek apakah user sudah login
requireLogin();

$user = getUserById($_SESSION['user_id']);
$error = '';
$success = '';

// Handle update profile
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $name = trim($_POST['name']);
    $phone = trim($_POST['phone']);
    $address = trim($_POST['address']);
    $current_password = $_POST['current_password'];
    $new_password = $_POST['new_password'];
    $confirm_password = $_POST['confirm_password'];

    if (empty($name)) {
        $error = 'Nama tidak boleh kosong!';
    } else {
        try {
            // Update basic info
            $stmt = $pdo->prepare("UPDATE users SET name = ?, phone = ?, address = ? WHERE id = ?");
            $stmt->execute([$name, $phone, $address, $_SESSION['user_id']]);
            
            // Update password if provided
            if (!empty($current_password) && !empty($new_password)) {
                if (!verifyPassword($current_password, $user['password'])) {
                    $error = 'Password saat ini salah!';
                } elseif ($new_password !== $confirm_password) {
                    $error = 'Password baru tidak cocok!';
                } elseif (strlen($new_password) < 6) {
                    $error = 'Password minimal 6 karakter!';
                } else {
                    $hashedPassword = hashPassword($new_password);
                    $stmt = $pdo->prepare("UPDATE users SET password = ? WHERE id = ?");
                    $stmt->execute([$hashedPassword, $_SESSION['user_id']]);
                }
            }
            
            if (empty($error)) {
                $success = 'Profil berhasil diupdate!';
                $_SESSION['user_name'] = $name;
                $user = getUserById($_SESSION['user_id']); // Refresh user data
            }
        } catch (PDOException $e) {
            $error = 'Terjadi kesalahan sistem!';
        }
    }
}

// Ambil course yang dibuat user
$stmt = $pdo->prepare("SELECT * FROM courses WHERE user_id = ? ORDER BY created_at DESC");
$stmt->execute([$_SESSION['user_id']]);
$userCourses = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Profil - <?php echo SITE_NAME; ?></title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap" rel="stylesheet">
</head>
<body class="bg-gray-900 text-white font-['Inter'] min-h-screen">
    <!-- Header -->
    <header class="bg-gray-800 shadow-lg">
        <div class="container mx-auto px-4 py-4">
            <div class="flex justify-between items-center">
                <div class="flex items-center space-x-4">
                    <a href="../index.php" class="text-2xl font-bold text-blue-400"><?php echo SITE_NAME; ?></a>
                </div>
                <nav class="flex items-center space-x-6">
                    <a href="../index.php" class="text-gray-300 hover:text-white">Beranda</a>
                    <a href="submit-course.php" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg">Upload Materi</a>
                    <a href="profile.php" class="text-blue-400">Profil</a>
                    <?php if (isAdmin()): ?>
                        <a href="../admin/dashboard.php" class="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg">Admin</a>
                    <?php endif; ?>
                    <a href="logout.php" class="text-gray-300 hover:text-white">Logout</a>
                </nav>
            </div>
        </div>
    </header>

    <div class="container mx-auto px-4 py-8">
        <div class="max-w-4xl mx-auto">
            <!-- Header -->
            <div class="mb-8">
                <h1 class="text-3xl font-bold mb-2">Profil Saya</h1>
                <p class="text-gray-400">Kelola informasi profil Anda</p>
            </div>

            <?php if ($error): ?>
                <div class="bg-red-600 text-white p-4 rounded-lg mb-6">
                    <?php echo escape($error); ?>
                </div>
            <?php endif; ?>

            <?php if ($success): ?>
                <div class="bg-green-600 text-white p-4 rounded-lg mb-6">
                    <?php echo escape($success); ?>
                </div>
            <?php endif; ?>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <!-- Profile Form -->
                <div class="bg-gray-800 rounded-lg shadow-xl p-8">
                    <h2 class="text-xl font-semibold mb-6">Informasi Profil</h2>
                    
                    <form method="POST" class="space-y-6">
                        <div>
                            <label for="name" class="block text-sm font-medium text-gray-300 mb-2">
                                Nama Lengkap *
                            </label>
                            <input type="text" id="name" name="name" required
                                   class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                                   value="<?php echo escape($user['name']); ?>">
                        </div>

                        <div>
                            <label for="email" class="block text-sm font-medium text-gray-300 mb-2">
                                Email
                            </label>
                            <input type="email" id="email" value="<?php echo escape($user['email']); ?>" disabled
                                   class="w-full px-4 py-3 bg-gray-600 border border-gray-500 rounded-lg text-gray-400">
                            <p class="text-xs text-gray-400 mt-1">Email tidak dapat diubah</p>
                        </div>

                        <div>
                            <label for="phone" class="block text-sm font-medium text-gray-300 mb-2">
                                Nomor Telepon
                            </label>
                            <input type="tel" id="phone" name="phone"
                                   class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                                   value="<?php echo escape($user['phone']); ?>">
                        </div>

                        <div>
                            <label for="address" class="block text-sm font-medium text-gray-300 mb-2">
                                Alamat
                            </label>
                            <textarea id="address" name="address" rows="3"
                                      class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white"><?php echo escape($user['address']); ?></textarea>
                        </div>

                        <div class="border-t border-gray-700 pt-6">
                            <h3 class="text-lg font-semibold mb-4">Ubah Password</h3>
                            
                            <div class="space-y-4">
                                <div>
                                    <label for="current_password" class="block text-sm font-medium text-gray-300 mb-2">
                                        Password Saat Ini
                                    </label>
                                    <input type="password" id="current_password" name="current_password"
                                           class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white">
                                </div>

                                <div>
                                    <label for="new_password" class="block text-sm font-medium text-gray-300 mb-2">
                                        Password Baru
                                    </label>
                                    <input type="password" id="new_password" name="new_password"
                                           class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white">
                                </div>

                                <div>
                                    <label for="confirm_password" class="block text-sm font-medium text-gray-300 mb-2">
                                        Konfirmasi Password Baru
                                    </label>
                                    <input type="password" id="confirm_password" name="confirm_password"
                                           class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white">
                                </div>
                            </div>
                        </div>

                        <button type="submit" 
                                class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
                            Update Profil
                        </button>
                    </form>
                </div>

                <!-- User Courses -->
                <div class="bg-gray-800 rounded-lg shadow-xl p-8">
                    <h2 class="text-xl font-semibold mb-6">Materi Saya</h2>
                    
                    <?php if (empty($userCourses)): ?>
                        <div class="text-center py-8">
                            <p class="text-gray-400 mb-4">Anda belum mengupload materi apapun</p>
                            <a href="submit-course.php" class="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg inline-block">
                                Upload Materi Pertama
                            </a>
                        </div>
                    <?php else: ?>
                        <div class="space-y-4">
                            <?php foreach ($userCourses as $course): ?>
                                <div class="border border-gray-700 rounded-lg p-4">
                                    <div class="flex justify-between items-start mb-2">
                                        <h3 class="font-semibold"><?php echo escape($course['title']); ?></h3>
                                        <span class="text-xs px-2 py-1 rounded <?php echo $course['is_approved'] ? 'bg-green-600' : 'bg-yellow-600'; ?>">
                                            <?php echo $course['is_approved'] ? 'Disetujui' : 'Pending'; ?>
                                        </span>
                                    </div>
                                    <p class="text-sm text-gray-400 mb-2"><?php echo escape($course['category']); ?></p>
                                    <p class="text-xs text-gray-500"><?php echo formatDate($course['created_at']); ?></p>
                                    
                                    <?php if ($course['is_approved']): ?>
                                        <a href="course-detail.php?id=<?php echo $course['id']; ?>" 
                                           class="text-blue-400 hover:text-blue-300 text-sm">
                                            Lihat Detail →
                                        </a>
                                    <?php endif; ?>
                                </div>
                            <?php endforeach; ?>
                        </div>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>
</body>
</html> 