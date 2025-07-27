<?php
require_once '../functions.php';

// Cek apakah user adalah admin
requireAdmin();

// Ambil statistik
$stmt = $pdo->prepare("SELECT COUNT(*) as total FROM users WHERE is_admin = 0");
$stmt->execute();
$totalUsers = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

$stmt = $pdo->prepare("SELECT COUNT(*) as total FROM courses WHERE is_approved = 1");
$stmt->execute();
$totalApprovedCourses = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

$stmt = $pdo->prepare("SELECT COUNT(*) as total FROM courses WHERE is_approved = 0");
$stmt->execute();
$totalPendingCourses = $stmt->fetch(PDO::FETCH_ASSOC)['total'];

$stmt = $pdo->prepare("SELECT COUNT(*) as total FROM comments");
$stmt->execute();
$totalComments = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - <?php echo SITE_NAME; ?></title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap" rel="stylesheet">
</head>
<body class="bg-gray-900 text-white font-['Inter'] min-h-screen">
    <!-- Header -->
    <header class="bg-gray-800 shadow-lg">
        <div class="container mx-auto px-4 py-4">
            <div class="flex justify-between items-center">
                <div class="flex items-center space-x-4">
                    <h1 class="text-2xl font-bold text-red-400"><?php echo SITE_NAME; ?> Admin</h1>
                </div>
                <nav class="flex items-center space-x-6">
                    <a href="../index.php" class="text-gray-300 hover:text-white">Beranda</a>
                    <a href="approve-courses.php" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg">Approve Kursus</a>
                    <a href="manage-users.php" class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg">Kelola User</a>
                    <a href="../pages/logout.php" class="text-gray-300 hover:text-white">Logout</a>
                </nav>
            </div>
        </div>
    </header>

    <div class="container mx-auto px-4 py-8">
        <div class="max-w-6xl mx-auto">
            <!-- Welcome Section -->
            <div class="mb-8">
                <h2 class="text-3xl font-bold mb-2">Selamat Datang, <?php echo escape($_SESSION['user_name']); ?>!</h2>
                <p class="text-gray-400">Panel Admin - Kelola platform <?php echo SITE_NAME; ?></p>
            </div>

            <!-- Statistics Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div class="bg-blue-600 rounded-lg p-6">
                    <div class="flex items-center">
                        <div class="p-3 bg-blue-500 rounded-full">
                            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                            </svg>
                        </div>
                        <div class="ml-4">
                            <p class="text-blue-200 text-sm">Total Users</p>
                            <p class="text-2xl font-bold"><?php echo $totalUsers; ?></p>
                        </div>
                    </div>
                </div>

                <div class="bg-green-600 rounded-lg p-6">
                    <div class="flex items-center">
                        <div class="p-3 bg-green-500 rounded-full">
                            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <div class="ml-4">
                            <p class="text-green-200 text-sm">Kursus Disetujui</p>
                            <p class="text-2xl font-bold"><?php echo $totalApprovedCourses; ?></p>
                        </div>
                    </div>
                </div>

                <div class="bg-yellow-600 rounded-lg p-6">
                    <div class="flex items-center">
                        <div class="p-3 bg-yellow-500 rounded-full">
                            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <div class="ml-4">
                            <p class="text-yellow-200 text-sm">Menunggu Approval</p>
                            <p class="text-2xl font-bold"><?php echo $totalPendingCourses; ?></p>
                        </div>
                    </div>
                </div>

                <div class="bg-purple-600 rounded-lg p-6">
                    <div class="flex items-center">
                        <div class="p-3 bg-purple-500 rounded-full">
                            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                            </svg>
                        </div>
                        <div class="ml-4">
                            <p class="text-purple-200 text-sm">Total Komentar</p>
                            <p class="text-2xl font-bold"><?php echo $totalComments; ?></p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="bg-gray-800 rounded-lg p-6">
                    <h3 class="text-xl font-semibold mb-4">Quick Actions</h3>
                    <div class="space-y-3">
                        <a href="approve-courses.php" class="block bg-blue-600 hover:bg-blue-700 p-4 rounded-lg transition-colors">
                            <div class="flex items-center">
                                <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                <span>Review & Approve Kursus</span>
                            </div>
                        </a>
                        <a href="manage-users.php" class="block bg-green-600 hover:bg-green-700 p-4 rounded-lg transition-colors">
                            <div class="flex items-center">
                                <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                                </svg>
                                <span>Kelola Pengguna</span>
                            </div>
                        </a>
                        <a href="../index.php" class="block bg-gray-600 hover:bg-gray-700 p-4 rounded-lg transition-colors">
                            <div class="flex items-center">
                                <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                                </svg>
                                <span>Lihat Website</span>
                            </div>
                        </a>
                    </div>
                </div>

                <div class="bg-gray-800 rounded-lg p-6">
                    <h3 class="text-xl font-semibold mb-4">Recent Activity</h3>
                    <div class="space-y-3">
                        <?php
                        // Ambil 5 course terbaru
                        $stmt = $pdo->prepare("
                            SELECT c.*, u.name as author_name 
                            FROM courses c 
                            JOIN users u ON c.user_id = u.id 
                            ORDER BY c.created_at DESC 
                            LIMIT 5
                        ");
                        $stmt->execute();
                        $recentCourses = $stmt->fetchAll(PDO::FETCH_ASSOC);
                        ?>
                        
                        <?php if (empty($recentCourses)): ?>
                            <p class="text-gray-400">Belum ada aktivitas</p>
                        <?php else: ?>
                            <?php foreach ($recentCourses as $course): ?>
                                <div class="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                                    <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                        <span class="text-xs font-semibold">
                                            <?php echo strtoupper(substr($course['author_name'], 0, 1)); ?>
                                        </span>
                                    </div>
                                    <div class="flex-1">
                                        <p class="text-sm font-medium"><?php echo escape($course['title']); ?></p>
                                        <p class="text-xs text-gray-400">
                                            oleh <?php echo escape($course['author_name']); ?> • 
                                            <?php echo formatDate($course['created_at']); ?>
                                        </p>
                                    </div>
                                    <span class="text-xs px-2 py-1 rounded <?php echo $course['is_approved'] ? 'bg-green-600' : 'bg-yellow-600'; ?>">
                                        <?php echo $course['is_approved'] ? 'Disetujui' : 'Pending'; ?>
                                    </span>
                                </div>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html> 