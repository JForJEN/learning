<?php
require_once '../functions.php';

$error = '';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $email = trim($_POST['email']);
    $password = $_POST['password'];
    $isAdmin = isset($_POST['is_admin']) ? 1 : 0;

    if (empty($email) || empty($password)) {
        $error = 'Email dan password harus diisi!';
    } else {
        try {
            $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? AND is_admin = ?");
            $stmt->execute([$email, $isAdmin]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user && verifyPassword($password, $user['password'])) {
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['user_name'] = $user['name'];
                $_SESSION['user_email'] = $user['email'];
                $_SESSION['is_admin'] = $user['is_admin'];
                
                redirect('../index.php');
            } else {
                $error = 'Email atau password salah!';
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
    <title>Login - <?php echo SITE_NAME; ?></title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap" rel="stylesheet">
</head>
<body class="bg-gray-900 text-white font-['Inter'] min-h-screen flex items-center justify-center">
    <div class="w-full max-w-md">
        <div class="bg-gray-800 rounded-lg shadow-xl p-8">
            <div class="text-center mb-8">
                <h1 class="text-3xl font-bold text-blue-400 mb-2"><?php echo SITE_NAME; ?></h1>
                <p class="text-gray-400">Masuk ke akun Anda</p>
            </div>

            <?php if ($error): ?>
                <div class="bg-red-600 text-white p-3 rounded-lg mb-6">
                    <?php echo escape($error); ?>
                </div>
            <?php endif; ?>

            <form method="POST" class="space-y-6">
                <div>
                    <label for="email" class="block text-sm font-medium text-gray-300 mb-2">
                        Email
                    </label>
                    <input type="email" id="email" name="email" required
                           class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                           placeholder="Masukkan email Anda">
                </div>

                <div>
                    <label for="password" class="block text-sm font-medium text-gray-300 mb-2">
                        Password
                    </label>
                    <input type="password" id="password" name="password" required
                           class="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                           placeholder="Masukkan password Anda">
                </div>

                <div class="flex items-center">
                    <input type="checkbox" id="is_admin" name="is_admin" class="mr-3">
                    <label for="is_admin" class="text-sm text-gray-300">
                        Login sebagai Admin
                    </label>
                </div>

                <button type="submit" 
                        class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
                    Masuk
                </button>
            </form>

            <div class="mt-6 text-center">
                <p class="text-gray-400">
                    Belum punya akun? 
                    <a href="register.php" class="text-blue-400 hover:text-blue-300">Daftar di sini</a>
                </p>
            </div>

            <div class="mt-6 text-center">
                <a href="../index.php" class="text-gray-400 hover:text-white">
                    ← Kembali ke Beranda
                </a>
            </div>
        </div>
    </div>
</body>
</html> 