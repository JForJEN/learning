<?php
require_once '../functions.php';

$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $name = trim($_POST['name']);
    $email = trim($_POST['email']);
    $password = $_POST['password'];
    $confirm_password = $_POST['confirm_password'];
    $phone = trim($_POST['phone']);
    $address = trim($_POST['address']);

    // Validasi input
    if (empty($name) || empty($email) || empty($password) || empty($confirm_password)) {
        $error = 'Semua field wajib diisi!';
    } elseif ($password !== $confirm_password) {
        $error = 'Password tidak cocok!';
    } elseif (strlen($password) < 6) {
        $error = 'Password minimal 6 karakter!';
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = 'Format email tidak valid!';
    } else {
        try {
            // Cek apakah email sudah terdaftar
            $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
            $stmt->execute([$email]);
            
            if ($stmt->fetch()) {
                $error = 'Email sudah terdaftar!';
            } else {
                // Hash password
                $hashedPassword = hashPassword($password);
                
                // Insert user baru
                $stmt = $pdo->prepare("
                    INSERT INTO users (name, email, password, phone, address, is_admin, created_at) 
                    VALUES (?, ?, ?, ?, ?, 0, NOW())
                ");
                
                if ($stmt->execute([$name, $email, $hashedPassword, $phone, $address])) {
                    $success = 'Registrasi berhasil! Silakan login.';
                } else {
                    $error = 'Gagal mendaftar! Silakan coba lagi.';
                }
            }
        } catch (PDOException $e) {
            $error = 'Terjadi kesalahan sistem!';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Register - <?php echo SITE_NAME; ?></title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap" rel="stylesheet">
</head>
<body class="bg-gray-900 text-white font-['Inter'] min-h-screen py-8">
    <div class="container mx-auto px-4">
        <div class="max-w-2xl mx-auto">
            <div class="bg-gray-800 rounded-lg shadow-xl p-8">
                <div class="text-center mb-8">
                    <h1 class="text-3xl font-bold text-blue-400 mb-2"><?php echo SITE_NAME; ?></h1>
                    <p class="text-gray-400">Daftar akun baru</p>
                </div>

                <?php if ($error): ?>
                    <div class="bg-red-600 text-white p-3 rounded-lg mb-6">
                        <?php echo escape($error); ?>
                    </div>
                <?php endif; ?>

                <?php if ($success): ?>
                    <div class="bg-green-600 text-white p-3 rounded-lg mb-6">
                        <?php echo escape($success); ?>
                        <br>
                        <a href="login.php" class="underline">Klik di sini untuk login</a>
                    </div>
                <?php endif; ?>

                <form method="POST" class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label for="name" class="block text-sm font-medium text-gray-300 mb-2">
                                Nama Lengkap *
                            </label>
                            <input type="text" id="name" name="name" required
                                   class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                                   placeholder="Masukkan nama lengkap Anda"
                                   value="<?php echo isset($_POST['name']) ? escape($_POST['name']) : ''; ?>">
                        </div>

                        <div>
                            <label for="email" class="block text-sm font-medium text-gray-300 mb-2">
                                Email *
                            </label>
                            <input type="email" id="email" name="email" required
                                   class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                                   placeholder="Masukkan email Anda"
                                   value="<?php echo isset($_POST['email']) ? escape($_POST['email']) : ''; ?>">
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label for="password" class="block text-sm font-medium text-gray-300 mb-2">
                                Password *
                            </label>
                            <input type="password" id="password" name="password" required
                                   class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                                   placeholder="Minimal 6 karakter">
                        </div>

                        <div>
                            <label for="confirm_password" class="block text-sm font-medium text-gray-300 mb-2">
                                Konfirmasi Password *
                            </label>
                            <input type="password" id="confirm_password" name="confirm_password" required
                                   class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                                   placeholder="Ulangi password Anda">
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label for="phone" class="block text-sm font-medium text-gray-300 mb-2">
                                Nomor Telepon
                            </label>
                            <input type="tel" id="phone" name="phone"
                                   class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                                   placeholder="Contoh: 08123456789"
                                   value="<?php echo isset($_POST['phone']) ? escape($_POST['phone']) : ''; ?>">
                        </div>

                        <div>
                            <label for="address" class="block text-sm font-medium text-gray-300 mb-2">
                                Alamat
                            </label>
                            <textarea id="address" name="address" rows="3"
                                      class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                                      placeholder="Masukkan alamat Anda"><?php echo isset($_POST['address']) ? escape($_POST['address']) : ''; ?></textarea>
                        </div>
                    </div>

                    <div class="flex items-center">
                        <input type="checkbox" id="agree" name="agree" required class="mr-3">
                        <label for="agree" class="text-sm text-gray-300">
                            Saya setuju dengan <a href="#" class="text-blue-400 hover:text-blue-300">Syarat dan Ketentuan</a>
                        </label>
                    </div>

                    <button type="submit" 
                            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
                        Daftar Sekarang
                    </button>
                </form>

                <div class="mt-6 text-center">
                    <p class="text-gray-400">
                        Sudah punya akun? 
                        <a href="login.php" class="text-blue-400 hover:text-blue-300">Login di sini</a>
                    </p>
                </div>

                <div class="mt-6 text-center">
                    <a href="../index.php" class="text-gray-400 hover:text-white">
                        ← Kembali ke Beranda
                    </a>
                </div>
            </div>
        </div>
    </div>
</body>
</html> 