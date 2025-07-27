-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 26 Jul 2025 pada 21.06
-- Versi server: 10.4.32-MariaDB
-- Versi PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `stilllearning_db`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `comments`
--

CREATE TABLE `comments` (
  `id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `author_id` int(11) NOT NULL,
  `text` text NOT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `comments`
--

INSERT INTO `comments` (`id`, `course_id`, `author_id`, `text`, `parent_id`, `created_at`) VALUES
(2, 6, 10, 'aman', NULL, '2025-07-26 18:18:32'),
(3, 6, 10, 'haha', NULL, '2025-07-26 18:25:58'),
(4, 6, 11, 'kok ketawa', 3, '2025-07-26 18:31:42');

-- --------------------------------------------------------

--
-- Struktur dari tabel `courses`
--

CREATE TABLE `courses` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `content` text DEFAULT NULL,
  `contentType` enum('ARTICLE','VIDEO','AUDIO','IMAGE','PDF','WORD','PPT') NOT NULL,
  `thumbnailUrl` text DEFAULT NULL,
  `author_id` int(11) NOT NULL,
  `isPublished` tinyint(1) DEFAULT 0,
  `fileName` varchar(255) DEFAULT NULL,
  `fileSize` int(11) DEFAULT NULL,
  `fileType` varchar(100) DEFAULT NULL,
  `filePath` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `courses`
--

INSERT INTO `courses` (`id`, `title`, `description`, `content`, `contentType`, `thumbnailUrl`, `author_id`, `isPublished`, `fileName`, `fileSize`, `fileType`, `filePath`, `created_at`, `updated_at`) VALUES
(6, 'Lagu kebangsaan', 'lagu kebangsaan', '', 'AUDIO', 'https://picsum.photos/seed/course/600/400', 10, 1, 'LAGU INDONESIA RAYA TEXT DAN VOCAL ORIGINAL _ OFFICIAL.mp3', 4254868, 'audio/mpeg', '/uploads/file-1753553704877-603684476.mp3', '2025-07-26 18:15:04', '2025-07-26 18:15:20'),
(7, 'koding', 'koding', '', 'VIDEO', 'https://picsum.photos/seed/course/600/400', 10, 1, 'pendek.mp4', 2516438, 'video/mp4', '/uploads/file-1753554046460-44168602.mp4', '2025-07-26 18:20:46', '2025-07-26 18:21:14');

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('user','admin') DEFAULT 'user',
  `avatar` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `avatar`, `created_at`, `updated_at`) VALUES
(9, 'JEN', 'jendriSL@email.com', '$2b$10$SFCQxaHLxLNnxeLwxMIVZ.Qax.SsQTqZLfZvtv52NP4YhhDoYiEGy', 'admin', NULL, '2025-07-26 18:04:56', '2025-07-26 18:04:56'),
(10, 'aulia', 'aulia@email.com', '$2b$10$/j02WIiXQYFrv0e0kwtwCeBEvFwrEJ3O694RcrXfYLUCKu7sv/9KC', 'user', NULL, '2025-07-26 18:14:04', '2025-07-26 18:14:04'),
(11, 'kipas', 'kipas@email.com', '$2b$10$0stAspU5vgpre6EX0KRSle1Kro4v55lGhysTqyeD9nRBdfA9aj276', 'user', NULL, '2025-07-26 18:31:16', '2025-07-26 18:31:16');

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `comments`
--
ALTER TABLE `comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `course_id` (`course_id`),
  ADD KEY `author_id` (`author_id`),
  ADD KEY `parent_id` (`parent_id`);

--
-- Indeks untuk tabel `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `author_id` (`author_id`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `comments`
--
ALTER TABLE `comments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT untuk tabel `courses`
--
ALTER TABLE `courses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `comments`
--
ALTER TABLE `comments`
  ADD CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `comments_ibfk_3` FOREIGN KEY (`parent_id`) REFERENCES `comments` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `courses`
--
ALTER TABLE `courses`
  ADD CONSTRAINT `courses_ibfk_1` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
