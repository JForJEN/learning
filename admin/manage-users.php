<?php
require_once '../functions.php';

// Cek apakah user adalah admin
requireAdmin();

$message = '';

// Handle delete user action
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['action']) && isset($_POST['user_id'])) {
    $userId = (int)$_POST['user_id'];
    $action = $_POST['action'];
    
    // Prevent admin from deleting themselves
    if ($userId == $_SESSION['user_id']) {
        $message = 'Anda tidak dapat menghapus akun sendiri!';
    } else {
        try {
            if ($action === 'delete') {
                $stmt = $pdo->prepare("DELETE FROM users WHERE id = ? AND is_admin = 0");
                $stmt->execute([$userId]);
                $message = 'User berhasil dihapus!';
            }
        } catch (PDOException $e) {
            $message = 'Terjadi kesalahan sistem!';
        }
    }
}

// Ambil semua users
$users = getAllUsers();
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kelola Users - <?php echo SITE_NAME; ?> Admin</title>
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
                <h2 class="text-3xl font-bold mb-2">Kelola Pengguna</h2>
                <p class="text-gray-400">Kelola semua pengguna sistem</p>
            </div>

            <?php if ($message): ?>
                <div class="bg-green-600 text-white p-4 rounded-lg mb-6">
                    <?php echo escape($message); ?>
                </div>
            <?php endif; ?>

            <!-- Statistics -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <?php
                $totalUsers = count($users);
                $adminUsers = array_filter($users, function($user) { return $user['is_admin'] == 1; });
                $regularUsers = array_filter($users, function($user) { return $user['is_admin'] == 0; });
                ?>
                
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
                            <p class="text-green-200 text-sm">Regular Users</p>
                            <p class="text-2xl font-bold"><?php echo count($regularUsers); ?></p>
                        </div>
                    </div>
                </div>

                <div class="bg-purple-600 rounded-lg p-6">
                    <div class="flex items-center">
                        <div class="p-3 bg-purple-500 rounded-full">
                            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <div class="ml-4">
                            <p class="text-purple-200 text-sm">Admin Users</p>
                            <p class="text-2xl font-bold"><?php echo count($adminUsers); ?></p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Users Table -->
            <div class="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-700">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    User
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Email
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Phone
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Role
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Joined
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-700">
                            <?php foreach ($users as $user): ?>
                                <tr class="hover:bg-gray-700">
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <div class="flex items-center">
                                            <div class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                                                <span class="text-white font-semibold">
                                                    <?php echo strtoupper(substr($user['name'], 0, 1)); ?>
                                                </span>
                                            </div>
                                            <div class="ml-4">
                                                <div class="text-sm font-medium text-white">
                                                    <?php echo escape($user['name']); ?>
                                                </div>
                                                <?php if ($user['address']): ?>
                                                    <div class="text-sm text-gray-400">
                                                        <?php echo escape(substr($user['address'], 0, 50)); ?>
                                                        <?php if (strlen($user['address']) > 50): ?>...<?php endif; ?>
                                                    </div>
                                                <?php endif; ?>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <div class="text-sm text-white"><?php echo escape($user['email']); ?></div>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <div class="text-sm text-gray-300">
                                            <?php echo $user['phone'] ? escape($user['phone']) : '-'; ?>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <?php if ($user['is_admin']): ?>
                                            <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-600 text-white">
                                                Admin
                                            </span>
                                        <?php else: ?>
                                            <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-600 text-white">
                                                User
                                            </span>
                                        <?php endif; ?>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                        <?php echo formatDate($user['created_at']); ?>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <?php if ($user['id'] != $_SESSION['user_id'] && !$user['is_admin']): ?>
                                            <form method="POST" class="inline">
                                                <input type="hidden" name="user_id" value="<?php echo $user['id']; ?>">
                                                <input type="hidden" name="action" value="delete">
                                                <button type="submit" 
                                                        class="text-red-400 hover:text-red-300"
                                                        onclick="return confirm('Hapus user <?php echo escape($user['name']); ?>?')">
                                                    Hapus
                                                </button>
                                            </form>
                                        <?php else: ?>
                                            <span class="text-gray-500">-</span>
                                        <?php endif; ?>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>

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