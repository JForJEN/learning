<?php
require_once '../functions.php';

// Cek apakah user sudah login
requireLogin();

$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $title = trim($_POST['title']);
    $description = trim($_POST['description']);
    $category = trim($_POST['category']);
    $file = $_FILES['file'];

    // Validasi input
    if (empty($title) || empty($description) || empty($category)) {
        $error = 'Semua field wajib diisi!';
    } elseif (!isset($file['tmp_name']) || empty($file['tmp_name'])) {
        $error = 'File harus diupload!';
    } else {
        // Upload file
        $uploadedFile = uploadFile($file);
        
        if ($uploadedFile) {
            try {
                // Insert course ke database
                $stmt = $pdo->prepare("
                    INSERT INTO courses (title, description, category, file_path, user_id, is_approved, created_at) 
                    VALUES (?, ?, ?, ?, ?, 0, NOW())
                ");
                
                if ($stmt->execute([$title, $description, $category, $uploadedFile, $_SESSION['user_id']])) {
                    $success = 'Materi berhasil diupload! Menunggu approval dari admin.';
                } else {
                    $error = 'Gagal menyimpan materi! Silakan coba lagi.';
                }
            } catch (PDOException $e) {
                $error = 'Terjadi kesalahan sistem!';
            }
        } else {
            $error = 'Gagal upload file! Pastikan file valid dan ukuran tidak melebihi 50MB.';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Upload Materi - <?php echo SITE_NAME; ?></title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap" rel="stylesheet">
</head>
<body class="bg-gray-900 text-white font-['Inter'] min-h-screen py-8">
    <div class="container mx-auto px-4">
        <div class="max-w-4xl mx-auto">
            <!-- Header -->
            <div class="flex justify-between items-center mb-8">
                <div>
                    <h1 class="text-3xl font-bold text-blue-400">Upload Materi</h1>
                    <p class="text-gray-400">Bagikan pengetahuan Anda dengan komunitas</p>
                </div>
                <a href="../index.php" class="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg">
                    ← Kembali
                </a>
            </div>

            <?php if ($error): ?>
                <div class="bg-red-600 text-white p-4 rounded-lg mb-6">
                    <?php echo escape($error); ?>
                </div>
            <?php endif; ?>

            <?php if ($success): ?>
                <div class="bg-green-600 text-white p-4 rounded-lg mb-6">
                    <?php echo escape($success); ?>
                    <br>
                    <a href="../index.php" class="underline">Kembali ke Beranda</a>
                </div>
            <?php endif; ?>

            <div class="bg-gray-800 rounded-lg shadow-xl p-8">
                <form method="POST" enctype="multipart/form-data" class="space-y-6">
                    <div>
                        <label for="title" class="block text-sm font-medium text-gray-300 mb-2">
                            Judul Materi *
                        </label>
                        <input type="text" id="title" name="title" required
                               class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                               placeholder="Masukkan judul materi"
                               value="<?php echo isset($_POST['title']) ? escape($_POST['title']) : ''; ?>">
                    </div>

                    <div>
                        <label for="category" class="block text-sm font-medium text-gray-300 mb-2">
                            Kategori *
                        </label>
                        <select id="category" name="category" required
                                class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white">
                            <option value="">Pilih kategori</option>
                            <option value="Teknologi" <?php echo (isset($_POST['category']) && $_POST['category'] == 'Teknologi') ? 'selected' : ''; ?>>Teknologi</option>
                            <option value="Pendidikan" <?php echo (isset($_POST['category']) && $_POST['category'] == 'Pendidikan') ? 'selected' : ''; ?>>Pendidikan</option>
                            <option value="Bisnis" <?php echo (isset($_POST['category']) && $_POST['category'] == 'Bisnis') ? 'selected' : ''; ?>>Bisnis</option>
                            <option value="Kesehatan" <?php echo (isset($_POST['category']) && $_POST['category'] == 'Kesehatan') ? 'selected' : ''; ?>>Kesehatan</option>
                            <option value="Seni" <?php echo (isset($_POST['category']) && $_POST['category'] == 'Seni') ? 'selected' : ''; ?>>Seni</option>
                            <option value="Olahraga" <?php echo (isset($_POST['category']) && $_POST['category'] == 'Olahraga') ? 'selected' : ''; ?>>Olahraga</option>
                            <option value="Lainnya" <?php echo (isset($_POST['category']) && $_POST['category'] == 'Lainnya') ? 'selected' : ''; ?>>Lainnya</option>
                        </select>
                    </div>

                    <div>
                        <label for="description" class="block text-sm font-medium text-gray-300 mb-2">
                            Deskripsi Materi *
                        </label>
                        <textarea id="description" name="description" rows="6" required
                                  class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                                  placeholder="Jelaskan isi materi Anda secara detail..."><?php echo isset($_POST['description']) ? escape($_POST['description']) : ''; ?></textarea>
                    </div>

                    <div>
                        <label for="file" class="block text-sm font-medium text-gray-300 mb-2">
                            File Materi *
                        </label>
                        <input type="file" id="file" name="file" required
                               class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                               accept=".jpg,.jpeg,.png,.gif,.pdf,.mp4,.mp3,.doc,.docx,.ppt,.pptx">
                        <p class="text-sm text-gray-400 mt-2">
                            Format yang didukung: JPG, PNG, GIF, PDF, MP4, MP3, DOC, DOCX, PPT, PPTX<br>
                            Maksimal ukuran: 50MB
                        </p>
                    </div>

                    <div class="bg-blue-900 p-4 rounded-lg">
                        <h3 class="font-semibold text-blue-300 mb-2">📋 Panduan Upload:</h3>
                        <ul class="text-sm text-blue-200 space-y-1">
                            <li>• Pastikan materi original dan tidak melanggar hak cipta</li>
                            <li>• Berikan deskripsi yang jelas dan informatif</li>
                            <li>• Pilih kategori yang sesuai dengan materi</li>
                            <li>• Materi akan direview oleh admin sebelum dipublikasikan</li>
                        </ul>
                    </div>

                    <button type="submit" 
                            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
                        Upload Materi
                    </button>
                </form>
            </div>
        </div>
    </div>
</body>
</html> 