<?php
require_once '../functions.php';

// Cek apakah user adalah admin
requireAdmin();

$message = '';

// Handle approve/reject action
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['action']) && isset($_POST['course_id'])) {
    $courseId = (int)$_POST['course_id'];
    $action = $_POST['action'];
    
    try {
        if ($action === 'approve') {
            $stmt = $pdo->prepare("UPDATE courses SET is_approved = 1 WHERE id = ?");
            $stmt->execute([$courseId]);
            $message = 'Kursus berhasil disetujui!';
        } elseif ($action === 'reject') {
            $stmt = $pdo->prepare("DELETE FROM courses WHERE id = ?");
            $stmt->execute([$courseId]);
            $message = 'Kursus berhasil ditolak dan dihapus!';
        }
    } catch (PDOException $e) {
        $message = 'Terjadi kesalahan sistem!';
    }
}

// Ambil semua course yang pending
$pendingCourses = getPendingCourses();
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Approve Kursus - <?php echo SITE_NAME; ?> Admin</title>
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
                    <a href="dashboard.php" class="text-gray-300 hover:text-white">Dashboard</a>
                    <a href="approve-courses.php" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg">Approve Kursus</a>
                    <a href="manage-users.php" class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg">Kelola User</a>
                    <a href="../pages/logout.php" class="text-gray-300 hover:text-white">Logout</a>
                </nav>
            </div>
        </div>
    </header>

    <div class="container mx-auto px-4 py-8">
        <div class="max-w-6xl mx-auto">
            <!-- Header -->
            <div class="mb-8">
                <h2 class="text-3xl font-bold mb-2">Review & Approve Kursus</h2>
                <p class="text-gray-400">Review materi yang menunggu approval</p>
            </div>

            <?php if ($message): ?>
                <div class="bg-green-600 text-white p-4 rounded-lg mb-6">
                    <?php echo escape($message); ?>
                </div>
            <?php endif; ?>

            <?php if (empty($pendingCourses)): ?>
                <div class="bg-gray-800 rounded-lg p-8 text-center">
                    <div class="text-4xl mb-4">🎉</div>
                    <h3 class="text-xl font-semibold mb-2">Tidak Ada Kursus Pending</h3>
                    <p class="text-gray-400">Semua materi sudah direview dan disetujui!</p>
                </div>
            <?php else: ?>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <?php foreach ($pendingCourses as $course): ?>
                        <div class="bg-gray-800 rounded-lg shadow-xl p-6">
                            <div class="mb-4">
                                <h3 class="text-xl font-semibold mb-2"><?php echo escape($course['title']); ?></h3>
                                <div class="flex items-center space-x-4 text-sm text-gray-400 mb-3">
                                    <span>Oleh: <?php echo escape($course['author_name']); ?></span>
                                    <span>•</span>
                                    <span><?php echo formatDate($course['created_at']); ?></span>
                                    <span>•</span>
                                    <span class="bg-yellow-600 px-2 py-1 rounded text-xs"><?php echo escape($course['category']); ?></span>
                                </div>
                                <p class="text-gray-300 text-sm leading-relaxed"><?php echo nl2br(escape($course['description'])); ?></p>
                            </div>

                            <?php if ($course['file_path']): ?>
                                <div class="mb-4">
                                    <h4 class="text-sm font-medium text-gray-300 mb-2">File Materi:</h4>
                                    <?php 
                                    $fileType = getFileType($course['file_path']);
                                    if ($fileType == 'image'): ?>
                                        <img src="../uploads/<?php echo $course['file_path']; ?>" 
                                             alt="Preview" class="w-full h-32 object-cover rounded">
                                    <?php elseif ($fileType == 'video'): ?>
                                        <video class="w-full h-32 object-cover rounded" controls>
                                            <source src="../uploads/<?php echo $course['file_path']; ?>" type="video/mp4">
                                            Browser Anda tidak mendukung video.
                                        </video>
                                    <?php elseif ($fileType == 'audio'): ?>
                                        <audio class="w-full" controls>
                                            <source src="../uploads/<?php echo $course['file_path']; ?>" type="audio/mpeg">
                                            Browser Anda tidak mendukung audio.
                                        </audio>
                                    <?php else: ?>
                                        <div class="bg-gray-700 p-3 rounded text-center">
                                            <span class="text-blue-400">📄 <?php echo strtoupper(pathinfo($course['file_path'], PATHINFO_EXTENSION)); ?></span>
                                            <br>
                                            <a href="../uploads/<?php echo $course['file_path']; ?>" 
                                               target="_blank"
                                               class="text-blue-400 hover:text-blue-300 text-sm">
                                                Lihat File
                                            </a>
                                        </div>
                                    <?php endif; ?>
                                </div>
                            <?php endif; ?>

                            <div class="flex space-x-3">
                                <form method="POST" class="flex-1">
                                    <input type="hidden" name="course_id" value="<?php echo $course['id']; ?>">
                                    <input type="hidden" name="action" value="approve">
                                    <button type="submit" 
                                            class="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                                            onclick="return confirm('Setujui materi ini?')">
                                        ✅ Setujui
                                    </button>
                                </form>
                                
                                <form method="POST" class="flex-1">
                                    <input type="hidden" name="course_id" value="<?php echo $course['id']; ?>">
                                    <input type="hidden" name="action" value="reject">
                                    <button type="submit" 
                                            class="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                                            onclick="return confirm('Tolak dan hapus materi ini?')">
                                        ❌ Tolak
                                    </button>
                                </form>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>

            <!-- Back to Dashboard -->
            <div class="mt-8 text-center">
                <a href="dashboard.php" class="bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-lg inline-block">
                    ← Kembali ke Dashboard
                </a>
            </div>
        </div>
    </div>
</body>
</html> 