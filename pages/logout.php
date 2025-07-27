<?php
require_once '../functions.php';

// Hapus semua session
session_destroy();

// Redirect ke halaman utama
redirect('../index.php');
?> 