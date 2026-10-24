-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Waktu pembuatan: 22 Okt 2026 pada 12.12
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
-- Database: `gp_asset_management`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `aksesoris`
--

CREATE TABLE `aksesoris` (
  `id` int(11) NOT NULL,
  `kode_aksesoris` varchar(50) NOT NULL,
  `nama_aksesoris` varchar(255) NOT NULL,
  `kategori` varchar(100) DEFAULT NULL,
  `merek` varchar(100) DEFAULT NULL,
  `model` varchar(100) DEFAULT NULL,
  `jumlah_unit` int(11) DEFAULT NULL,
  `jumlah_total` int(11) DEFAULT NULL,
  `harga_aset` bigint(20) DEFAULT NULL,
  `tipe_harga` enum('Per Unit','Per Paket') NOT NULL DEFAULT 'Per Unit',
  `tanggal_pembelian` date DEFAULT NULL,
  `kondisi` enum('Siap Digunakan','Rusak','Rusak Berat','Maintenance','Dijual') DEFAULT 'Siap Digunakan',
  `lokasi` varchar(255) DEFAULT NULL,
  `jenis_aset` enum('Galeria Studio','Galeria Production') DEFAULT NULL,
  `gambar` varchar(500) DEFAULT NULL,
  `keterangan` text DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `aksesoris_units`
--

CREATE TABLE `aksesoris_units` (
  `id` int(11) NOT NULL,
  `aksesoris_id` int(11) NOT NULL,
  `kode_unit` varchar(60) NOT NULL,
  `nama_unit` varchar(255) DEFAULT NULL,
  `no_sn` varchar(100) DEFAULT NULL,
  `kondisi` enum('Siap Digunakan','Rusak','Rusak Berat','Maintenance','Dijual') DEFAULT 'Siap Digunakan',
  `status_pinjam` enum('Tersedia','Dipinjam') DEFAULT 'Tersedia',
  `lokasi_unit` varchar(255) DEFAULT NULL,
  `keterangan` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `assets`
--

CREATE TABLE `assets` (
  `id` int(11) NOT NULL,
  `kode_aset` varchar(50) NOT NULL,
  `nama_aset` varchar(255) NOT NULL,
  `pengguna` varchar(150) DEFAULT NULL,
  `kategori` varchar(100) DEFAULT NULL,
  `merek` varchar(100) DEFAULT NULL,
  `model` varchar(100) DEFAULT NULL,
  `no_sn` varchar(100) DEFAULT NULL,
  `spesifikasi` text DEFAULT NULL,
  `lokasi_aset` varchar(255) DEFAULT NULL,
  `jenis_aset` enum('Galeria Studio','Galeria Production') DEFAULT NULL,
  `kondisi` enum('Siap Digunakan','Rusak','Rusak Berat','Maintenance','Dijual') DEFAULT 'Siap Digunakan',
  `unit` varchar(100) DEFAULT NULL,
  `gambar` varchar(255) DEFAULT NULL,
  `keterangan` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `jumlah` int(11) DEFAULT NULL,
  `harga_aset` decimal(15,2) DEFAULT NULL,
  `tipe_harga` enum('Per Unit','Per Paket') NOT NULL DEFAULT 'Per Unit',
  `jumlah_total` int(11) DEFAULT NULL,
  `tanggal_pembelian` date DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `asset_units`
--

CREATE TABLE `asset_units` (
  `id` int(11) NOT NULL,
  `asset_id` int(11) NOT NULL,
  `kode_unit` varchar(60) NOT NULL,
  `nama_unit` varchar(255) DEFAULT NULL,
  `no_sn` varchar(100) DEFAULT NULL,
  `kondisi` enum('Siap Digunakan','Rusak','Rusak Berat','Maintenance','Dijual') DEFAULT 'Siap Digunakan',
  `status_pinjam` enum('Tersedia','Dipinjam') DEFAULT 'Tersedia',
  `lokasi_unit` varchar(255) DEFAULT NULL,
  `keterangan` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `user_name` varchar(100) DEFAULT NULL,
  `action` varchar(50) NOT NULL,
  `entity_type` varchar(50) NOT NULL,
  `entity_id` varchar(100) DEFAULT NULL,
  `details` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `user_id`, `user_name`, `action`, `entity_type`, `entity_id`, `details`, `created_at`) VALUES
(1, 2, 'Admin', 'CREATE', 'Aset', NULL, 'Menambahkan aset: Sony A7C (GKM-CAM-001)', '2026-06-12 06:25:26'),
(2, 1, 'super admin', 'CREATE', 'Aksesoris', NULL, 'Menambahkan aksesoris: Baterai Kamera NP-FZ100 (GKM-BAT-001)', '2026-06-12 06:27:25'),
(3, 4, 'User', 'CREATE', 'Peminjaman', NULL, 'Membuat peminjaman baru (GKM-PJM-1) untuk Cahyo', '2026-06-12 06:28:55'),
(4, 3, 'Supervisor', 'UPDATE', 'Peminjaman', '1', 'Melakukan approve/verifikasi peminjaman: GKM-PJM-1', '2026-06-12 06:29:27'),
(5, 4, 'User', 'UPDATE', 'Peminjaman', '1', 'Memperbarui peminjaman: GKM-PJM-1', '2026-06-12 06:30:52'),
(6, 3, 'Supervisor', 'UPDATE', 'Peminjaman', '1', 'Melakukan approve/verifikasi peminjaman: GKM-PJM-1', '2026-06-12 06:31:39'),
(7, 4, 'User', 'CREATE', 'Peminjaman', NULL, 'Membuat peminjaman baru (GKM-PJM-2) untuk Cahyo', '2026-06-12 07:50:15'),
(8, 6, 'Muhammad Hoirul Fanani', 'CREATE', 'Aset', NULL, 'Menambahkan aset: Video Processor Colorlight X4m (GKM-VPROC-001)', '2026-06-22 02:34:55'),
(9, 6, 'Muhammad Hoirul Fanani', 'UPDATE', 'Aset', '2', 'Memperbarui aset: Video Processor Colorlight X4m (GKM-VPROC-001)', '2026-06-22 02:36:22'),
(10, 6, 'Muhammad Hoirul Fanani', 'CREATE', 'Aksesoris', NULL, 'Menambahkan aksesoris: Orbit (GKM-ORBIT-001)', '2026-06-22 07:14:20'),
(11, 6, 'Muhammad Hoirul Fanani', 'UPDATE', 'Aksesoris', '2', 'Memperbarui aksesoris: Orbit (GKM-ORBIT-001)', '2026-06-22 07:14:47'),
(12, 6, 'Muhammad Hoirul Fanani', 'CREATE', 'Aksesoris', NULL, 'Menambahkan aksesoris: Matador  (GKM-STAND TV -001)', '2026-06-22 07:23:06'),
(13, 6, 'Muhammad Hoirul Fanani', 'UPDATE', 'Aksesoris', '3', 'Memperbarui aksesoris: Matador  (GKM-STAND TV -001)', '2026-06-22 07:25:15'),
(14, 6, 'Muhammad Hoirul Fanani', 'UPDATE', 'Aksesoris', '3', 'Memperbarui aksesoris: Matador  (GKM-STAND TV -001)', '2026-06-22 07:25:29'),
(15, 6, 'Muhammad Hoirul Fanani', 'CREATE', 'Aksesoris', NULL, 'Menambahkan aksesoris: Stand Tv Warna putih  (GKM-STAND TV P-001)', '2026-06-22 07:28:45'),
(16, 6, 'Muhammad Hoirul Fanani', 'DELETE', 'Aksesoris', '2', 'Menghapus aksesoris: Orbit (GKM-ORBIT-001)', '2026-06-22 07:29:53'),
(17, 6, 'Muhammad Hoirul Fanani', 'CREATE', 'Aset', NULL, 'Menambahkan aset: Orbit Besar  (GKM-UMUM-001)', '2026-06-22 07:36:11'),
(18, 6, 'Muhammad Hoirul Fanani', 'CREATE', 'Aset', NULL, 'Menambahkan aset: Zoom Recorder Besar  (GKM-ZOOM-001)', '2026-06-22 08:14:33'),
(19, 6, 'Muhammad Hoirul Fanani', 'UPDATE', 'Aset', '4', 'Memperbarui aset: Zoom Recorder Besar  (GKM-ZOOM-001)', '2026-06-22 08:15:43'),
(20, 6, 'Muhammad Hoirul Fanani', 'CREATE', 'Aset', NULL, 'Menambahkan aset: Zoom Recoder kecil 01 (GKM-ZOOM-002)', '2026-06-22 08:29:02'),
(21, 6, 'Muhammad Hoirul Fanani', 'UPDATE', 'Aset', '5', 'Memperbarui aset: Zoom Recoder kecil 01 (GKM-ZOOM-002)', '2026-06-22 08:29:43'),
(22, 6, 'Muhammad Hoirul Fanani', 'CREATE', 'Aset', NULL, 'Menambahkan aset: Zoom Recorder kecil 02 (GKM-RECORDER-001)', '2026-06-22 08:34:54'),
(23, 6, 'Muhammad Hoirul Fanani', 'UPDATE', 'Aset', '6', 'Memperbarui aset: Zoom Recorder kecil 02 (GKM-RECORDER-001)', '2026-06-22 08:35:32'),
(24, 6, 'Muhammad Hoirul Fanani', 'CREATE', 'Aset', NULL, 'Menambahkan aset: Zoom Recoder 03 (GKM-RECORDER-002)', '2026-06-22 08:40:34'),
(25, 6, 'Muhammad Hoirul Fanani', 'UPDATE', 'Aset', '7', 'Memperbarui aset: Zoom Recoder 03 (GKM-RECORDER-002)', '2026-06-22 08:42:52'),
(26, 6, 'Muhammad Hoirul Fanani', 'CREATE', 'Aset', NULL, 'Menambahkan aset: Orbit kecil  (GKM-ORBIT -001)', '2026-06-22 08:54:10'),
(27, 6, 'Muhammad Hoirul Fanani', 'UPDATE', 'Aset', '8', 'Memperbarui aset: Orbit kecil  (GKM-ORBIT -001)', '2026-06-22 08:55:07'),
(28, 6, 'Muhammad Hoirul Fanani', 'UPDATE', 'Aset', '3', 'Memperbarui aset: Orbit Besar  (GKM-UMUM-001)', '2026-06-22 08:55:29'),
(29, 6, 'Muhammad Hoirul Fanani', 'UPDATE', 'Aset', '8', 'Memperbarui aset: Orbit kecil  (GKM-ORBIT -001)', '2026-06-22 08:55:41'),
(30, 6, 'Muhammad Hoirul Fanani', 'UPDATE', 'Aset', '8', 'Memperbarui aset: Orbit kecil  (GKM-ORBIT -001)', '2026-06-22 08:59:51'),
(31, 6, 'Muhammad Hoirul Fanani', 'CREATE', 'Aset', NULL, 'Menambahkan aset: Video Switcher  (GKM-VIDEO SWIT-001)', '2026-06-22 09:05:13'),
(32, 6, 'Muhammad Hoirul Fanani', 'UPDATE', 'Aset', '5', 'Memperbarui aset: Zoom Recoder kecil 01 (GKM-ZOOM-002)', '2026-06-23 03:43:18'),
(33, 1, 'super admin', 'DELETE', 'Aksesoris', '1', 'Menghapus aksesoris: Baterai Kamera NP-FZ100 (GKM-BAT-001)', '2026-06-23 05:58:23'),
(34, 1, 'super admin', 'UPDATE', 'Peminjaman', '2', 'Melakukan approve/verifikasi peminjaman: GKM-PJM-2', '2026-06-23 06:03:41'),
(35, 1, 'super admin', 'DELETE', 'Peminjaman', '2', 'Menghapus peminjaman: GKM-PJM-2', '2026-06-23 06:05:10'),
(36, 1, 'super admin', 'DELETE', 'Aset', '1', 'Menghapus aset: Sony A7C (GKM-CAM-001)', '2026-06-23 08:31:29'),
(37, 8, 'Mochammad Muhsin', 'UPDATE', 'Aset', '9', 'Memperbarui aset: Video Switcher  (GKM-VIDEO SWIT-001)', '2026-06-29 01:44:58'),
(38, 8, 'Mochammad Muhsin', 'CREATE', 'Aset', NULL, 'Menambahkan aset: Printer Narsis Booth (GKM-PRINT-001)', '2026-06-29 02:17:49'),
(39, 6, 'Muhammad Hoirul Fanani', 'CREATE', 'Aksesoris', NULL, 'Menambahkan aksesoris: Kabel Ganset (GKM-KABEL-001)', '2026-06-29 07:10:50'),
(40, 6, 'Muhammad Hoirul Fanani', 'CREATE', 'Aset', NULL, 'Menambahkan aset: Audio Interface (GKM-AUDIO INTE-001)', '2026-06-29 07:15:55'),
(41, 6, 'Muhammad Hoirul Fanani', 'CREATE', 'Aksesoris', NULL, 'Menambahkan aksesoris: Hdmi To Hdmi (GKM-KABEL HDMI-001)', '2026-06-29 07:20:03'),
(42, 6, 'Muhammad Hoirul Fanani', 'UPDATE', 'Aksesoris', '6', 'Memperbarui aksesoris: Kabel Hdmi (GKM-KABEL HDMI-001)', '2026-06-29 07:21:02'),
(43, 6, 'Muhammad Hoirul Fanani', 'CREATE', 'Aksesoris', NULL, 'Menambahkan aksesoris: Kabel Hdmi (GKM-KABEL HDMI-002)', '2026-06-29 07:23:25'),
(44, 6, 'Muhammad Hoirul Fanani', 'UPDATE', 'Aksesoris', '6', 'Memperbarui aksesoris: Kabel Hdmi (GKM-KABEL HDMI-001)', '2026-06-29 07:23:49'),
(45, 6, 'Muhammad Hoirul Fanani', 'CREATE', 'Aksesoris', NULL, 'Menambahkan aksesoris: Kabel Hdmi  (GKM-KABEL HDMI-003)', '2026-06-29 07:26:26'),
(46, 6, 'Muhammad Hoirul Fanani', 'CREATE', 'Aksesoris', NULL, 'Menambahkan aksesoris: Kabel usb (GKM-U-001)', '2026-06-29 07:28:29'),
(47, 6, 'Muhammad Hoirul Fanani', 'CREATE', 'Aksesoris', NULL, 'Menambahkan aksesoris: Kabel usb  (GKM-U-002)', '2026-06-29 07:30:07'),
(48, 8, 'Mochammad Muhsin', 'UPDATE', 'Aksesoris', '5', 'Memperbarui aksesoris: Kabel Genset (GKM-KABEL-001)', '2026-06-29 10:26:31'),
(49, 8, 'Mochammad Muhsin', 'UPDATE', 'Aksesoris', '4', 'Memperbarui aksesoris: Stand Tv Warna putih  (GKM-STAND TV P-001)', '2026-06-29 10:26:56'),
(50, 6, 'Muhammad Hoirul Fanani', 'UPDATE', 'Aksesoris', '9', 'Memperbarui aksesoris: Kabel Usb B To Usb A (GKM-U-001)', '2026-07-01 07:50:36'),
(51, 6, 'Muhammad Hoirul Fanani', 'UPDATE', 'Aksesoris', '8', 'Memperbarui aksesoris: Kabel Hdmi  2M  (GKM-KABEL HDMI-003)', '2026-07-01 07:52:23'),
(52, 6, 'Muhammad Hoirul Fanani', 'UPDATE', 'Aksesoris', '7', 'Memperbarui aksesoris: Kabel Hdmi 1,5 M  (GKM-KABEL HDMI-002)', '2026-07-01 07:52:43'),
(53, 6, 'Muhammad Hoirul Fanani', 'UPDATE', 'Aksesoris', '8', 'Memperbarui aksesoris: Kabel Hdmi  2 M  (GKM-KABEL HDMI-003)', '2026-07-01 07:52:52'),
(54, 6, 'Muhammad Hoirul Fanani', 'UPDATE', 'Aksesoris', '6', 'Memperbarui aksesoris: Kabel Hdmi 1 M (GKM-KABEL HDMI-001)', '2026-07-01 07:53:02'),
(55, 6, 'Muhammad Hoirul Fanani', 'CREATE', 'Aksesoris', NULL, 'Menambahkan aksesoris: Tripod Flash Takara  (GKM-STAND -001)', '2026-07-01 07:57:45'),
(56, 6, 'Muhammad Hoirul Fanani', 'CREATE', 'Aksesoris', NULL, 'Menambahkan aksesoris: Stand NX200 Kuning Benro (GKM-STND-001)', '2026-07-01 08:04:48'),
(57, 6, 'Muhammad Hoirul Fanani', 'CREATE', 'Aksesoris', NULL, 'Menambahkan aksesoris: STAND FLASH No Brand (GKM-STAND -002)', '2026-07-01 08:17:07'),
(58, 6, 'Muhammad Hoirul Fanani', 'CREATE', 'Aksesoris', NULL, 'Menambahkan aksesoris: Lensa Zeis 35 F1,4  (GKM-LENSA-001)', '2026-07-01 08:26:16'),
(59, 6, 'Muhammad Hoirul Fanani', 'CREATE', 'Aksesoris', NULL, 'Menambahkan aksesoris: Lensa Samyang 35 F1,8 (GKM-LENSA-002)', '2026-07-01 08:28:07'),
(60, 6, 'Muhammad Hoirul Fanani', 'CREATE', 'Aksesoris', NULL, 'Menambahkan aksesoris: Lensa Sony 85 F 1.8 (GKM-LENSA-003)', '2026-07-01 12:41:29'),
(61, 6, 'Muhammad Hoirul Fanani', 'CREATE', 'Aksesoris', NULL, 'Menambahkan aksesoris: Lensa 18 F 2.8 (GKM-LENSA-004)', '2026-07-01 12:43:13'),
(62, 6, 'Muhammad Hoirul Fanani', 'CREATE', 'Aksesoris', NULL, 'Menambahkan aksesoris: Lensa Samyang V-AF 35 F 1.9 (GKM-LENSA-005)', '2026-07-01 12:45:31'),
(63, 6, 'Muhammad Hoirul Fanani', 'CREATE', 'Aksesoris', NULL, 'Menambahkan aksesoris: Lensa Sony 35 F 1.8 (GKM-LENSA-006)', '2026-07-01 12:47:45'),
(64, 6, 'Muhammad Hoirul Fanani', 'CREATE', 'Aksesoris', NULL, 'Menambahkan aksesoris: Lensa Samyang 75 F 1.8   (GKM-LENSA-007)', '2026-07-01 12:51:23'),
(65, 6, 'Muhammad Hoirul Fanani', 'CREATE', 'Aksesoris', NULL, 'Menambahkan aksesoris: Lensa Zeis 25 F 2 (GKM-LENSA-008)', '2026-07-01 12:53:51'),
(66, 6, 'Muhammad Hoirul Fanani', 'CREATE', 'Aksesoris', NULL, 'Menambahkan aksesoris: Lensa Fish eye 7,5 F2.8 (GKM-LENSA-009)', '2026-07-01 12:56:35'),
(67, 8, 'Mochammad Muhsin', 'CREATE', 'Aksesoris', NULL, 'Menambahkan aksesoris: hardcase parled (GKM-HRC-001)', '2026-07-02 01:58:04'),
(68, 8, 'Mochammad Muhsin', 'CREATE', 'Aksesoris', NULL, 'Menambahkan aksesoris: Hardcase Sound (GKM-HRC-002)', '2026-07-02 01:59:33'),
(69, 8, 'Mochammad Muhsin', 'CREATE', 'Aksesoris', NULL, 'Menambahkan aksesoris: Hardcase followspot (GKM-HRC-003)', '2026-07-02 02:02:34'),
(70, 8, 'Mochammad Muhsin', 'UPDATE', 'Aksesoris', '25', 'Memperbarui aksesoris: Hardcase followspot (GKM-HRC-003)', '2026-07-02 02:05:08'),
(71, 8, 'Mochammad Muhsin', 'CREATE', 'Aksesoris', NULL, 'Menambahkan aksesoris: harcase parled (GKM-HRC-004)', '2026-07-02 02:05:36'),
(72, 8, 'Mochammad Muhsin', 'CREATE', 'Aksesoris', NULL, 'Menambahkan aksesoris: hardcase tv 43\" (GKM-HRC-005)', '2026-07-02 02:09:03'),
(73, 8, 'Mochammad Muhsin', 'CREATE', 'Aksesoris', NULL, 'Menambahkan aksesoris: hardcase beam (GKM-HRC-006)', '2026-07-02 02:12:01'),
(74, 8, 'Mochammad Muhsin', 'CREATE', 'Aksesoris', NULL, 'Menambahkan aksesoris: hardcase tv 50\" (GKM-HRC-007)', '2026-07-02 02:12:55'),
(75, 8, 'Mochammad Muhsin', 'CREATE', 'Aksesoris', NULL, 'Menambahkan aksesoris: hardcase stop kontak (GKM-HRC-008)', '2026-07-02 02:15:10'),
(76, 8, 'Mochammad Muhsin', 'CREATE', 'Aksesoris', NULL, 'Menambahkan aksesoris: hardcase stop kontak (GKM-HRC-009)', '2026-07-02 02:15:21'),
(77, 8, 'Mochammad Muhsin', 'CREATE', 'Aksesoris', NULL, 'Menambahkan aksesoris: hardcase stop kontak (GKM-HRC-010)', '2026-07-02 02:15:36'),
(78, 8, 'Mochammad Muhsin', 'CREATE', 'Aksesoris', NULL, 'Menambahkan aksesoris: hardcase tv 65\" (GKM-HRC-011)', '2026-07-02 02:18:56'),
(79, 7, 'Mohamad Mahmudi', 'CREATE', 'Aksesoris', NULL, 'Menambahkan aksesoris: SD CARD - 06 - MM (GKM-C-64-001)', '2026-07-02 07:25:49'),
(80, 7, 'Mohamad Mahmudi', 'CREATE', 'Aksesoris', NULL, 'Menambahkan aksesoris: SD CARD - 07 - DYS (GKM-C-64-002)', '2026-07-02 07:45:21'),
(81, 7, 'Mohamad Mahmudi', 'CREATE', 'Aksesoris', NULL, 'Menambahkan aksesoris: SD CARD - 05 - AGF (GKM-C-64-003)', '2026-07-02 07:47:53'),
(82, 7, 'Mohamad Mahmudi', 'CREATE', 'Aksesoris', NULL, 'Menambahkan aksesoris: SD CARD - 10  (GKM-C-32-001)', '2026-07-02 07:53:04'),
(83, 7, 'Mohamad Mahmudi', 'CREATE', 'Aksesoris', NULL, 'Menambahkan aksesoris: SD CARD - 11  (GKM-C-32-002)', '2026-07-02 07:59:50'),
(84, 7, 'Mohamad Mahmudi', 'CREATE', 'Aksesoris', NULL, 'Menambahkan aksesoris: SD CARD - 12 (GKM-C-32-003)', '2026-07-02 08:01:39'),
(85, 7, 'Mohamad Mahmudi', 'CREATE', 'Aksesoris', NULL, 'Menambahkan aksesoris: SD CARD - 13  (GKM-C-32-004)', '2026-07-02 08:03:17'),
(86, 7, 'Mohamad Mahmudi', 'CREATE', 'Aksesoris', NULL, 'Menambahkan aksesoris: SD CARD - 14 (GKM-C-32-005)', '2026-07-02 08:05:14'),
(87, 7, 'Mohamad Mahmudi', 'CREATE', 'Aksesoris', NULL, 'Menambahkan aksesoris: SD CARD - 16 (GKM-C-64-004)', '2026-07-03 08:14:18'),
(88, 8, 'Mochammad Muhsin', 'UPDATE', 'Aksesoris', '25', 'Memperbarui aksesoris: Hardcase Fllowspot (GKM-HRC-003)', '2026-07-04 01:54:22'),
(89, 8, 'Mochammad Muhsin', 'UPDATE', 'Aksesoris', '33', 'Memperbarui aksesoris: hardcase tv 65\" (GKM-HRC-011)', '2026-07-04 01:56:16'),
(90, 8, 'Mochammad Muhsin', 'UPDATE', 'Aksesoris', '29', 'Memperbarui aksesoris: hardcase tv 50\" (GKM-HRC-007)', '2026-07-04 01:56:47'),
(91, 8, 'Mochammad Muhsin', 'UPDATE', 'Aksesoris', '27', 'Memperbarui aksesoris: hardcase tv 43\" (GKM-HRC-005)', '2026-07-04 01:57:01'),
(92, 8, 'Mochammad Muhsin', 'UPDATE', 'Aksesoris', '25', 'Memperbarui aksesoris: Hardcase Followspot (GKM-HRC-003)', '2026-07-04 01:57:15'),
(93, 8, 'Mochammad Muhsin', 'UPDATE', 'Aksesoris', '32', 'Memperbarui aksesoris: hardcase stop kontak (GKM-HRC-010)', '2026-07-04 01:57:58'),
(94, 8, 'Mochammad Muhsin', 'UPDATE', 'Aksesoris', '33', 'Memperbarui aksesoris: HARDCASE TV 65\" (GKM-HRC-011)', '2026-07-04 01:58:44'),
(95, 8, 'Mochammad Muhsin', 'UPDATE', 'Aksesoris', '30', 'Memperbarui aksesoris: HARDCASE STOP KONTAK (GKM-HRC-008)', '2026-07-04 01:59:10'),
(96, 8, 'Mochammad Muhsin', 'UPDATE', 'Aksesoris', '29', 'Memperbarui aksesoris: HARDCASE TV 50\" (GKM-HRC-007)', '2026-07-04 01:59:41'),
(97, 8, 'Mochammad Muhsin', 'UPDATE', 'Aksesoris', '28', 'Memperbarui aksesoris: HARDCASE BEAM (GKM-HRC-006)', '2026-07-04 01:59:55'),
(98, 8, 'Mochammad Muhsin', 'UPDATE', 'Aksesoris', '27', 'Memperbarui aksesoris: HARDCASE TV 43\" (GKM-HRC-005)', '2026-07-04 02:00:18'),
(99, 8, 'Mochammad Muhsin', 'UPDATE', 'Aksesoris', '26', 'Memperbarui aksesoris: HARDCASE PARLED (GKM-HRC-004)', '2026-07-04 02:00:36'),
(100, 8, 'Mochammad Muhsin', 'UPDATE', 'Aksesoris', '25', 'Memperbarui aksesoris: HARDCASE FOLLOWSPOT (GKM-HRC-003)', '2026-07-04 02:00:54'),
(101, 8, 'Mochammad Muhsin', 'UPDATE', 'Aksesoris', '24', 'Memperbarui aksesoris: HARDCASE SOUND HUPER (GKM-HRC-002)', '2026-07-04 02:04:09'),
(102, 8, 'Mochammad Muhsin', 'UPDATE', 'Aksesoris', '24', 'Memperbarui aksesoris: HARDCASE SOUND HUPER (GKM-HRC-002)', '2026-07-04 02:04:45'),
(103, 8, 'Mochammad Muhsin', 'CREATE', 'Aksesoris', NULL, 'Menambahkan aksesoris: STAND TRIPOD LIGHTING (GKM-STN-001)', '2026-07-04 02:37:05'),
(104, 8, 'Mochammad Muhsin', 'CREATE', 'Aset', NULL, 'Menambahkan aset: KABEL SNAKE 16 CHANNEL (GKM-KSN-001)', '2026-07-04 02:43:51'),
(105, 8, 'Mochammad Muhsin', 'CREATE', 'Aksesoris', NULL, 'Menambahkan aksesoris: KABEL LAN 100M (GKM-KBL-001)', '2026-07-04 04:14:52'),
(106, 8, 'Mochammad Muhsin', 'UPDATE', 'Aksesoris', '44', 'Memperbarui aksesoris: KABEL LAN 100M (GKM-KBL-001)', '2026-07-04 04:15:58'),
(107, 8, 'Mochammad Muhsin', 'UPDATE', 'Aksesoris', '44', 'Memperbarui aksesoris: KABEL LAN 100M (GKM-KBL-001)', '2026-07-04 04:17:05'),
(108, 8, 'Mochammad Muhsin', 'CREATE', 'Aksesoris', NULL, 'Menambahkan aksesoris: KABEL LAN 50 (GKM-KBL-002)', '2026-07-04 04:29:49'),
(109, 8, 'Mochammad Muhsin', 'UPDATE', 'Aksesoris', '45', 'Memperbarui aksesoris: KABEL LAN 50M (GKM-KBL-002)', '2026-07-04 04:30:00'),
(110, 6, 'Muhammad Hoirul Fanani', 'UPDATE', 'Aksesoris', '44', 'Memperbarui aksesoris: KABEL LAN 100M (GKM-KBL-001)', '2026-07-08 07:00:38'),
(111, 6, 'Muhammad Hoirul Fanani', 'CREATE', 'Aset', NULL, 'Menambahkan aset: MIC QA Electronic (GKM-MIC-001)', '2026-07-08 07:07:12'),
(112, 1, 'super admin', 'CREATE', 'Peminjaman', NULL, 'Membuat peminjaman baru (GKM-PJM-2) untuk Favian', '2026-09-14 07:25:51'),
(113, 1, 'super admin', 'UPDATE', 'Peminjaman', '3', 'Melakukan approve/verifikasi peminjaman: GKM-PJM-2', '2026-09-14 07:27:07'),
(114, 1, 'super admin', 'UPDATE', 'Peminjaman', '3', 'Memperbarui peminjaman: GKM-PJM-2', '2026-09-14 07:27:35'),
(115, 1, 'super admin', 'UPDATE', 'Peminjaman', '3', 'Melakukan approve/verifikasi peminjaman: GKM-PJM-2', '2026-09-14 07:27:46'),
(116, 4, 'User', 'CREATE', 'Peminjaman', NULL, 'Membuat peminjaman baru (GKM-PJM-3) untuk Dandi', '2026-09-14 07:33:41'),
(117, 1, 'super admin', 'UPDATE', 'Peminjaman', '4', 'Melakukan approve/verifikasi peminjaman: GKM-PJM-3', '2026-09-14 07:33:57'),
(118, 1, 'super admin', 'UPDATE', 'Peminjaman', '4', 'Memperbarui peminjaman: GKM-PJM-3', '2026-09-15 07:57:27'),
(119, 1, 'super admin', 'DELETE', 'Peminjaman', '4', 'Menghapus peminjaman: GKM-PJM-3', '2026-09-16 02:28:39'),
(120, 1, 'super admin', 'DELETE', 'Peminjaman', '3', 'Menghapus peminjaman: GKM-PJM-2', '2026-09-16 02:28:41'),
(121, 1, 'super admin', 'DELETE', 'Peminjaman', '1', 'Menghapus peminjaman: GKM-PJM-1', '2026-09-16 02:28:43'),
(122, 17, 'Aditya Kurniawan', 'CREATE', 'Peminjaman', NULL, 'Membuat peminjaman baru (GKM-PJM-1) untuk Aditya Kurniawan', '2026-09-18 06:21:00'),
(123, 1, 'super admin', 'UPDATE', 'Peminjaman', '5', 'Melakukan approve/verifikasi peminjaman: GKM-PJM-1', '2026-09-18 06:22:06'),
(124, 17, 'Aditya Kurniawan', 'CREATE', 'Peminjaman', NULL, 'Membuat peminjaman baru (GKM-PJM-2) untuk Aditya Kurniawan', '2026-09-18 06:26:18'),
(125, 17, 'Aditya Kurniawan', 'UPDATE', 'Peminjaman', '5', 'Memperbarui peminjaman: GKM-PJM-1', '2026-09-18 08:02:53'),
(126, 19, 'Citra Ayu', 'UPDATE', 'Peminjaman', '6', 'Melakukan approve/verifikasi peminjaman: GKM-PJM-2', '2026-09-18 08:15:55'),
(127, 17, 'Aditya Kurniawan', 'CREATE', 'Peminjaman', NULL, 'Membuat peminjaman baru (GKM-PJM-3) untuk Aditya Kurniawan', '2026-09-22 04:21:31'),
(128, 17, 'Aditya Kurniawan', 'CREATE', 'Peminjaman', NULL, 'Membuat peminjaman baru (GKM-PJM-4) untuk Aditya Kurniawan', '2026-09-22 04:33:12'),
(129, 19, 'Citra Ayu', 'UPDATE', 'Peminjaman', '8', 'Melakukan approve/verifikasi peminjaman: GKM-PJM-4', '2026-09-22 04:34:34'),
(130, 1, 'super admin', 'DELETE', 'Peminjaman', '8', 'Menghapus peminjaman: GKM-PJM-4', '2026-09-23 06:17:45'),
(131, 1, 'super admin', 'DELETE', 'Peminjaman', '7', 'Menghapus peminjaman: GKM-PJM-3', '2026-09-23 06:17:47'),
(132, 1, 'super admin', 'DELETE', 'Peminjaman', '6', 'Menghapus peminjaman: GKM-PJM-2', '2026-09-23 06:17:48'),
(133, 1, 'super admin', 'DELETE', 'Peminjaman', '5', 'Menghapus peminjaman: GKM-PJM-1', '2026-09-23 06:17:50'),
(134, 17, 'Aditya Kurniawan', 'CREATE', 'Peminjaman', NULL, 'Membuat peminjaman baru (GKM-PJM-1) untuk Aditya Kurniawan', '2026-09-23 06:30:47'),
(135, 18, 'Bayu Pratama', 'UPDATE', 'Peminjaman', '9', 'Melakukan approve/verifikasi peminjaman: GKM-PJM-1', '2026-09-23 06:32:48'),
(136, 17, 'Aditya Kurniawan', 'CREATE', 'Peminjaman', NULL, 'Membuat peminjaman baru (GKM-PJM-2) untuk Aditya Kurniawan', '2026-09-23 06:39:40'),
(137, 21, 'Eko Prasetyo', 'UPDATE', 'Peminjaman', '10', 'Melakukan approve/verifikasi peminjaman: GKM-PJM-2', '2026-09-23 06:42:50'),
(138, 18, 'Bayu Pratama', 'CREATE', 'Peminjaman', NULL, 'Membuat peminjaman baru (GKM-PJM-3) untuk Bayu Pratama', '2026-09-23 06:46:30'),
(139, 21, 'Eko Prasetyo', 'UPDATE', 'Peminjaman', '11', 'Melakukan approve/verifikasi peminjaman: GKM-PJM-3', '2026-09-23 06:53:01'),
(140, 21, 'Eko Prasetyo', 'CREATE', 'Peminjaman', NULL, 'Membuat peminjaman baru (GKM-PJM-4) untuk Eko Prasetyo', '2026-09-23 07:08:34'),
(141, 19, 'Citra Ayu', 'UPDATE', 'Peminjaman', '12', 'Melakukan approve/verifikasi peminjaman: GKM-PJM-4', '2026-09-23 07:09:56'),
(142, 17, 'Aditya Kurniawan', 'CREATE', 'Peminjaman', NULL, 'Membuat peminjaman baru (GKM-PJM-5) untuk Aditya Kurniawan', '2026-09-23 07:11:09'),
(143, 1, 'super admin', 'UPDATE', 'Peminjaman', '13', 'Melakukan approve/verifikasi peminjaman: GKM-PJM-5', '2026-09-23 07:11:39'),
(144, 17, 'Aditya Kurniawan', 'UPDATE', 'Peminjaman', '13', 'Memperbarui peminjaman: GKM-PJM-5', '2026-09-23 07:19:44'),
(145, 17, 'Aditya Kurniawan', 'UPDATE', 'Peminjaman', '9', 'Memperbarui peminjaman: GKM-PJM-1', '2026-09-23 07:19:58'),
(146, 17, 'Aditya Kurniawan', 'UPDATE', 'Peminjaman', '10', 'Memperbarui peminjaman: GKM-PJM-2', '2026-09-23 07:20:18'),
(147, 21, 'Eko Prasetyo', 'UPDATE', 'Peminjaman', '9', 'Melakukan approve/verifikasi peminjaman: GKM-PJM-1', '2026-09-23 07:20:57'),
(148, 1, 'super admin', 'UPDATE', 'Peminjaman', '10', 'Melakukan approve/verifikasi peminjaman: GKM-PJM-2', '2026-09-23 07:21:08'),
(149, 1, 'super admin', 'UPDATE', 'Aksesoris', '41', 'Memperbarui aksesoris: SD CARD - 14 (AKS-STD-020)', '2026-09-26 04:33:12'),
(150, 1, 'super admin', 'UPDATE', 'Peminjaman', '13', 'Melakukan approve/verifikasi peminjaman: GKM-PJM-5', '2026-09-26 04:34:07'),
(151, 1, 'super admin', 'UPDATE', 'Aset', '13', 'Memperbarui aset: MIC QA Electronic (AST-PRO-006) (Mengubah: pengguna, keterangan, harga_aset, tanggal_pembelian)', '2026-09-26 04:35:38'),
(152, 1, 'super admin', 'UPDATE', 'Aksesoris', '45', 'Memperbarui aksesoris: KABEL LAN 50M (AKS-STD-022) (Mengubah: jumlah_unit, tanggal_pembelian)', '2026-09-26 04:36:13'),
(153, 17, 'Aditya Kurniawan', 'CREATE', 'Peminjaman', NULL, 'Membuat peminjaman baru (GKM-PJM-6) untuk Aditya Kurniawan', '2026-09-26 04:38:18'),
(154, 1, 'super admin', 'APPROVE PEMINJAMAN', 'Peminjaman', '14', 'Menyetujui peminjaman: GKM-PJM-6', '2026-09-26 04:39:01'),
(155, 17, 'Aditya Kurniawan', 'UPDATE', 'Peminjaman', '14', 'Memperbarui peminjaman: GKM-PJM-6 (Mengubah: Tanggal Pengembalian, Status, Bukti Pengembalian)', '2026-09-26 04:39:37'),
(156, 1, 'super admin', 'APPROVE PENGEMBALIAN', 'Peminjaman', '14', 'Memverifikasi pengembalian: GKM-PJM-6', '2026-09-26 04:40:01'),
(157, 1, 'super admin', 'UPDATE', 'Aksesoris', '44', 'Memperbarui jumlah unit pada KABEL LAN 100M (AKS-PRO-021)', '2026-09-26 05:02:31'),
(158, 1, 'super admin', 'UPDATE', 'Aset', '8', 'Memperbarui jenis aset pada Orbit kecil  (AST-STD-004)', '2026-09-26 05:03:25'),
(159, 1, 'super admin', 'UPDATE', 'Aksesoris', '38', 'Memperbarui nama aksesoris, kondisi pada SD CARD - 11 (AKS-PRO-018)', '2026-09-26 07:09:33'),
(160, 1, 'super admin', 'UPDATE', 'Aset', '7', 'Mengubah kondisi aset AST-PRO-003 menjadi: Maintenance', '2026-09-26 07:49:26'),
(161, 1, 'super admin', 'UPDATE', 'Aset', '9', 'Mengubah kondisi aset AST-PRO-004 menjadi: Rusak', '2026-09-26 07:49:32'),
(162, 1, 'Super Admin', 'UPDATE', 'Aksesoris', '40', 'Mengubah kondisi aksesoris AKS-PRO-019 menjadi: Maintenance', '2026-09-28 09:36:29'),
(163, 1, 'Super Admin', 'UPDATE', 'Aksesoris', '22', 'Mengubah kondisi aksesoris AKS-PRO-010 menjadi: Maintenance', '2026-09-28 09:36:37'),
(164, 1, 'Super Admin', 'UPDATE', 'Aksesoris', '22', 'Mengubah kondisi aksesoris AKS-PRO-010 menjadi: Rusak', '2026-09-28 09:36:41'),
(165, 1, 'Super Admin', 'UPDATE', 'Aksesoris', '11', 'Mengubah kondisi aksesoris AKS-STD-005 menjadi: Rusak', '2026-09-28 09:36:46'),
(166, 1, 'Super Admin', 'UPDATE', 'Aksesoris', '5', 'Mengubah kondisi aksesoris AKS-STD-002 menjadi: Maintenance', '2026-09-28 09:36:50'),
(167, 1, 'CEO Ultima', 'CREATE', 'Aksesoris', NULL, 'Menambahkan aksesoris: tes (ACC-GS-BAT-001)', '2026-09-29 08:28:24'),
(168, 1, 'CEO Ultima', 'CREATE', 'Aksesoris', NULL, 'Menambahkan aksesoris: tes2 (ACC-GPRO-KBL-001)', '2026-09-29 08:29:28'),
(169, 1, 'CEO Ultima', 'CREATE', 'Aset', NULL, 'Menambahkan aset: tes01 (AST-GS-GEN-001)', '2026-09-29 08:31:23'),
(170, 1, 'CEO Ultima', 'DELETE', 'Aksesoris', '47', 'Menghapus aksesoris: tes2 (ACC-GPRO-KBL-001)', '2026-09-29 08:32:22'),
(171, 1, 'CEO Ultima', 'DELETE', 'Aksesoris', '46', 'Menghapus aksesoris: tes (ACC-GS-BAT-001)', '2026-09-29 08:32:23'),
(172, 1, 'CEO Ultima', 'DELETE', 'Aksesoris', '26', 'Menghapus aksesoris: HARDCASE PARLED (AKS-PRO-012)', '2026-09-29 08:32:57'),
(173, 1, 'CEO Ultima', 'CREATE', 'Aksesoris', NULL, 'Menambahkan aksesoris: tes01 (ACC-GS-C-32-001)', '2026-10-02 11:57:25'),
(174, 1, 'CEO Ultima', 'DELETE', 'Aset', '8', 'Menghapus aset: Orbit kecil  (AST-STD-004)', '2026-10-03 06:16:29'),
(175, 1, 'CEO Ultima', 'DELETE', 'Aset', '7', 'Menghapus aset: Zoom Recoder 03 (AST-PRO-003)', '2026-10-03 06:16:33'),
(176, 1, 'CEO Ultima', 'DELETE', 'Aset', '9', 'Menghapus aset: Video Switcher  (AST-PRO-004)', '2026-10-03 06:16:37'),
(177, 20, 'Aurelia Karisma', 'CREATE', 'Peminjaman', NULL, 'Membuat peminjaman baru (GKM-PJM-7) untuk Aurelia Karisma', '2026-10-03 06:22:51'),
(178, 1, 'CEO Ultima', 'APPROVE PEMINJAMAN', 'Peminjaman', '15', 'Menyetujui peminjaman: GKM-PJM-7', '2026-10-03 06:23:19'),
(179, 1, 'CEO Ultima', 'UPDATE', 'Peminjaman', '15', 'Mengisi pengembalian GKM-PJM-7', '2026-10-03 06:23:33'),
(180, 1, 'CEO Ultima', 'APPROVE PENGEMBALIAN', 'Peminjaman', '15', 'Memverifikasi pengembalian: GKM-PJM-7', '2026-10-03 06:23:40'),
(181, 1, 'CEO Ultima', 'UPDATE', 'Peminjaman', '12', 'Mengisi pengembalian GKM-PJM-4', '2026-10-03 06:24:21'),
(182, 1, 'CEO Ultima', 'APPROVE PENGEMBALIAN', 'Peminjaman', '12', 'Memverifikasi pengembalian: GKM-PJM-4', '2026-10-03 06:24:26'),
(183, 1, 'CEO Ultima', 'DELETE', 'Peminjaman', '12', 'Menghapus peminjaman: GKM-PJM-4', '2026-10-03 06:24:29'),
(184, 1, 'CEO Ultima', 'UPDATE', 'Peminjaman', '11', 'Mengisi pengembalian GKM-PJM-3', '2026-10-03 06:25:07'),
(185, 1, 'CEO Ultima', 'APPROVE PENGEMBALIAN', 'Peminjaman', '11', 'Memverifikasi pengembalian: GKM-PJM-3', '2026-10-03 06:25:13'),
(186, 1, 'CEO Ultima', 'DELETE', 'Peminjaman', '11', 'Menghapus peminjaman: GKM-PJM-3', '2026-10-03 06:25:15'),
(187, 1, 'CEO Ultima', 'DELETE', 'Aksesoris', '48', 'Menghapus aksesoris: tes01 (ACC-GS-C-32-001)', '2026-10-20 06:22:56'),
(188, 1, 'CEO Ultima', 'DELETE', 'Aksesoris', '45', 'Menghapus aksesoris: KABEL LAN 50M (AKS-STD-022)', '2026-10-20 06:22:59'),
(189, 1, 'CEO Ultima', 'DELETE', 'Aksesoris', '44', 'Menghapus aksesoris: KABEL LAN 100M (AKS-PRO-021)', '2026-10-20 06:23:02'),
(190, 1, 'CEO Ultima', 'DELETE', 'Aksesoris', '43', 'Menghapus aksesoris: STAND TRIPOD LIGHTING (AKS-STD-021)', '2026-10-20 06:23:13'),
(191, 1, 'CEO Ultima', 'DELETE', 'Aksesoris', '3', 'Menghapus aksesoris: Matador  (AKS-STD-001)', '2026-10-20 06:26:20'),
(192, 1, 'CEO Ultima', 'UPDATE', 'Aset', '19', 'Mengubah kondisi aset AST-GS-GEN-001 menjadi: Rusak', '2026-10-22 09:07:06'),
(193, 1, 'CEO Ultima', 'DELETE', 'System', 'ALL', 'SUPER ADMIN menghapus seluruh data: Aset & Aksesoris', '2026-10-22 09:39:54'),
(194, 1, 'CEO Ultima', 'CREATE', 'Aset', '20', 'Import massal 44 aset dari file Excel', '2026-10-22 09:56:47'),
(195, 1, 'CEO Ultima', 'UPDATE', 'Aset', '20', 'Pemisahan (Split) aset AST-GPRO-VID-001: 3 unit dipindah ke kondisi \"Siap Digunakan\" (Kode baru: AST-GPRO-VID-001-P1), sisa 3 unit.', '2026-10-22 09:57:38'),
(196, 1, 'CEO Ultima', 'UPDATE', 'Aset', '64', 'Mengubah kondisi aset AST-GPRO-VID-001-P1 menjadi: Rusak', '2026-10-22 09:58:02'),
(197, 1, 'CEO Ultima', 'DELETE', 'System', 'ALL', 'SUPER ADMIN menghapus seluruh data: Aset & Aksesoris', '2026-10-22 10:11:58');

-- --------------------------------------------------------

--
-- Struktur dari tabel `brands`
--

CREATE TABLE `brands` (
  `id` int(11) NOT NULL,
  `nama` varchar(100) NOT NULL,
  `tipe` enum('aset','aksesoris') NOT NULL DEFAULT 'aset',
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `brands`
--

INSERT INTO `brands` (`id`, `nama`, `tipe`, `created_at`) VALUES
(1, 'Sony', 'aset', '2026-06-12 06:21:22'),
(3, 'Soni', 'aksesoris', '2026-06-12 06:26:44'),
(4, 'Colorlight', 'aset', '2026-06-22 02:30:37'),
(5, 'HUAWEI', 'aksesoris', '2026-06-22 07:12:03'),
(6, 'H4nPro', 'aset', '2026-06-22 08:10:34'),
(7, 'ZOOM', 'aset', '2026-06-22 08:31:59'),
(8, 'TELKOMSEL', 'aset', '2026-06-22 08:51:37'),
(9, 'FEELWORLD', 'aset', '2026-06-22 09:02:35'),
(10, 'Epson', 'aset', '2026-06-29 02:09:32'),
(11, 'Behringer ', 'aset', '2026-06-29 07:13:14'),
(12, 'VENTION ', 'aksesoris', '2026-06-29 07:18:00'),
(13, 'UGREEN', 'aksesoris', '2026-06-29 07:29:07'),
(14, 'TAKARA', 'aksesoris', '2026-07-01 07:56:39'),
(15, 'BENRO', 'aksesoris', '2026-07-01 08:03:58'),
(16, 'ZEIS', 'aksesoris', '2026-07-01 08:24:27'),
(17, 'SAMYANG', 'aksesoris', '2026-07-01 08:27:20'),
(24, 'SONY ', 'aksesoris', '2026-07-01 12:40:33'),
(25, 'Non Merk', 'aksesoris', '2026-07-02 01:54:25'),
(26, 'Lunar', 'aksesoris', '2026-07-02 02:09:31'),
(27, 'QA electronic', 'aksesoris', '2026-07-02 02:22:07'),
(28, 'SANDISK', 'aksesoris', '2026-07-02 07:23:38'),
(29, 'QA ', 'aset', '2026-07-08 07:03:25');

-- --------------------------------------------------------

--
-- Struktur dari tabel `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `nama` varchar(100) NOT NULL,
  `kode_singkat` varchar(10) NOT NULL,
  `tipe` enum('aset','aksesoris') NOT NULL DEFAULT 'aset',
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `categories`
--

INSERT INTO `categories` (`id`, `nama`, `kode_singkat`, `tipe`, `created_at`) VALUES
(1, 'Kamera', 'CAM', 'aset', '2026-06-12 06:21:14'),
(2, 'Baterai Kamera', 'BAT', 'aksesoris', '2026-06-12 06:25:47'),
(3, 'Video Processor ', 'VPROC', 'aset', '2026-06-22 02:30:10'),
(4, 'ORBIT HUAWEI ', 'ORBIT', 'aksesoris', '2026-06-22 07:11:52'),
(5, 'matador ', 'STAND TV ', 'aksesoris', '2026-06-22 07:20:37'),
(6, 'Stand Tv putih ', 'STAND TV P', 'aksesoris', '2026-06-22 07:27:52'),
(7, 'ZOOM ', 'ZOOM', 'aset', '2026-06-22 08:10:01'),
(8, 'Recorder Kecil', 'RECORDER', 'aset', '2026-06-22 08:32:29'),
(9, 'ORBIT', 'ORBIT ', 'aset', '2026-06-22 08:51:27'),
(10, 'Switcher ', 'VIDEO SWIT', 'aset', '2026-06-22 09:02:12'),
(11, 'Printer', 'PRINT', 'aset', '2026-06-29 02:09:00'),
(12, 'Kabel Genset', 'KABEL', 'aksesoris', '2026-06-29 07:09:48'),
(13, 'Audio Interface', 'AUDIO INTE', 'aset', '2026-06-29 07:12:58'),
(14, 'KABEL HDMI', 'KABEL HDMI', 'aksesoris', '2026-06-29 07:17:46'),
(15, 'Kabel usb', 'U', 'aksesoris', '2026-06-29 07:27:22'),
(16, 'STAND FLASH ', 'STAND ', 'aksesoris', '2026-07-01 07:56:16'),
(20, 'Stand kamera', 'STND', 'aksesoris', '2026-07-01 08:03:45'),
(21, 'LENSA ', 'LENSA', 'aksesoris', '2026-07-01 08:24:16'),
(22, 'hardcase', 'HRC', 'aksesoris', '2026-07-02 01:51:14'),
(23, 'CARD 64', 'C-64', 'aksesoris', '2026-07-02 07:23:09'),
(24, 'CARD 32', 'C-32', 'aksesoris', '2026-07-02 07:51:54'),
(25, 'STAND TRIPOD', 'STN', 'aksesoris', '2026-07-04 02:34:50'),
(26, 'KABEL', 'KSN', 'aset', '2026-07-04 02:41:04'),
(31, 'KABEL LAN', 'KBL', 'aksesoris', '2026-07-04 04:12:53'),
(32, 'MIC', 'MIC', 'aset', '2026-07-08 07:03:17');

-- --------------------------------------------------------

--
-- Struktur dari tabel `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `type` varchar(50) NOT NULL,
  `message` text NOT NULL,
  `reference_id` int(11) DEFAULT NULL,
  `target_roles` varchar(255) NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `notifications`
--

INSERT INTO `notifications` (`id`, `type`, `message`, `reference_id`, `target_roles`, `is_read`, `created_at`) VALUES
(1, 'peminjaman_baru', 'Cahyo membuat peminjaman baru (GKM-PJM-1)', NULL, 'super admin,admin,supervisor', 1, '2026-06-12 06:28:55'),
(2, 'stok_rendah_aset', 'Stok Sony A7C tersisa 0 unit', 1, 'super admin,admin', 1, '2026-06-12 06:28:55'),
(3, 'stok_rendah_aks', 'Stok Baterai Kamera NP-FZ100 tersisa 3 unit', 1, 'super admin,admin', 1, '2026-06-12 06:28:55'),
(4, 'approved', 'Peminjaman GKM-PJM-1 telah disetujui untuk dipinjam oleh Supervisor [Peminjam: Cahyo] [By: User]', 1, 'super admin,admin,supervisor,user', 1, '2026-06-12 06:29:27'),
(5, 'dikembalikan', 'Peminjaman GKM-PJM-1 menunggu verifikasi pengembalian dari Cahyo', 1, 'super admin,admin,supervisor', 1, '2026-06-12 06:30:52'),
(6, 'approved', 'Peminjaman GKM-PJM-1 telah diverifikasi pengembaliannya oleh Supervisor [Peminjam: Cahyo] [By: User]', 1, 'super admin,admin,supervisor,user', 1, '2026-06-12 06:31:39'),
(7, 'peminjaman_baru', 'Cahyo membuat peminjaman baru (GKM-PJM-2)', NULL, 'super admin,admin,supervisor', 1, '2026-06-12 07:50:15'),
(8, 'stok_rendah_aset', 'Stok Sony A7C tersisa 0 unit', 1, 'super admin,admin', 1, '2026-06-12 07:50:15'),
(9, 'approved', 'Peminjaman GKM-PJM-2 telah disetujui untuk dipinjam oleh super admin [Peminjam: Cahyo] [By: User]', 2, 'super admin,admin,supervisor,user', 1, '2026-06-23 06:03:41'),
(10, 'peminjaman_baru', 'Favian membuat peminjaman baru (GKM-PJM-2)', NULL, 'super admin,admin,supervisor', 1, '2026-09-14 07:25:51'),
(11, 'stok_rendah_aset', 'Stok MIC QA Electronic tersisa 0 unit', 13, 'super admin,admin', 1, '2026-09-14 07:25:51'),
(12, 'stok_rendah_aks', 'Stok KABEL LAN 50M tersisa 3 unit', 45, 'super admin,admin', 1, '2026-09-14 07:25:51'),
(13, 'approved', 'Peminjaman GKM-PJM-2 telah disetujui untuk dipinjam oleh super admin [Peminjam: Favian] [By: super admin]', 3, 'super admin,admin,supervisor,user', 1, '2026-09-14 07:27:07'),
(14, 'dikembalikan', 'Peminjaman GKM-PJM-2 menunggu verifikasi pengembalian dari Favian', 3, 'super admin,admin,supervisor', 1, '2026-09-14 07:27:34'),
(15, 'approved', 'Peminjaman GKM-PJM-2 telah diverifikasi pengembaliannya oleh super admin [Peminjam: Favian] [By: super admin]', 3, 'super admin,admin,supervisor,user', 1, '2026-09-14 07:27:46'),
(16, 'peminjaman_baru', 'Dandi membuat peminjaman baru (GKM-PJM-3)', NULL, 'super admin,admin,supervisor', 1, '2026-09-14 07:33:41'),
(17, 'stok_rendah_aset', 'Stok MIC QA Electronic tersisa 0 unit', 13, 'super admin,admin', 1, '2026-09-14 07:33:41'),
(18, 'approved', 'Peminjaman GKM-PJM-3 telah disetujui untuk dipinjam oleh super admin [Peminjam: Dandi] [By: User]', 4, 'super admin,admin,supervisor,user', 1, '2026-09-14 07:33:57'),
(19, 'dikembalikan', 'Peminjaman GKM-PJM-3 menunggu verifikasi pengembalian dari Dandi', 4, 'super admin,admin,supervisor', 1, '2026-09-15 07:57:27'),
(20, 'peminjaman_baru', 'Aditya Kurniawan membuat peminjaman baru (GKM-PJM-1)', NULL, 'super admin,admin,supervisor', 1, '2026-09-18 06:21:00'),
(21, 'stok_rendah_aset', 'Stok MIC QA Electronic tersisa 0 unit', 13, 'super admin,admin', 1, '2026-09-18 06:21:00'),
(22, 'stok_rendah_aset', 'Stok Audio Interface tersisa 0 unit', 11, 'super admin,admin', 1, '2026-09-18 06:21:00'),
(23, 'stok_rendah_aks', 'Stok Lensa Sony 35 F 1.8 tersisa 0 unit', 19, 'super admin,admin', 1, '2026-09-18 06:21:00'),
(24, 'stok_rendah_aks', 'Stok Lensa Sony 85 F 1.8 tersisa 0 unit', 16, 'super admin,admin', 1, '2026-09-18 06:21:00'),
(25, 'approved', 'Peminjaman GKM-PJM-1 telah disetujui untuk dipinjam oleh [object Object] [Peminjam: Aditya Kurniawan] [By: Aditya Kurniawan]', 5, 'super admin,admin,supervisor,user', 1, '2026-09-18 06:22:06'),
(26, 'peminjaman_baru', 'Aditya Kurniawan membuat peminjaman baru (GKM-PJM-2)', NULL, 'super admin,admin,supervisor', 1, '2026-09-18 06:26:18'),
(27, 'stok_rendah_aks', 'Stok Kabel Hdmi  2 M  tersisa 0 unit', 8, 'super admin,admin', 1, '2026-09-18 06:26:18'),
(28, 'stok_rendah_aks', 'Stok Kabel Genset tersisa 0 unit', 5, 'super admin,admin', 1, '2026-09-18 06:26:18'),
(29, 'dikembalikan', 'Peminjaman GKM-PJM-1 menunggu verifikasi pengembalian dari Aditya Kurniawan', 5, 'super admin,admin,supervisor', 1, '2026-09-18 08:02:53'),
(30, 'approved', 'Peminjaman GKM-PJM-2 telah disetujui untuk dipinjam oleh Citra Ayu [Peminjam: Aditya Kurniawan] [By: Aditya Kurniawan]', 6, 'super admin,admin,supervisor,user', 1, '2026-09-18 08:15:55'),
(31, 'peminjaman_baru', 'Aditya Kurniawan membuat peminjaman baru (GKM-PJM-3)', NULL, 'super admin,admin,supervisor', 1, '2026-09-22 04:21:31'),
(32, 'stok_rendah_aset', 'Stok Zoom Recorder kecil 02 tersisa 0 unit', 6, 'super admin,admin', 1, '2026-09-22 04:21:31'),
(33, 'stok_rendah_aks', 'Stok STAND TRIPOD LIGHTING tersisa 3 unit', 43, 'super admin,admin', 1, '2026-09-22 04:21:31'),
(34, 'peminjaman_baru', 'Aditya Kurniawan membuat peminjaman baru (GKM-PJM-4)', NULL, 'super admin,admin,supervisor', 1, '2026-09-22 04:33:11'),
(35, 'stok_rendah_aset', 'Stok KABEL SNAKE 16 CHANNEL tersisa 0 unit', 12, 'super admin,admin', 1, '2026-09-22 04:33:12'),
(36, 'stok_rendah_aks', 'Stok Lensa Zeis 25 F 2 tersisa 0 unit', 21, 'super admin,admin', 1, '2026-09-22 04:33:12'),
(37, 'approved', 'Peminjaman GKM-PJM-4 telah disetujui untuk dipinjam oleh Citra Ayu [Peminjam: Aditya Kurniawan] [By: Aditya Kurniawan]', 8, 'super admin,admin,supervisor,user', 1, '2026-09-22 04:34:34'),
(38, 'peminjaman_baru', 'Aditya Kurniawan membuat peminjaman baru (GKM-PJM-1)', NULL, 'super admin,admin,supervisor', 1, '2026-09-23 06:30:47'),
(39, 'stok_rendah_aset', 'Stok Audio Interface tersisa 0 unit', 11, 'super admin,admin', 1, '2026-09-23 06:30:47'),
(40, 'stok_rendah_aks', 'Stok hardcase parled tersisa 1 unit', 23, 'super admin,admin', 1, '2026-09-23 06:30:47'),
(41, 'approved', 'Peminjaman GKM-PJM-1 telah disetujui untuk dipinjam oleh Bayu Pratama [Peminjam: Aditya Kurniawan] [By: Aditya Kurniawan]', 9, 'super admin,admin,supervisor,user', 1, '2026-09-23 06:32:48'),
(42, 'peminjaman_baru', 'Aditya Kurniawan membuat peminjaman baru (GKM-PJM-2)', NULL, 'super admin,admin,supervisor', 1, '2026-09-23 06:39:40'),
(43, 'stok_rendah_aks', 'Stok HARDCASE SOUND HUPER tersisa 1 unit', 24, 'super admin,admin', 1, '2026-09-23 06:39:40'),
(44, 'approved', 'Peminjaman GKM-PJM-2 telah disetujui untuk dipinjam oleh Eko Prasetyo [Peminjam: Aditya Kurniawan] [By: Aditya Kurniawan]', 10, 'super admin,admin,supervisor,user', 1, '2026-09-23 06:42:50'),
(45, 'peminjaman_baru', 'Bayu Pratama membuat peminjaman baru (GKM-PJM-3)', NULL, 'super admin,admin,supervisor', 1, '2026-09-23 06:46:30'),
(46, 'stok_rendah_aks', 'Stok Kabel Hdmi  2 M  tersisa 0 unit', 8, 'super admin,admin', 1, '2026-09-23 06:46:30'),
(47, 'stok_rendah_aks', 'Stok Kabel Hdmi 1,5 M  tersisa 1 unit', 7, 'super admin,admin', 1, '2026-09-23 06:46:30'),
(48, 'approved', 'Peminjaman GKM-PJM-3 telah disetujui untuk dipinjam oleh Eko Prasetyo [Peminjam: Bayu Pratama] [By: Bayu Pratama]', 11, 'super admin,admin,supervisor,user', 1, '2026-09-23 06:53:01'),
(49, 'peminjaman_baru', 'Eko Prasetyo membuat peminjaman baru (GKM-PJM-4)', NULL, 'super admin,admin,supervisor', 1, '2026-09-23 07:08:34'),
(50, 'stok_rendah_aks', 'Stok hardcase parled tersisa 0 unit', 23, 'super admin,admin', 1, '2026-09-23 07:08:34'),
(51, 'stok_rendah_aset', 'Stok Zoom Recoder kecil 01 tersisa 0 unit', 5, 'super admin,admin', 1, '2026-09-23 07:08:34'),
(52, 'approved', 'Peminjaman GKM-PJM-4 telah disetujui untuk dipinjam oleh Citra Ayu [Peminjam: Eko Prasetyo] [By: Eko Prasetyo]', 12, 'super admin,admin,supervisor,user', 1, '2026-09-23 07:09:56'),
(53, 'peminjaman_baru', 'Aditya Kurniawan membuat peminjaman baru (GKM-PJM-5)', NULL, 'super admin,admin,supervisor', 1, '2026-09-23 07:11:09'),
(54, 'stok_rendah_aks', 'Stok HARDCASE FOLLOWSPOT tersisa 0 unit', 25, 'super admin,admin', 1, '2026-09-23 07:11:09'),
(55, 'approved', 'Peminjaman GKM-PJM-5 telah disetujui untuk dipinjam oleh super admin [Peminjam: Aditya Kurniawan] [By: Aditya Kurniawan]', 13, 'super admin,admin,supervisor,user', 1, '2026-09-23 07:11:39'),
(56, 'dikembalikan', 'Peminjaman GKM-PJM-5 menunggu verifikasi pengembalian dari Aditya Kurniawan', 13, 'super admin,admin,supervisor', 1, '2026-09-23 07:19:44'),
(57, 'dikembalikan', 'Peminjaman GKM-PJM-1 menunggu verifikasi pengembalian dari Aditya Kurniawan', 9, 'super admin,admin,supervisor', 1, '2026-09-23 07:19:58'),
(58, 'dikembalikan', 'Peminjaman GKM-PJM-2 menunggu verifikasi pengembalian dari Aditya Kurniawan', 10, 'super admin,admin,supervisor', 1, '2026-09-23 07:20:18'),
(59, 'approved', 'Peminjaman GKM-PJM-1 telah diverifikasi pengembaliannya oleh Eko Prasetyo [Peminjam: Aditya Kurniawan] [By: Aditya Kurniawan]', 9, 'super admin,admin,supervisor,user', 1, '2026-09-23 07:20:57'),
(60, 'approved', 'Peminjaman GKM-PJM-2 telah diverifikasi pengembaliannya oleh super admin [Peminjam: Aditya Kurniawan] [By: Aditya Kurniawan]', 10, 'super admin,admin,supervisor,user', 1, '2026-09-23 07:21:08'),
(61, 'approved', 'Peminjaman GKM-PJM-5 telah diverifikasi pengembaliannya oleh super admin [Peminjam: Aditya Kurniawan] [By: Aditya Kurniawan]', 13, 'super admin,admin,supervisor,user', 1, '2026-09-26 04:34:07'),
(62, 'peminjaman_baru', 'Aditya Kurniawan membuat peminjaman baru (GKM-PJM-6)', NULL, 'super admin,admin,supervisor', 1, '2026-09-26 04:38:18'),
(63, 'stok_rendah_aks', 'Stok Lensa Samyang V-AF 35 F 1.9 tersisa 0 unit', 18, 'super admin,admin', 1, '2026-09-26 04:38:18'),
(64, 'stok_rendah_aset', 'Stok KABEL SNAKE 16 CHANNEL tersisa 0 unit', 12, 'super admin,admin', 1, '2026-09-26 04:38:18'),
(65, 'approved', 'Peminjaman GKM-PJM-6 telah disetujui untuk dipinjam oleh super admin [Peminjam: Aditya Kurniawan] [By: Aditya Kurniawan]', 14, 'super admin,admin,supervisor,user', 1, '2026-09-26 04:39:01'),
(66, 'dikembalikan', 'Peminjaman GKM-PJM-6 menunggu verifikasi pengembalian dari Aditya Kurniawan', 14, 'super admin,admin,supervisor', 1, '2026-09-26 04:39:37'),
(67, 'approved', 'Peminjaman GKM-PJM-6 telah diverifikasi pengembaliannya oleh super admin [Peminjam: Aditya Kurniawan] [By: Aditya Kurniawan]', 14, 'super admin,admin,supervisor,user', 1, '2026-09-26 04:40:01'),
(68, 'peminjaman_baru', 'Aurelia Karisma membuat peminjaman baru (GKM-PJM-7)', NULL, 'super admin,admin,supervisor', 0, '2026-10-03 06:22:51'),
(69, 'stok_rendah_aset', 'Stok tes01 tersisa 1 unit', 19, 'super admin,admin', 0, '2026-10-03 06:22:51'),
(70, 'stok_rendah_aks', 'Stok tes01 tersisa 1 unit', 48, 'super admin,admin', 0, '2026-10-03 06:22:51'),
(71, 'approved', 'Peminjaman GKM-PJM-7 telah disetujui untuk dipinjam oleh CEO Ultima [Peminjam: Aurelia Karisma] [By: Aurelia Karisma]', 15, 'super admin,admin,supervisor,user', 0, '2026-10-03 06:23:19'),
(72, 'dikembalikan', 'Peminjaman GKM-PJM-7 menunggu verifikasi pengembalian dari Aurelia Karisma', 15, 'super admin,admin,supervisor', 0, '2026-10-03 06:23:33'),
(73, 'approved', 'Peminjaman GKM-PJM-7 telah diverifikasi pengembaliannya oleh CEO Ultima [Peminjam: Aurelia Karisma] [By: Aurelia Karisma]', 15, 'super admin,admin,supervisor,user', 0, '2026-10-03 06:23:40'),
(74, 'dikembalikan', 'Peminjaman GKM-PJM-4 menunggu verifikasi pengembalian dari Eko Prasetyo', 12, 'super admin,admin,supervisor', 0, '2026-10-03 06:24:21'),
(75, 'approved', 'Peminjaman GKM-PJM-4 telah diverifikasi pengembaliannya oleh CEO Ultima [Peminjam: Eko Prasetyo] [By: Eko Prasetyo]', 12, 'super admin,admin,supervisor,user', 0, '2026-10-03 06:24:26'),
(76, 'dikembalikan', 'Peminjaman GKM-PJM-3 menunggu verifikasi pengembalian dari Bayu Pratama', 11, 'super admin,admin,supervisor', 0, '2026-10-03 06:25:07'),
(77, 'approved', 'Peminjaman GKM-PJM-3 telah diverifikasi pengembaliannya oleh CEO Ultima [Peminjam: Bayu Pratama] [By: Bayu Pratama]', 11, 'super admin,admin,supervisor,user', 0, '2026-10-03 06:25:13');

-- --------------------------------------------------------

--
-- Struktur dari tabel `peminjaman`
--

CREATE TABLE `peminjaman` (
  `id` int(11) NOT NULL,
  `kode_pinjam` varchar(50) NOT NULL,
  `nama_peminjam` varchar(255) NOT NULL,
  `penerima_aset` varchar(255) DEFAULT NULL,
  `alasan_peminjaman` text DEFAULT NULL,
  `keperluan_list` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `tanggal_peminjaman` datetime NOT NULL,
  `tanggal_pengembalian` datetime DEFAULT NULL,
  `status` enum('Menunggu Persetujuan','Sedang Dipinjam','Menunggu Verifikasi','Peminjaman Selesai') DEFAULT 'Menunggu Persetujuan',
  `yang_menyerahkan` varchar(255) DEFAULT NULL,
  `approved_by` varchar(255) DEFAULT NULL,
  `return_approved_by` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `bukti_peminjaman` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `bukti_pengembalian` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `peminjaman`
--

INSERT INTO `peminjaman` (`id`, `kode_pinjam`, `nama_peminjam`, `penerima_aset`, `alasan_peminjaman`, `keperluan_list`, `tanggal_peminjaman`, `tanggal_pengembalian`, `status`, `yang_menyerahkan`, `approved_by`, `return_approved_by`, `created_at`, `updated_at`, `bukti_peminjaman`, `bukti_pengembalian`, `user_id`) VALUES
(9, 'GKM-PJM-1', 'Aditya Kurniawan', 'Eko Prasetyo', 'Event horeg', '[{\"keperluan\":\"Event horeg\"}]', '2026-09-23 13:30:46', '2026-09-25 14:19:57', 'Peminjaman Selesai', 'Eko Prasetyo', 'Bayu Pratama', 'Eko Prasetyo', '2026-09-23 06:30:47', '2026-09-23 07:20:57', '[\"/uploads/bukti_pinjam-1790145047515-368149330-0.webp\"]', '[\"/uploads/bukti_kembali-1790147998116-14222515-0.webp\"]', 17),
(10, 'GKM-PJM-2', 'Aditya Kurniawan', 'super admin', 'Wedding', '[{\"keperluan\":\"Wedding\"}]', '2026-09-23 13:39:39', '2026-09-26 14:20:17', 'Peminjaman Selesai', 'Eko Prasetyo', 'Eko Prasetyo', 'super admin', '2026-09-23 06:39:40', '2026-09-23 07:21:08', '[\"/uploads/bukti_pinjam-1790145579986-734434246-0.webp\"]', '[\"/uploads/bukti_kembali-1790148018509-252968415-0.webp\"]', 17),
(13, 'GKM-PJM-5', 'Aditya Kurniawan', 'super admin', 'Wisuda', '[{\"keperluan\":\"Wisuda\"}]', '2026-09-23 14:11:08', '2026-09-24 14:19:43', 'Peminjaman Selesai', 'super admin', 'super admin', 'super admin', '2026-09-23 07:11:09', '2026-09-26 04:34:07', '[\"/uploads/bukti_pinjam-1790147469176-166631472-0.webp\"]', '[\"/uploads/bukti_kembali-1790147984122-125081841-0.webp\"]', 17),
(14, 'GKM-PJM-6', 'Aditya Kurniawan', 'super admin', 'Foto Studio', '[{\"keperluan\":\"Foto Studio\"}]', '2026-09-26 11:38:17', '2026-09-27 11:39:36', 'Peminjaman Selesai', 'super admin', 'super admin', 'super admin', '2026-09-26 04:38:18', '2026-09-26 04:40:01', '[\"/uploads/bukti_pinjam-1790397497707-245980895-0.webp\"]', '[\"/uploads/bukti_kembali-1790397576858-79869449-0.webp\"]', 17),
(15, 'GKM-PJM-7', 'Aurelia Karisma', 'CEO Ultima', 'Wedding', '[{\"keperluan\":\"Wedding\"}]', '2026-10-03 13:22:52', '2026-10-03 13:23:33', 'Peminjaman Selesai', 'CEO Ultima', 'CEO Ultima', 'CEO Ultima', '2026-10-03 06:22:51', '2026-10-03 06:23:40', '[\"/uploads/bukti_pinjam-1791008571432-982397599-0.webp\"]', '[\"/uploads/bukti_kembali-1791008613414-568723901-0.webp\"]', NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `peminjaman_items`
--

CREATE TABLE `peminjaman_items` (
  `id` int(11) NOT NULL,
  `peminjaman_id` int(11) NOT NULL,
  `asset_id` int(11) DEFAULT NULL,
  `unit_id` int(11) DEFAULT NULL,
  `aksesoris_id` int(11) DEFAULT NULL,
  `jumlah` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `tbl_pegawai`
--

CREATE TABLE `tbl_pegawai` (
  `id` int(11) NOT NULL,
  `nama_lengkap` varchar(255) NOT NULL,
  `tempat_lahir` varchar(100) DEFAULT NULL,
  `tanggal_lahir` date DEFAULT NULL,
  `alamat` text DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `nomor_hp` varchar(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `tbl_pegawai`
--

INSERT INTO `tbl_pegawai` (`id`, `nama_lengkap`, `tempat_lahir`, `tanggal_lahir`, `alamat`, `email`, `nomor_hp`, `created_at`, `updated_at`) VALUES
(8, 'Budi Santoso', 'Jakarta', '1990-05-12', 'Jl. Merdeka No. 10, Jakarta Pusat', 'budi.santoso@email.com', '081234567001', '2026-09-16 04:51:04', '2026-09-16 04:51:04'),
(9, 'Siti Aminah', 'Bandung', '1992-08-23', 'Jl. Asia Afrika No. 25, Bandung', 'siti.aminah@email.com', '081234567002', '2026-09-16 04:51:04', '2026-09-16 04:51:04'),
(10, 'Andi Wijaya', 'Surabaya', '1988-01-15', 'Jl. Tunjungan No. 5, Surabaya', 'andi.wijaya@email.com', '081234567003', '2026-09-16 04:51:04', '2026-09-16 04:51:04'),
(11, 'Dewi Lestari', 'Yogyakarta', '1995-03-30', 'Jl. Malioboro No. 12, Yogyakarta', 'dewi.lestari@email.com', '081234567004', '2026-09-16 04:51:04', '2026-09-16 04:51:04'),
(12, 'Rudi Hartono', 'Medan', '1991-11-07', 'Jl. Gatot Subroto No. 8, Medan', 'rudi.hartono@email.com', '081234567005', '2026-09-16 04:51:04', '2026-09-16 04:51:04'),
(13, 'Rina Marlina', 'Semarang', '1993-06-18', 'Jl. Pandanaran No. 20, Semarang', 'rina.marlina@email.com', '081234567006', '2026-09-16 04:51:04', '2026-09-16 04:51:04'),
(14, 'Agus Setiawan', 'Makassar', '1989-09-25', 'Jl. Pettarani No. 3, Makassar', 'agus.setiawan@email.com', '081234567007', '2026-09-16 04:51:04', '2026-09-16 04:51:04'),
(15, 'Fitri Handayani', 'Palembang', '1994-12-02', 'Jl. Sudirman No. 15, Palembang', 'fitri.handayani@email.com', '081234567008', '2026-09-16 04:51:04', '2026-09-16 04:51:04'),
(17, 'Maya Sari', 'Balikpapan', '1996-04-21', 'Jl. Sudirman No. 30, Balikpapan', 'maya.sari@email.com', '081234567010', '2026-09-16 04:51:04', '2026-09-16 04:51:04'),
(18, 'Hendra Gunawan', 'Pontianak', '1987-02-11', 'Jl. Gajah Mada No. 9, Pontianak', 'hendra.gunawan@email.com', '081234567011', '2026-09-16 04:51:04', '2026-09-16 04:51:04'),
(19, 'Lina Kusuma', 'Manado', '1992-10-05', 'Jl. Sam Ratulangi No. 18, Manado', 'lina.kusuma@email.com', '081234567012', '2026-09-16 04:51:04', '2026-09-16 04:51:04'),
(20, 'Bayu Pratama', 'Padang', '1991-01-27', 'Jl. Imam Bonjol No. 22, Padang', 'bayu.pratama@email.com', '081234567013', '2026-09-16 04:51:04', '2026-09-16 04:51:04'),
(21, 'Nina Septiani', 'Pekanbaru', '1993-08-09', 'Jl. Jenderal Sudirman No. 11, Pekanbaru', 'nina.septiani@email.com', '081234567014', '2026-09-16 04:51:04', '2026-09-16 04:51:04'),
(22, 'Fajar Nugroho', 'Bogor', '1988-05-19', 'Jl. Pajajaran No. 6, Bogor', 'fajar.nugroho@email.com', '081234567015', '2026-09-16 04:51:04', '2026-09-16 04:51:04'),
(23, 'Indah Permata', 'Malang', '1995-11-23', 'Jl. Ijen No. 14, Malang', 'indah.permata@email.com', '081234567016', '2026-09-16 04:51:04', '2026-09-16 04:51:04'),
(24, 'Yoga Prasetyo', 'Solo', '1990-03-08', 'Jl. Slamet Riyadi No. 17, Solo', 'yoga.prasetyo@email.com', '081234567017', '2026-09-16 04:51:04', '2026-09-16 04:51:04'),
(25, 'Citra Ayu', 'Cirebon', '1994-07-30', 'Jl. Siliwangi No. 4, Cirebon', 'citra.ayu@email.com', '081234567018', '2026-09-16 04:51:04', '2026-09-16 04:51:04'),
(26, 'Rizky Ramadhan', 'Tangerang', '1992-09-16', 'Jl. Jenderal Sudirman No. 28, Tangerang', 'rizky.ramadhan@email.com', '081234567019', '2026-09-16 04:51:04', '2026-09-16 04:51:04'),
(27, 'Putri Wulandari', 'Bekasi', '1996-02-14', 'Jl. Ahmad Yani No. 13, Bekasi', 'putri.wulandari@email.com', '081234567020', '2026-09-16 04:51:04', '2026-09-16 04:51:04'),
(28, 'Aditya Kurniawan', 'Depok', '1989-06-27', 'Jl. Margonda No. 21, Depok', 'aditya.kurniawan@email.com', '081234567021', '2026-09-16 04:51:04', '2026-09-16 04:51:04'),
(29, 'Sari Dewi', 'Samarinda', '1993-10-11', 'Jl. Mulawarman No. 16, Samarinda', 'sari.dewi@email.com', '081234567022', '2026-09-16 04:51:04', '2026-09-16 04:51:04'),
(30, 'Eko Prasetyo', 'Banjarmasin', '1991-04-03', 'Jl. A. Yani No. 19, Banjarmasin', 'eko.prasetyo@email.com', '081234567023', '2026-09-16 04:51:04', '2026-09-16 04:51:04'),
(31, 'Wulan Sari', 'Mataram', '1995-12-29', 'Jl. Pejanggik No. 8, Mataram', 'wulan.sari@email.com', '081234567024', '2026-09-16 04:51:04', '2026-09-16 04:51:04'),
(32, 'Taufik Hidayat', 'Kupang', '1987-08-17', 'Jl. El Tari No. 2, Kupang', 'taufik.hidayat@email.com', '081234567025', '2026-09-16 04:51:04', '2026-09-16 04:51:04'),
(33, 'Ayu Lestari', 'Ambon', '1994-05-06', 'Jl. Pattimura No. 24, Ambon', 'ayu.lestari@email.com', '081234567026', '2026-09-16 04:51:04', '2026-09-16 04:51:04'),
(34, 'Rendi Saputra', 'Jayapura', '1990-11-13', 'Jl. Yos Sudarso No. 27, Jayapura', 'rendi.saputra@email.com', '081234567027', '2026-09-16 04:51:04', '2026-09-16 04:51:04'),
(35, 'Melati Kusuma', 'Batam', '1992-01-22', 'Jl. Engku Putri No. 10, Batam', 'melati.kusuma@email.com', '081234567028', '2026-09-16 04:51:04', '2026-09-16 04:51:04'),
(36, 'Arif Budiman', 'Bandar Lampung', '1988-09-04', 'Jl. Raden Intan No. 12, Bandar Lampung', 'arif.budiman@email.com', '081234567029', '2026-09-16 04:51:04', '2026-09-16 04:51:04'),
(37, 'Nadia Safira', 'Jambi', '1996-06-15', 'Jl. Sultan Thaha No. 5, Jambi', 'nadia.safira@email.com', '081234567030', '2026-09-16 04:51:04', '2026-09-16 04:51:04');

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `pegawai_id` int(11) DEFAULT NULL,
  `nama_lengkap` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('super admin','admin','supervisor','user','guest') NOT NULL DEFAULT 'user',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `foto_profil` varchar(255) DEFAULT NULL,
  `nomor_hp` varchar(20) DEFAULT NULL,
  `keterangan` text DEFAULT NULL,
  `is_guest` tinyint(1) DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id`, `pegawai_id`, `nama_lengkap`, `email`, `password`, `role`, `created_at`, `updated_at`, `foto_profil`, `nomor_hp`, `keterangan`, `is_guest`, `is_active`) VALUES
(1, 13, 'CEO Ultima', 'superadmin@galeria.com', '$2a$12$GZxcV0xlojxkuo5PxA1yw.WCFnXW724TCCFJLljkGzI08vs6sZ1h.', 'super admin', '2026-06-11 09:54:11', '2026-09-28 09:42:56', '/uploads/profiles/profile-1790477854271-789885295.webp', NULL, NULL, 0, 1),
(17, 28, 'Aditya Kurniawan', 'aditya.kurniawan@email.com', '$2b$10$s9Tso4Ry9A2jh4GX7WRuYu7aLlF7KPi9WmvCAxUb3/2nvJ2kGgH2e', 'user', '2026-09-16 04:53:50', '2026-10-07 07:32:55', NULL, NULL, NULL, 0, 1),
(18, 20, 'Bayu Pratama', 'bayu.pratama@email.com', '$2b$10$lNq5IgWQVpT9X6n63TqZVuJLhFvZO9RXrT8uh3yzm0HxzOdCk/0M.', 'supervisor', '2026-09-16 04:54:36', '2026-09-16 04:54:36', NULL, NULL, NULL, 0, 1);

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `aksesoris`
--
ALTER TABLE `aksesoris`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `kode_aksesoris` (`kode_aksesoris`),
  ADD KEY `user_id` (`user_id`);

--
-- Indeks untuk tabel `aksesoris_units`
--
ALTER TABLE `aksesoris_units`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `kode_unit` (`kode_unit`),
  ADD KEY `aksesoris_id` (`aksesoris_id`),
  ADD KEY `idx_kondisi` (`kondisi`),
  ADD KEY `idx_status_pinjam` (`status_pinjam`);

--
-- Indeks untuk tabel `assets`
--
ALTER TABLE `assets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `kode_aset` (`kode_aset`),
  ADD UNIQUE KEY `no_sn` (`no_sn`),
  ADD KEY `fk_asset_user` (`user_id`);

--
-- Indeks untuk tabel `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `peminjaman`
--
ALTER TABLE `peminjaman`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `kode_pinjam` (`kode_pinjam`),
  ADD KEY `fk_user_peminjaman` (`user_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indeks untuk tabel `asset_units`
--
ALTER TABLE `asset_units`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `kode_unit` (`kode_unit`),
  ADD KEY `asset_id` (`asset_id`),
  ADD KEY `idx_kondisi` (`kondisi`),
  ADD KEY `idx_status_pinjam` (`status_pinjam`);

--
-- Indeks untuk tabel `peminjaman_items`
--
ALTER TABLE `peminjaman_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `peminjaman_id` (`peminjaman_id`),
  ADD KEY `asset_id` (`asset_id`),
  ADD KEY `unit_id` (`unit_id`),
  ADD KEY `fk_peminjaman_items_aksesoris` (`aksesoris_id`),
  ADD KEY `idx_asset_aksesoris` (`asset_id`,`aksesoris_id`);

--
-- Indeks untuk tabel `tbl_pegawai`
--
ALTER TABLE `tbl_pegawai`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_nama_email` (`nama_lengkap`,`email`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `fk_users_pegawai` (`pegawai_id`),
  ADD KEY `idx_role_active` (`role`,`is_active`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `aksesoris`
--
ALTER TABLE `aksesoris`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;

--
-- AUTO_INCREMENT untuk tabel `aksesoris_units`
--
ALTER TABLE `aksesoris_units`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `assets`
--
ALTER TABLE `assets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=65;

--
-- AUTO_INCREMENT untuk tabel `asset_units`
--
ALTER TABLE `asset_units`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=198;

--
-- AUTO_INCREMENT untuk tabel `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=78;

--
-- AUTO_INCREMENT untuk tabel `peminjaman`
--
ALTER TABLE `peminjaman`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT untuk tabel `peminjaman_items`
--
ALTER TABLE `peminjaman_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT untuk tabel `tbl_pegawai`
--
ALTER TABLE `tbl_pegawai`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `aksesoris`
--
ALTER TABLE `aksesoris`
  ADD CONSTRAINT `aksesoris_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `aksesoris_units`
--
ALTER TABLE `aksesoris_units`
  ADD CONSTRAINT `fk_aksesoris_units_aksesoris` FOREIGN KEY (`aksesoris_id`) REFERENCES `aksesoris` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `assets`
--
ALTER TABLE `assets`
  ADD CONSTRAINT `fk_asset_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Ketidakleluasaan untuk tabel `asset_units`
--
ALTER TABLE `asset_units`
  ADD CONSTRAINT `fk_asset_units_asset` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `peminjaman`
--
ALTER TABLE `peminjaman`
  ADD CONSTRAINT `fk_user_peminjaman` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `peminjaman_items`
--
ALTER TABLE `peminjaman_items`
  ADD CONSTRAINT `fk_peminjaman_items_aksesoris` FOREIGN KEY (`aksesoris_id`) REFERENCES `aksesoris` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `peminjaman_items_ibfk_1` FOREIGN KEY (`peminjaman_id`) REFERENCES `peminjaman` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `peminjaman_items_ibfk_2` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`id`),
  ADD CONSTRAINT `fk_peminjaman_items_unit` FOREIGN KEY (`unit_id`) REFERENCES `asset_units` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_pegawai` FOREIGN KEY (`pegawai_id`) REFERENCES `tbl_pegawai` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
