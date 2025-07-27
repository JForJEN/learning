<?php
require_once '../functions.php';

// Ambil ID course dari URL
$courseId = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if (!$courseId) {
    redirect('../index.php');
}

// Ambil detail course
$course = getCourseById($courseId);

if (!$course) {
    redirect('../index.php');
}

// Cek apakah course sudah diapprove (kecuali untuk admin)
if (!$course['is_approved'] && !isAdmin()) {
    redirect('../index.php');
}

// Handle komentar baru
$commentError = '';
$commentSuccess = '';

if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['comment'])) {
    if (!isLoggedIn()) {
        $commentError = 'Anda harus login untuk memberikan komentar!';
    } else {
        $comment = trim($_POST['comment']);
        
        if (empty($comment)) {
            $commentError = 'Komentar tidak boleh kosong!';
        } else {
            try {
                $stmt = $pdo->prepare("
                    INSERT INTO comments (course_id, user_id, content, created_at) 
                    VALUES (?, ?, ?, NOW())
                ");
                
                if ($stmt->execute([$courseId, $_SESSION['user_id'], $comment])) {
                    $commentSuccess = 'Komentar berhasil ditambahkan!';
                } else {
                    $commentError = 'Gagal menambahkan komentar!';
                }
            } catch (PDOException $e) {
                $commentError = 'Terjadi kesalahan sistem!';
            }
        }
    }
}

// Ambil komentar course
$comments = getCourseComments($courseId);
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo escape($course['title']); ?> - <?php echo SITE_NAME; ?></title>
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
                    <?php if (isLoggedIn()): ?>
                        <a href="submit-course.php" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg">Upload Materi</a>
                        <a href="profile.php" class="text-gray-300 hover:text-white">Profil</a>
                        <?php if (isAdmin()): ?>
                            <a href="../admin/dashboard.php" class="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg">Admin</a>
                        <?php endif; ?>
                        <a href="logout.php" class="text-gray-300 hover:text-white">Logout</a>
                    <?php else: ?>
                        <a href="login.php" class="text-gray-300 hover:text-white">Login</a>
                        <a href="register.php" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg">Daftar</a>
                    <?php endif; ?>
                </nav>
            </div>
        </div>
    </header>

    <div class="container mx-auto px-4 py-8">
        <div class="max-w-4xl mx-auto">
            <!-- Breadcrumb -->
            <div class="mb-6">
                <a href="../index.php" class="text-gray-400 hover:text-white">← Kembali ke Beranda</a>
            </div>

            <!-- Course Detail -->
            <div class="bg-gray-800 rounded-lg shadow-xl p-8 mb-8">
                <div class="mb-6">
                    <h1 class="text-3xl font-bold mb-4"><?php echo escape($course['title']); ?></h1>
                    <div class="flex items-center space-x-4 text-gray-400 mb-4">
                        <span>Oleh: <?php echo escape($course['author_name']); ?></span>
                        <span>•</span>
                        <span><?php echo formatDate($course['created_at']); ?></span>
                        <span>•</span>
                        <span class="bg-blue-600 px-2 py-1 rounded text-xs"><?php echo escape($course['category']); ?></span>
                    </div>
                    <p class="text-gray-300 leading-relaxed"><?php echo nl2br(escape($course['description'])); ?></p>
                </div>

                <!-- File Display -->
                <?php if ($course['file_path']): ?>
                    <div class="mb-6">
                        <h3 class="text-lg font-semibold mb-4">Materi:</h3>
                        <?php 
                        $fileType = getFileType($course['file_path']);
                        if ($fileType == 'image'): ?>
                            <img src="../uploads/<?php echo $course['file_path']; ?>" 
                                 alt="Materi" class="max-w-full h-auto rounded-lg">
                        <?php elseif ($fileType == 'video'): ?>
                            <video class="w-full rounded-lg" controls>
                                <source src="../uploads/<?php echo $course['file_path']; ?>" type="video/mp4">
                                Browser Anda tidak mendukung video.
                            </video>
                        <?php elseif ($fileType == 'audio'): ?>
                            <audio class="w-full" controls>
                                <source src="../uploads/<?php echo $course['file_path']; ?>" type="audio/mpeg">
                                Browser Anda tidak mendukung audio.
                            </audio>
                        <?php else: ?>
                            <div class="bg-gray-700 p-6 rounded-lg text-center">
                                <div class="text-4xl mb-4">📄</div>
                                <p class="text-lg mb-4"><?php echo strtoupper(pathinfo($course['file_path'], PATHINFO_EXTENSION)); ?> Document</p>
                                <a href="../uploads/<?php echo $course['file_path']; ?>" 
                                   download="<?php echo $course['title']; ?>.<?php echo pathinfo($course['file_path'], PATHINFO_EXTENSION); ?>"
                                   class="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg inline-block">
                                    Download File
                                </a>
                            </div>
                        <?php endif; ?>
                    </div>
                <?php endif; ?>

                <?php if (!$course['is_approved']): ?>
                    <div class="bg-yellow-600 text-white p-4 rounded-lg">
                        <p class="font-semibold">⚠️ Materi ini masih menunggu approval dari admin.</p>
                    </div>
                <?php endif; ?>
            </div>

            <!-- Comments Section -->
            <div class="bg-gray-800 rounded-lg shadow-xl p-8">
                <h2 class="text-2xl font-bold mb-6">Komentar (<?php echo count($comments); ?>)</h2>

                <?php if ($commentError): ?>
                    <div class="bg-red-600 text-white p-3 rounded-lg mb-6">
                        <?php echo escape($commentError); ?>
                    </div>
                <?php endif; ?>

                <?php if ($commentSuccess): ?>
                    <div class="bg-green-600 text-white p-3 rounded-lg mb-6">
                        <?php echo escape($commentSuccess); ?>
                    </div>
                <?php endif; ?>

                <!-- Add Comment Form -->
                <?php if (isLoggedIn()): ?>
                    <form method="POST" class="mb-8">
                        <div class="mb-4">
                            <label for="comment" class="block text-sm font-medium text-gray-300 mb-2">
                                Tambahkan Komentar
                            </label>
                            <textarea id="comment" name="comment" rows="4" required
                                      class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                                      placeholder="Tulis komentar Anda..."></textarea>
                        </div>
                        <button type="submit" 
                                class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg">
                            Kirim Komentar
                        </button>
                    </form>
                <?php else: ?>
                    <div class="bg-gray-700 p-4 rounded-lg mb-8 text-center">
                        <p class="text-gray-300 mb-2">Anda harus login untuk memberikan komentar</p>
                        <a href="login.php" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg inline-block">
                            Login Sekarang
                        </a>
                    </div>
                <?php endif; ?>

                <!-- Comments List -->
                <?php if (empty($comments)): ?>
                    <div class="text-center py-8">
                        <p class="text-gray-400">Belum ada komentar. Jadilah yang pertama berkomentar!</p>
                    </div>
                <?php else: ?>
                    <div class="space-y-6">
                        <?php foreach ($comments as $comment): ?>
                            <div class="border-b border-gray-700 pb-6 last:border-b-0">
                                <div class="flex items-start space-x-4">
                                    <div class="flex-shrink-0">
                                        <div class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                                            <span class="text-white font-semibold">
                                                <?php echo strtoupper(substr($comment['user_name'], 0, 1)); ?>
                                            </span>
                                        </div>
                                    </div>
                                    <div class="flex-1">
                                        <div class="flex items-center space-x-2 mb-2">
                                            <span class="font-semibold text-white"><?php echo escape($comment['user_name']); ?></span>
                                            <span class="text-gray-400 text-sm"><?php echo formatDate($comment['created_at']); ?></span>
                                        </div>
                                        <p class="text-gray-300"><?php echo nl2br(escape($comment['content'])); ?></p>
                                    </div>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>
            </div>
        </div>
    </div>
</body>
</html> 