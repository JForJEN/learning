<?php
require_once 'functions.php';

// Ambil semua course yang sudah diapprove
$courses = getApprovedCourses();
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo SITE_NAME; ?> - Platform Kursus Terbuka</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/style.css">
</head>
<body class="bg-gray-900 text-white font-['Inter']">
    <!-- Header -->
    <header class="bg-gray-800 shadow-lg">
        <div class="container mx-auto px-4 py-4">
            <div class="flex justify-between items-center">
                <div class="flex items-center space-x-4">
                    <h1 class="text-2xl font-bold text-blue-400"><?php echo SITE_NAME; ?></h1>
                    <p class="text-gray-300 hidden md:block">Platform Kursus Terbuka</p>
                </div>
                <nav class="flex items-center space-x-6">
                    <a href="index.php" class="text-blue-400 hover:text-blue-300">Beranda</a>
                    <?php if (isLoggedIn()): ?>
                        <a href="pages/submit-course.php" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg">Upload Materi</a>
                        <a href="pages/profile.php" class="text-gray-300 hover:text-white">Profil</a>
                        <?php if (isAdmin()): ?>
                            <a href="admin/dashboard.php" class="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg">Admin</a>
                        <?php endif; ?>
                        <a href="pages/logout.php" class="text-gray-300 hover:text-white">Logout</a>
                    <?php else: ?>
                        <a href="pages/login.php" class="text-gray-300 hover:text-white">Login</a>
                        <a href="pages/register.php" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg">Daftar</a>
                    <?php endif; ?>
                </nav>
            </div>
        </div>
    </header>

    <!-- Hero Section -->
    <section class="bg-gradient-to-r from-blue-900 to-purple-900 py-20">
        <div class="container mx-auto px-4 text-center">
            <h2 class="text-4xl md:text-6xl font-bold mb-6">
                Belajar Tanpa Batas
            </h2>
            <p class="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Platform kursus terbuka untuk semua. Upload, berbagi, dan belajar bersama komunitas global.
            </p>
            <?php if (!isLoggedIn()): ?>
                <div class="space-x-4">
                    <a href="pages/register.php" class="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg text-lg font-semibold">
                        Mulai Belajar
                    </a>
                    <a href="#courses" class="bg-transparent border-2 border-white hover:bg-white hover:text-gray-900 px-8 py-3 rounded-lg text-lg font-semibold">
                        Lihat Kursus
                    </a>
                </div>
            <?php endif; ?>
        </div>
    </section>

    <!-- Courses Section -->
    <section id="courses" class="py-16">
        <div class="container mx-auto px-4">
            <div class="text-center mb-12">
                <h3 class="text-3xl font-bold mb-4">Kursus Tersedia</h3>
                <p class="text-gray-400">Pilih kursus yang ingin Anda pelajari</p>
            </div>

            <?php if (empty($courses)): ?>
                <div class="text-center py-12">
                    <p class="text-gray-400 text-lg">Belum ada kursus tersedia.</p>
                    <?php if (isLoggedIn()): ?>
                        <a href="pages/submit-course.php" class="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg mt-4 inline-block">
                            Upload Kursus Pertama
                        </a>
                    <?php endif; ?>
                </div>
            <?php else: ?>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <?php foreach ($courses as $course): ?>
                        <div class="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                            <div class="p-6">
                                <h4 class="text-xl font-semibold mb-2"><?php echo escape($course['title']); ?></h4>
                                <p class="text-gray-400 mb-4 line-clamp-3"><?php echo escape($course['description']); ?></p>
                                
                                <div class="flex items-center justify-between mb-4">
                                    <span class="text-sm text-gray-500">Oleh: <?php echo escape($course['author_name']); ?></span>
                                    <span class="text-sm text-gray-500"><?php echo formatDate($course['created_at']); ?></span>
                                </div>

                                <?php if ($course['file_path']): ?>
                                    <div class="mb-4">
                                        <?php 
                                        $fileType = getFileType($course['file_path']);
                                        if ($fileType == 'image'): ?>
                                            <img src="uploads/<?php echo $course['file_path']; ?>" alt="Thumbnail" class="w-full h-32 object-cover rounded">
                                        <?php elseif ($fileType == 'video'): ?>
                                            <video class="w-full h-32 object-cover rounded" controls>
                                                <source src="uploads/<?php echo $course['file_path']; ?>" type="video/mp4">
                                                Browser Anda tidak mendukung video.
                                            </video>
                                        <?php elseif ($fileType == 'audio'): ?>
                                            <audio class="w-full" controls>
                                                <source src="uploads/<?php echo $course['file_path']; ?>" type="audio/mpeg">
                                                Browser Anda tidak mendukung audio.
                                            </audio>
                                        <?php else: ?>
                                            <div class="bg-gray-700 p-4 rounded text-center">
                                                <span class="text-blue-400">📄 <?php echo strtoupper(pathinfo($course['file_path'], PATHINFO_EXTENSION)); ?></span>
                                            </div>
                                        <?php endif; ?>
                                    </div>
                                <?php endif; ?>

                                <div class="flex justify-between items-center">
                                    <a href="pages/course-detail.php?id=<?php echo $course['id']; ?>" 
                                       class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm">
                                        Lihat Detail
                                    </a>
                                    <?php if (!isLoggedIn()): ?>
                                        <span class="text-xs text-gray-500">Login untuk akses penuh</span>
                                    <?php endif; ?>
                                </div>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
        </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-800 py-8">
        <div class="container mx-auto px-4 text-center">
            <p class="text-gray-400">&copy; 2024 <?php echo SITE_NAME; ?>. Platform Kursus Terbuka.</p>
        </div>
    </footer>

    <script src="js/main.js"></script>
</body>
</html> 