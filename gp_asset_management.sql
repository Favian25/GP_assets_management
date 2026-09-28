-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Waktu pembuatan: 28 Sep 2026 pada 09.24
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
  `tanggal_pembelian` date DEFAULT NULL,
  `kondisi` enum('Siap Digunakan','Sedang Dipinjam','Rusak','Rusak Berat','Maintenance','Dijual') DEFAULT 'Siap Digunakan',
  `lokasi` varchar(255) DEFAULT NULL,
  `jenis_aset` enum('Galeria Studio','Galeria Production') DEFAULT NULL,
  `gambar` varchar(500) DEFAULT NULL,
  `keterangan` text DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `aksesoris`
--

INSERT INTO `aksesoris` (`id`, `kode_aksesoris`, `nama_aksesoris`, `kategori`, `merek`, `model`, `jumlah_unit`, `jumlah_total`, `harga_aset`, `tanggal_pembelian`, `kondisi`, `lokasi`, `jenis_aset`, `gambar`, `keterangan`, `user_id`, `created_at`, `updated_at`) VALUES
(3, 'ACC-GS-001', 'Matador ', 'matador ', NULL, 'Stand tv bawah ', 2, 2, NULL, NULL, 'Siap Digunakan', 'Gudang ', 'Galeria Studio', '/uploads/aksesoris-1782113128906-799255324.webp', 'sudah termasuk perekat untuk tvnya ', NULL, '2026-06-22 07:23:06', '2026-06-22 07:25:29'),
(4, 'ACC-GPRO-001', 'Stand Tv Warna putih ', 'Stand Tv putih ', NULL, 'Berdiri', 2, 2, NULL, NULL, 'Siap Digunakan', 'Gudang ', 'Galeria Production', '/uploads/aksesoris-1782113324883-981953466.webp', 'tidak termasuk perekat tv nya ', NULL, '2026-06-22 07:28:45', '2026-06-29 10:26:56'),
(5, 'ACC-GS-002', 'Kabel Genset', 'Kabel Genset', NULL, NULL, 1, 1, NULL, NULL, 'Siap Digunakan', 'Gudang', 'Galeria Studio', '/uploads/aksesoris-1782717049362-150997086.webp', NULL, NULL, '2026-06-29 07:10:50', '2026-06-29 10:26:31'),
(6, 'ACC-GPRO-002', 'Kabel Hdmi 1 M', 'KABEL HDMI', 'VENTION ', 'HDMI TO HDMI 1 M', 2, 2, NULL, NULL, 'Siap Digunakan', 'Dalam box krisbow di ruangan editing lemari atas', 'Galeria Production', '/uploads/aksesoris-1782717602695-639086677.webp', NULL, NULL, '2026-06-29 07:20:03', '2026-07-01 07:53:02'),
(7, 'ACC-GS-003', 'Kabel Hdmi 1,5 M ', 'KABEL HDMI', 'VENTION ', 'HDMI TO HDMI ukuran 1,5 M', 2, 2, NULL, NULL, 'Siap Digunakan', 'Dalam box krisbow di ruangan editing lemari atas', 'Galeria Studio', '/uploads/aksesoris-1782717804366-743995769.webp', NULL, NULL, '2026-06-29 07:23:25', '2026-07-01 07:52:42'),
(8, 'ACC-GPRO-003', 'Kabel Hdmi  2 M ', 'KABEL HDMI', 'VENTION ', 'HDMI TO HDMI 2 M', 1, 1, NULL, NULL, 'Siap Digunakan', 'Didalam box krisbow ruangan editing lemari ataz ', 'Galeria Production', '/uploads/aksesoris-1782717985619-391757426.webp', NULL, NULL, '2026-06-29 07:26:26', '2026-07-01 07:52:52'),
(9, 'ACC-GS-004', 'Kabel Usb B To Usb A', 'Kabel usb', NULL, 'USB A TO USB B ', 1, 1, NULL, NULL, 'Siap Digunakan', 'Didalam box krisbow di ruangan editing lemari atas', 'Galeria Studio', '/uploads/aksesoris-1782718108747-714905909.webp', NULL, NULL, '2026-06-29 07:28:29', '2026-07-01 07:50:36'),
(10, 'ACC-GPRO-004', 'Kabel usb ', 'Kabel usb', 'UGREEN', 'USB A TO USB A', 1, 1, NULL, NULL, 'Siap Digunakan', 'Didalam box krisbow di ruangan editing lemari atas ', 'Galeria Production', '/uploads/aksesoris-1782718205794-302566125.webp', NULL, NULL, '2026-06-29 07:30:07', '2026-06-29 07:30:07'),
(11, 'ACC-GS-005', 'Tripod Flash Takara ', 'STAND FLASH ', 'TAKARA', 'SPIRIT-1', 3, 3, NULL, NULL, 'Siap Digunakan', 'Di Ruangan Produksi', 'Galeria Studio', '/uploads/aksesoris-1782892664260-562202897.webp', NULL, NULL, '2026-07-01 07:57:44', '2026-07-01 07:57:44'),
(12, 'ACC-GPRO-005', 'Stand NX200 Kuning Benro', 'Stand kamera', 'BENRO', 'KH25P', 1, 1, NULL, NULL, 'Siap Digunakan', 'Diruangan Produksi ', 'Galeria Production', '/uploads/aksesoris-1782893088458-32527721.webp', 'Stand Tanpa Tas ', NULL, '2026-07-01 08:04:48', '2026-07-01 08:04:48'),
(13, 'ACC-GS-006', 'STAND FLASH No Brand', 'STAND FLASH ', NULL, 'No Brand ', 2, 2, NULL, NULL, 'Siap Digunakan', 'Di Ruangan Produksi', 'Galeria Studio', '/uploads/aksesoris-1782893827051-502251738.webp', 'Agak macet ', NULL, '2026-07-01 08:17:07', '2026-07-01 08:17:07'),
(14, 'ACC-GPRO-006', 'Lensa Zeis 35 F1,4 ', 'LENSA ', 'ZEIS', 'ZEIS', 1, 1, NULL, NULL, 'Siap Digunakan', 'Lemari di dalam ruangan editing ', 'Galeria Production', '/uploads/aksesoris-1782894375675-822251233.webp', NULL, NULL, '2026-07-01 08:26:16', '2026-07-01 08:26:16'),
(15, 'ACC-GS-007', 'Lensa Samyang 35 F1,8', 'LENSA ', 'SAMYANG', 'Samyang', 2, 2, NULL, NULL, 'Siap Digunakan', 'Di ruangan editing di lemari ', 'Galeria Studio', '/uploads/aksesoris-1782894487375-474606763.webp', NULL, NULL, '2026-07-01 08:28:07', '2026-07-01 08:28:07'),
(16, 'ACC-GPRO-007', 'Lensa Sony 85 F 1.8', 'LENSA ', 'SONY ', 'Sony', 1, 1, NULL, NULL, 'Siap Digunakan', 'Di Ruangan Editing Lemari ', 'Galeria Production', '/uploads/aksesoris-1782909689123-948022068.webp', NULL, NULL, '2026-07-01 12:41:29', '2026-07-01 12:41:29'),
(17, 'ACC-GS-008', 'Lensa 18 F 2.8', 'LENSA ', 'SAMYANG', 'SAMYANG', 1, 1, NULL, NULL, 'Siap Digunakan', 'Di lemari ruangan editing', 'Galeria Studio', '/uploads/aksesoris-1782909793123-773230285.webp', NULL, NULL, '2026-07-01 12:43:13', '2026-07-01 12:43:13'),
(18, 'ACC-GPRO-008', 'Lensa Samyang V-AF 35 F 1.9', 'LENSA ', 'SAMYANG', 'V-AF ', 1, 1, NULL, NULL, 'Siap Digunakan', 'Di lemari ruangan editing', 'Galeria Production', '/uploads/aksesoris-1782909931593-890360454.webp', NULL, NULL, '2026-07-01 12:45:31', '2026-07-01 12:45:31'),
(19, 'ACC-GS-009', 'Lensa Sony 35 F 1.8', 'LENSA ', 'SONY ', 'ZEIS', 1, 1, NULL, NULL, 'Siap Digunakan', 'Di ruangan editing di lemari', 'Galeria Studio', '/uploads/aksesoris-1782910065475-409865535.webp', NULL, NULL, '2026-07-01 12:47:45', '2026-07-01 12:47:45'),
(20, 'ACC-GPRO-009', 'Lensa Samyang 75 F 1.8  ', 'LENSA ', 'SAMYANG', 'SAMYANG', 1, 1, NULL, NULL, 'Siap Digunakan', 'Di ruangan editing di lemari', 'Galeria Production', '/uploads/aksesoris-1782910283112-596668372.webp', 'Tutup lensa bawah nya agak kendor', NULL, '2026-07-01 12:51:23', '2026-07-01 12:51:23'),
(21, 'ACC-GS-010', 'Lensa Zeis 25 F 2', 'LENSA ', 'ZEIS', 'Batis 2/25', 1, 1, NULL, NULL, 'Siap Digunakan', 'Di ruangan editing di lemari ', 'Galeria Studio', '/uploads/aksesoris-1782910430846-651171844.webp', NULL, NULL, '2026-07-01 12:53:51', '2026-07-01 12:53:51'),
(22, 'ACC-GPRO-010', 'Lensa Fish eye 7,5 F2.8', 'LENSA ', NULL, '7Artisans', 1, 1, NULL, NULL, 'Siap Digunakan', 'Di ruangan editing dalam lemari ', 'Galeria Production', '/uploads/aksesoris-1782910594831-165897737.webp', NULL, NULL, '2026-07-01 12:56:35', '2026-07-01 12:56:35'),
(23, 'ACC-GS-011', 'hardcase parled', 'hardcase', 'Non Merk', 'box', 2, 2, 1100000, NULL, 'Siap Digunakan', 'Gudang Galeria Production', 'Galeria Studio', '/uploads/aksesoris-1782957484178-154044960.webp', 'Box Hardcase ukuran 80 × 50 x 40', NULL, '2026-07-02 01:58:04', '2026-09-18 08:08:44'),
(24, 'ACC-GPRO-011', 'HARDCASE SOUND HUPER', 'hardcase', 'Non Merk', 'Box', 2, 2, 1400000, NULL, 'Siap Digunakan', 'Gudang Galeria', 'Galeria Production', NULL, NULL, NULL, '2026-07-02 01:59:33', '2026-09-18 08:13:18'),
(25, 'ACC-GS-012', 'HARDCASE FOLLOWSPOT', 'hardcase', NULL, 'box', 1, 1, 1500000, NULL, 'Siap Digunakan', 'gudang production', 'Galeria Studio', '/uploads/aksesoris-1782957754262-243930616.webp', 'Box hardcase ukuran 70 x 37 x 45', NULL, '2026-07-02 02:02:34', '2026-09-22 06:49:05'),
(26, 'ACC-GPRO-012', 'HARDCASE PARLED', 'hardcase', 'Non Merk', 'box', 2, 2, 1100000, NULL, 'Siap Digunakan', 'gudang galeria production', 'Galeria Production', '/uploads/aksesoris-1782957936267-996623935.webp', 'dimensi 80 x 50 x 40', NULL, '2026-07-02 02:05:36', '2026-09-18 08:13:18'),
(27, 'ACC-GS-013', 'HARDCASE TV 43\"', 'hardcase', 'Non Merk', 'box', 1, 1, 1700000, NULL, 'Siap Digunakan', 'gudang galeria', 'Galeria Studio', '/uploads/aksesoris-1782958143035-625919983.webp', 'ukuran box 102 x 26 x 63', NULL, '2026-07-02 02:09:03', '2026-09-18 07:25:08'),
(28, 'ACC-GPRO-013', 'HARDCASE BEAM', 'hardcase', 'Lunar', '260 v2', 2, 2, 1000000, NULL, 'Siap Digunakan', 'gudang galeria production', 'Galeria Production', '/uploads/aksesoris-1782958320967-765305831.webp', 'dimensi 60 x 50 x 35', NULL, '2026-07-02 02:12:01', '2026-09-18 07:57:12'),
(29, 'ACC-GS-014', 'HARDCASE TV 50\"', 'hardcase', 'Non Merk', 'box', 1, 1, 1900000, NULL, 'Siap Digunakan', 'gudang galeria', 'Galeria Studio', '/uploads/aksesoris-1782958374854-480234277.webp', 'ukuran hardcase P,116 x L,34 x T84', NULL, '2026-07-02 02:12:55', '2026-09-18 01:25:33'),
(30, 'ACC-GPRO-014', 'HARDCASE STOP KONTAK', 'hardcase', 'Non Merk', NULL, 2, 2, 900000, NULL, 'Siap Digunakan', 'gudang galeria production', 'Galeria Production', '/uploads/aksesoris-1782958509049-929864566.webp', '60 x 50 x 40', NULL, '2026-07-02 02:15:10', '2026-09-18 01:25:33'),
(31, 'ACC-GS-015', 'hardcase stop kontak', 'hardcase', 'Non Merk', NULL, 2, 2, 900000, NULL, 'Siap Digunakan', 'gudang galeria production', 'Galeria Studio', '/uploads/aksesoris-1782958520728-546200409.webp', '60 x 50 x 40', NULL, '2026-07-02 02:15:21', '2026-09-18 01:25:33'),
(32, 'ACC-GPRO-015', 'hardcase stop kontak', 'hardcase', 'Non Merk', NULL, 2, 2, 900000, NULL, 'Siap Digunakan', 'gudang galeria production', 'Galeria Production', '/uploads/aksesoris-1782958535358-838054979.webp', '60 x 50 x 40', NULL, '2026-07-02 02:15:36', '2026-09-22 06:49:05'),
(33, 'ACC-GS-016', 'HARDCASE TV 65\"', 'hardcase', 'Non Merk', 'box', 1, 1, 2200000, NULL, 'Siap Digunakan', 'gudang galeria ', 'Galeria Studio', '/uploads/aksesoris-1782958736049-238645002.webp', 'ukuran box P,165 x L,38 x T,97', NULL, '2026-07-02 02:18:56', '2026-09-18 08:13:18'),
(34, 'ACC-GPRO-016', 'SD CARD - 06 - MM', 'CARD 64', 'SANDISK', '64 / 200', 1, 1, NULL, NULL, 'Siap Digunakan', 'Admin / CA', 'Galeria Production', '/uploads/aksesoris-1782977149075-677206067.webp', NULL, NULL, '2026-07-02 07:25:49', '2026-07-02 07:25:49'),
(35, 'ACC-GS-017', 'SD CARD - 07 - DYS', 'CARD 64', 'SANDISK', '64 / 170', 1, 1, NULL, NULL, 'Siap Digunakan', 'Admin / CS', 'Galeria Studio', '/uploads/aksesoris-1782978320571-550648901.webp', NULL, NULL, '2026-07-02 07:45:21', '2026-07-02 07:45:21'),
(36, 'ACC-GPRO-017', 'SD CARD - 05 - AGF', 'CARD 64', 'SANDISK', '64 / 200', 1, 1, NULL, NULL, 'Siap Digunakan', 'Admin / CS', 'Galeria Production', '/uploads/aksesoris-1782978473130-186968453.webp', NULL, NULL, '2026-07-02 07:47:53', '2026-07-02 07:47:53'),
(37, 'ACC-GS-018', 'SD CARD - 10 ', 'CARD 32', 'SANDISK', '32 / 100', 1, 1, NULL, NULL, 'Siap Digunakan', 'Cs / Admin', 'Galeria Studio', '/uploads/aksesoris-1782978782740-354959613.webp', NULL, NULL, '2026-07-02 07:53:03', '2026-07-02 07:53:03'),
(38, 'ACC-GPRO-018', 'SD CARD - 11 ', 'CARD 32', 'SANDISK', '32 / 45', 1, 1, NULL, NULL, 'Siap Digunakan', 'Cs / Admin', 'Galeria Production', '/uploads/aksesoris-1782979189749-19698610.webp', NULL, NULL, '2026-07-02 07:59:50', '2026-07-02 07:59:50'),
(39, 'ACC-GS-019', 'SD CARD - 12', 'CARD 32', 'SANDISK', '32 / 45', 1, 1, NULL, NULL, 'Siap Digunakan', 'Admin / CS', 'Galeria Studio', '/uploads/aksesoris-1782979299276-685732357.webp', NULL, NULL, '2026-07-02 08:01:39', '2026-07-02 08:01:39'),
(40, 'ACC-GPRO-019', 'SD CARD - 13 ', 'CARD 32', 'SANDISK', '32 / 45', 1, 1, NULL, NULL, 'Siap Digunakan', 'Admin / CS', 'Galeria Production', '/uploads/aksesoris-1782979397203-138038223.webp', NULL, NULL, '2026-07-02 08:03:17', '2026-07-02 08:03:17'),
(41, 'ACC-GS-020', 'SD CARD - 14', 'CARD 32', 'SANDISK', '32 / 45', 1, 1, NULL, NULL, 'Siap Digunakan', 'Admin / CS', 'Galeria Studio', '/uploads/aksesoris-1782979513736-294198248.webp', NULL, NULL, '2026-07-02 08:05:14', '2026-07-02 08:05:14'),
(42, 'ACC-GPRO-020', 'SD CARD - 16', 'CARD 64', 'SANDISK', '64 / 150', 1, 1, NULL, NULL, 'Siap Digunakan', 'Admin / CS', 'Galeria Production', '/uploads/aksesoris-1783066457432-353378327.webp', NULL, NULL, '2026-07-03 08:14:18', '2026-07-03 08:14:18'),
(43, 'ACC-GS-021', 'STAND TRIPOD LIGHTING', 'STAND TRIPOD', 'Non Merk', 'Tripod Lighting 3M', 4, 4, 1100000, NULL, 'Siap Digunakan', 'Gudang Galeria Production', 'Galeria Studio', '/uploads/aksesoris-1783132625357-946634537.webp', 'Jumlah 4 Unit Ready', NULL, '2026-07-04 02:37:05', '2026-07-04 02:37:05'),
(44, 'ACC-GPRO-021', 'KABEL LAN 100M', 'KABEL LAN', 'SONY ', 'LAN 100M', 2, 2, 750000, NULL, 'Siap Digunakan', 'GUDANG GALERIA', 'Galeria Production', '/uploads/aksesoris-1783138492248-687516695.webp', 'UNIT 1 SIAP DIGUNAKAN\nUNIT 2 SIAP DIGUNAKAN', NULL, '2026-07-04 04:14:52', '2026-09-23 03:39:04'),
(45, 'ACC-GS-022', 'KABEL LAN 50M', 'KABEL LAN', 'Non Merk', 'LAN 50M', 4, 4, 500000, NULL, 'Siap Digunakan', 'GUDANG GALERIA PRODUCTION', 'Galeria Studio', NULL, 'UNIT 1 SIAP DIGUNAKAN\nUNIT 2 SIAP DIGUNAKAN\nUNIT 3 SIAP DIGUNAKAN\nUNIT 4 SIAP DIGUNAKAN', NULL, '2026-07-04 04:29:49', '2026-09-28 06:48:27');

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
  `kondisi` enum('Siap Digunakan','Sedang Dipinjam','Rusak','Rusak Berat','Maintenance','Dijual') DEFAULT 'Siap Digunakan',
  `unit` varchar(100) DEFAULT NULL,
  `gambar` varchar(255) DEFAULT NULL,
  `keterangan` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `jumlah` int(11) DEFAULT NULL,
  `harga_aset` decimal(15,2) DEFAULT NULL,
  `jumlah_total` int(11) DEFAULT NULL,
  `tanggal_pembelian` date DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `assets`
--

INSERT INTO `assets` (`id`, `kode_aset`, `nama_aset`, `pengguna`, `kategori`, `merek`, `model`, `no_sn`, `spesifikasi`, `lokasi_aset`, `jenis_aset`, `kondisi`, `unit`, `gambar`, `keterangan`, `created_at`, `updated_at`, `jumlah`, `harga_aset`, `jumlah_total`, `tanggal_pembelian`, `user_id`) VALUES
(22, 'AST-GS-CAM-001', 'CAM1', 'Aurelia Karisma', 'Kamera', 'Lunar', 'PRO', 'CAM001', 'Tahan Air', 'Gudang', 'Galeria Studio', 'Siap Digunakan', NULL, '/uploads/asset-1789632878259-979804529.webp', NULL, '2026-09-17 08:14:38', '2026-09-26 07:25:53', 3, 13000000.00, 3, '2025-02-18', NULL),
(23, 'AST-GPRO-ORBI-001', 'Orbit', NULL, 'ORBIT', 'TELKOMSEL', 'TLKM01', 'TLKM2017251', '100000 mbps', 'Etalase', 'Galeria Production', 'Maintenance', NULL, '/uploads/asset-1790060004132-744283738.webp', NULL, '2026-09-22 06:53:27', '2026-09-26 07:24:20', 2, 500000.00, 2, '2026-09-22', NULL),
(24, 'AST-GS-VPROC-001', 'Video Processor Roland V-160HD', 'Tim Produksi', 'Video Processor', 'ROLAND', 'V-160HD', 'RLD2024001', '12 input HDMI, 2 output', 'Ruangan Produksi', 'Galeria Studio', 'Siap Digunakan', NULL, NULL, 'Kondisi normal, siap dipakai untuk produksi', '2026-09-28 08:00:00', '2026-09-28 08:00:00', 1, 45000000.00, 1, '2024-03-10', NULL),
(25, 'AST-GPRO-CAM-001', 'Sony A7IV', 'Rizky Pratama', 'Kamera', 'SONY', 'A7IV', 'SNA7IV2025001', '33MP Full Frame, 4K 60fps', 'Ruangan Produksi', 'Galeria Production', 'Sedang Dipinjam', NULL, NULL, 'Sedang digunakan untuk project video klip band lokal', '2026-09-28 08:05:00', '2026-09-28 08:05:00', 1, 32000000.00, 1, '2025-01-15', NULL),
(26, 'AST-GS-PRIN-001', 'Printer Epson L3210', NULL, 'Printer', 'EPSON', 'L3210', 'EPL32102025001', 'Print, Scan, Copy, A4', 'Ruangan Editing', 'Galeria Studio', 'Maintenance', NULL, NULL, 'Cartridge tersumbat, sedang dalam proses pembersihan', '2026-09-28 08:10:00', '2026-09-28 08:10:00', 1, 2500000.00, 1, '2025-06-20', NULL),
(27, 'AST-GPRO-RECO-001', 'Zoom H6 Recorder', NULL, 'Recorder Kecil', 'ZOOM', 'H6', 'ZMH62024001', '6 track, XLR/TRS combo input', 'Lemari Gudang', 'Galeria Production', 'Rusak', NULL, NULL, 'Tombol record tidak berfungsi, perlu penggantian komponen', '2026-09-28 08:15:00', '2026-09-28 08:15:00', 1, 4800000.00, 1, '2024-08-05', NULL);

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
(122, 1, 'super admin', 'UPDATE', 'Aksesoris', '44', 'Memperbarui aksesoris: KABEL LAN 100M (ACC-GPRO-021)', '2026-09-17 03:05:32'),
(123, 1, 'super admin', 'UPDATE', 'Aset', '12', 'Memperbarui aset: KABEL SNAKE 16 CHANNEL (AST-GS-006)', '2026-09-17 06:14:42'),
(124, 1, 'super admin', 'UPDATE', 'Aset', '12', 'Memperbarui aset: KABEL SNAKE 16 CHANNEL (AST-GS-006)', '2026-09-17 06:14:56'),
(125, 1, 'super admin', 'DELETE', 'Aset', '12', 'Menghapus aset: KABEL SNAKE 16 CHANNEL (AST-GS-006)', '2026-09-17 06:18:07'),
(126, 1, 'super admin', 'DELETE', 'Aset', '10', 'Menghapus aset: Printer Narsis Booth (AST-GS-005)', '2026-09-17 06:18:51'),
(127, 1, 'super admin', 'DELETE', 'Aset', '13', 'Menghapus aset: MIC QA Electronic (AST-GPRO-006)', '2026-09-17 06:21:21'),
(128, 1, 'super admin', 'DELETE', 'Aset', '11', 'Menghapus aset: Audio Interface (AST-GPRO-005)', '2026-09-17 06:21:23'),
(129, 1, 'super admin', 'DELETE', 'Aset', '9', 'Menghapus aset: Video Switcher  (AST-GPRO-004)', '2026-09-17 06:21:25'),
(130, 1, 'super admin', 'DELETE', 'Aset', '8', 'Menghapus aset: Orbit kecil  (AST-GS-004)', '2026-09-17 06:21:27'),
(131, 1, 'super admin', 'DELETE', 'Aset', '7', 'Menghapus aset: Zoom Recoder 03 (AST-GPRO-003)', '2026-09-17 06:21:29'),
(132, 1, 'super admin', 'DELETE', 'Aset', '6', 'Menghapus aset: Zoom Recorder kecil 02 (AST-GS-003)', '2026-09-17 06:21:30'),
(133, 1, 'super admin', 'DELETE', 'Aset', '5', 'Menghapus aset: Zoom Recoder kecil 01 (AST-GPRO-002)', '2026-09-17 06:21:33'),
(134, 1, 'super admin', 'DELETE', 'Aset', '4', 'Menghapus aset: Zoom Recorder Besar  (AST-GS-002)', '2026-09-17 06:21:35'),
(135, 1, 'super admin', 'DELETE', 'Aset', '3', 'Menghapus aset: Orbit Besar  (AST-GPRO-001)', '2026-09-17 06:21:37'),
(136, 1, 'super admin', 'DELETE', 'Aset', '2', 'Menghapus aset: Video Processor Colorlight X4m (AST-GS-001)', '2026-09-17 06:21:38'),
(137, 1, 'super admin', 'CREATE', 'Aset', NULL, 'Menambahkan aset: MIC 1 (GKM-MIC-001)', '2026-09-17 06:37:13'),
(138, 1, 'super admin', 'UPDATE', 'Aset', '19', 'Memperbarui aset: MIC 1 (GKM-MIC-001)', '2026-09-17 06:37:56'),
(139, 1, 'super admin', 'DELETE', 'Aset', '19', 'Menghapus aset: MIC 1 (GKM-MIC-001)', '2026-09-17 06:44:19'),
(140, 1, 'super admin', 'CREATE', 'Aset', NULL, 'Menambahkan aset: MIC 1 (AST-GS-001)', '2026-09-17 06:46:22'),
(141, 1, 'super admin', 'CREATE', 'Aset', NULL, 'Menambahkan aset: MIC 2 (AST-GPRO-001)', '2026-09-17 06:57:26'),
(142, 1, 'super admin', 'UPDATE', 'Aset', '21', 'Mengubah kondisi aset AST-GPRO-001 menjadi: Rusak', '2026-09-17 06:59:43'),
(143, 1, 'super admin', 'DELETE', 'Aset', '21', 'Menghapus aset: MIC 2 (AST-GPRO-001)', '2026-09-17 08:12:55'),
(144, 1, 'super admin', 'DELETE', 'Aset', '20', 'Menghapus aset: MIC 1 (AST-GS-001)', '2026-09-17 08:12:56'),
(145, 1, 'super admin', 'CREATE', 'Aset', NULL, 'Menambahkan aset: CAM1 (AST-GS-CAM-001)', '2026-09-17 08:14:38'),
(146, 17, 'Aditya Kurniawan', 'CREATE', 'Peminjaman', NULL, 'Membuat peminjaman baru (GKM-PJM-1) untuk Aditya Kurniawan', '2026-09-17 08:41:19'),
(147, 19, 'Citra Ayu', 'UPDATE', 'Peminjaman', '5', 'Melakukan approve/verifikasi peminjaman: GKM-PJM-1', '2026-09-17 08:47:39'),
(148, 1, 'super admin', 'DELETE', 'Peminjaman', '5', 'Menghapus peminjaman: GKM-PJM-1', '2026-09-18 01:06:46'),
(149, 20, 'Aurelia Karisma', 'CREATE', 'Peminjaman', NULL, 'Membuat peminjaman baru (GKM-PJM-1) untuk Aurelia Karisma', '2026-09-18 01:22:36'),
(150, 1, 'super admin', 'UPDATE', 'Peminjaman', '6', 'Melakukan approve/verifikasi peminjaman: GKM-PJM-1', '2026-09-18 01:23:23'),
(151, 1, 'super admin', 'DELETE', 'Peminjaman', '6', 'Menghapus peminjaman: GKM-PJM-1', '2026-09-18 01:25:33'),
(152, 20, 'Aurelia Karisma', 'CREATE', 'Peminjaman', NULL, 'Membuat peminjaman baru (GKM-PJM-1) untuk Aurelia Karisma', '2026-09-18 01:26:02'),
(153, 1, 'super admin', 'UPDATE', 'Peminjaman', '7', 'Melakukan approve/verifikasi peminjaman: GKM-PJM-1', '2026-09-18 01:40:46'),
(154, 20, 'Aurelia Karisma', 'UPDATE', 'Peminjaman', '7', 'Memperbarui peminjaman: GKM-PJM-1', '2026-09-18 01:51:22'),
(155, 1, 'super admin', 'DELETE', 'Peminjaman', '7', 'Menghapus peminjaman: GKM-PJM-1', '2026-09-18 06:53:45'),
(156, 20, 'Aurelia Karisma', 'CREATE', 'Peminjaman', NULL, 'Membuat peminjaman baru (GKM-PJM-1) untuk Aurelia Karisma', '2026-09-18 06:55:27'),
(157, 1, 'super admin', 'DELETE', 'Peminjaman', '8', 'Menghapus peminjaman: GKM-PJM-1', '2026-09-18 07:25:08'),
(158, 20, 'Aurelia Karisma', 'CREATE', 'Peminjaman', NULL, 'Membuat peminjaman baru (GKM-PJM-1) untuk Aurelia Karisma', '2026-09-18 07:27:05'),
(159, 1, 'super admin', 'UPDATE', 'Peminjaman', '9', 'Melakukan approve/verifikasi peminjaman: GKM-PJM-1', '2026-09-18 07:46:05'),
(160, 20, 'Aurelia Karisma', 'UPDATE', 'Peminjaman', '9', 'Memperbarui peminjaman: GKM-PJM-1', '2026-09-18 07:53:15'),
(161, 1, 'super admin', 'UPDATE', 'Peminjaman', '9', 'Melakukan approve/verifikasi peminjaman: GKM-PJM-1', '2026-09-18 07:57:12'),
(162, 1, 'super admin', 'DELETE', 'Peminjaman', '9', 'Menghapus peminjaman: GKM-PJM-1', '2026-09-18 07:57:38'),
(163, 20, 'Aurelia Karisma', 'CREATE', 'Peminjaman', NULL, 'Membuat peminjaman baru (GKM-PJM-1) untuk Aurelia Karisma', '2026-09-18 07:58:08'),
(164, 1, 'super admin', 'UPDATE', 'Peminjaman', '10', 'Melakukan approve/verifikasi peminjaman: GKM-PJM-1', '2026-09-18 07:59:47'),
(165, 20, 'Aurelia Karisma', 'UPDATE', 'Peminjaman', '10', 'Memperbarui peminjaman: GKM-PJM-1', '2026-09-18 08:00:09'),
(166, 1, 'super admin', 'UPDATE', 'Peminjaman', '10', 'Melakukan approve/verifikasi peminjaman: GKM-PJM-1', '2026-09-18 08:00:26'),
(167, 1, 'super admin', 'DELETE', 'Peminjaman', '10', 'Menghapus peminjaman: GKM-PJM-1', '2026-09-18 08:07:22'),
(168, 20, 'Aurelia Karisma', 'CREATE', 'Peminjaman', NULL, 'Membuat peminjaman baru (GKM-PJM-1) untuk Aurelia Karisma', '2026-09-18 08:07:53'),
(169, 1, 'super admin', 'UPDATE', 'Peminjaman', '11', 'Melakukan approve/verifikasi peminjaman: GKM-PJM-1', '2026-09-18 08:08:03'),
(170, 20, 'Aurelia Karisma', 'UPDATE', 'Peminjaman', '11', 'Memperbarui peminjaman: GKM-PJM-1', '2026-09-18 08:08:25'),
(171, 1, 'super admin', 'UPDATE', 'Peminjaman', '11', 'Melakukan approve/verifikasi peminjaman: GKM-PJM-1', '2026-09-18 08:08:44'),
(172, 1, 'super admin', 'DELETE', 'Peminjaman', '11', 'Menghapus peminjaman: GKM-PJM-1', '2026-09-18 08:11:46'),
(173, 20, 'Aurelia Karisma', 'CREATE', 'Peminjaman', NULL, 'Membuat peminjaman baru (GKM-PJM-1) untuk Aurelia Karisma', '2026-09-18 08:12:21'),
(174, 1, 'super admin', 'UPDATE', 'Peminjaman', '12', 'Melakukan approve/verifikasi peminjaman: GKM-PJM-1', '2026-09-18 08:12:37'),
(175, 1, 'super admin', 'UPDATE', 'Peminjaman', '12', 'Memperbarui peminjaman: GKM-PJM-1', '2026-09-18 08:12:57'),
(176, 1, 'super admin', 'UPDATE', 'Peminjaman', '12', 'Melakukan approve/verifikasi peminjaman: GKM-PJM-1', '2026-09-18 08:13:18'),
(177, 1, 'super admin', 'DELETE', 'Peminjaman', '12', 'Menghapus peminjaman: GKM-PJM-1', '2026-09-22 03:27:52'),
(178, 17, 'Aditya Kurniawan', 'CREATE', 'Peminjaman', NULL, 'Membuat peminjaman baru (GKM-PJM-1) untuk Aditya Kurniawan', '2026-09-22 03:28:36'),
(179, 18, 'Bayu Pratama', 'UPDATE', 'Peminjaman', '13', 'Melakukan approve/verifikasi peminjaman: GKM-PJM-1', '2026-09-22 03:30:19'),
(180, 17, 'Aditya Kurniawan', 'UPDATE', 'Peminjaman', '13', 'Memperbarui peminjaman: GKM-PJM-1', '2026-09-22 03:32:06'),
(181, 1, 'super admin', 'UPDATE', 'Peminjaman', '13', 'Melakukan approve/verifikasi peminjaman: GKM-PJM-1', '2026-09-22 03:35:58'),
(182, 17, 'Aditya Kurniawan', 'CREATE', 'Peminjaman', NULL, 'Membuat peminjaman baru (GKM-PJM-2) untuk Aditya Kurniawan', '2026-09-22 03:46:07'),
(183, 1, 'super admin', 'UPDATE', 'Peminjaman', '14', 'Melakukan approve/verifikasi peminjaman: GKM-PJM-2', '2026-09-22 04:15:55'),
(184, 17, 'Aditya Kurniawan', 'UPDATE', 'Peminjaman', '14', 'Memperbarui peminjaman: GKM-PJM-2', '2026-09-22 04:16:58'),
(185, 18, 'Bayu Pratama', 'UPDATE', 'Peminjaman', '14', 'Melakukan approve/verifikasi peminjaman: GKM-PJM-2', '2026-09-22 04:17:38'),
(186, 1, 'super admin', 'DELETE', 'Peminjaman', '14', 'Menghapus peminjaman: GKM-PJM-2', '2026-09-22 06:35:18'),
(187, 1, 'super admin', 'DELETE', 'Peminjaman', '13', 'Menghapus peminjaman: GKM-PJM-1', '2026-09-22 06:35:21'),
(188, 21, 'Aditya Kurniawan', 'CREATE', 'Peminjaman', NULL, 'Membuat peminjaman baru (GKM-PJM-1) untuk Aditya Kurniawan', '2026-09-22 06:37:31'),
(189, 23, 'Eko Prasetyo', 'UPDATE', 'Peminjaman', '16', 'Melakukan approve/verifikasi peminjaman: GKM-PJM-1', '2026-09-22 06:38:51'),
(190, 21, 'Aditya Kurniawan', 'UPDATE', 'Peminjaman', '16', 'Memperbarui peminjaman: GKM-PJM-1', '2026-09-22 06:40:51'),
(191, 23, 'Eko Prasetyo', 'UPDATE', 'Peminjaman', '16', 'Melakukan approve/verifikasi peminjaman: GKM-PJM-1', '2026-09-22 06:42:28'),
(192, 24, 'test', 'CREATE', 'Peminjaman', NULL, 'Membuat peminjaman baru (GKM-PJM-2) untuk test', '2026-09-22 06:44:34'),
(193, 23, 'Eko Prasetyo', 'UPDATE', 'Peminjaman', '17', 'Melakukan approve/verifikasi peminjaman: GKM-PJM-2', '2026-09-22 06:47:51'),
(194, 24, 'test', 'UPDATE', 'Peminjaman', '17', 'Memperbarui peminjaman: GKM-PJM-2', '2026-09-22 06:48:40'),
(195, 23, 'Eko Prasetyo', 'UPDATE', 'Peminjaman', '17', 'Melakukan approve/verifikasi peminjaman: GKM-PJM-2', '2026-09-22 06:49:05'),
(196, 1, 'Superadmin', 'CREATE', 'Aset', NULL, 'Menambahkan aset: Orbit (AST-GPRO-ORBI-001)', '2026-09-22 06:53:27'),
(197, 22, 'Budi Santoso', 'CREATE', 'Peminjaman', NULL, 'Membuat peminjaman baru (GKM-PJM-3) untuk Budi Santoso', '2026-09-23 03:33:43'),
(198, 1, 'Superadmin', 'UPDATE', 'Peminjaman', '18', 'Melakukan approve/verifikasi peminjaman: GKM-PJM-3', '2026-09-23 03:38:10'),
(199, 22, 'Budi Santoso', 'UPDATE', 'Peminjaman', '18', 'Memperbarui peminjaman: GKM-PJM-3', '2026-09-23 03:38:33'),
(200, 1, 'Superadmin', 'UPDATE', 'Peminjaman', '18', 'Melakukan approve/verifikasi peminjaman: GKM-PJM-3', '2026-09-23 03:39:04'),
(201, 1, 'Superadmin', 'UPDATE', 'Aset', '23', 'Mengubah kondisi aset AST-GPRO-ORBI-001 menjadi: Rusak', '2026-09-26 07:20:43'),
(202, 1, 'Superadmin', 'UPDATE', 'Aset', '23', 'Mengubah kondisi aset AST-GPRO-ORBI-001 menjadi: Maintenance', '2026-09-26 07:23:13'),
(203, 1, 'Superadmin', 'UPDATE', 'Aset', '23', 'Mengubah kondisi aset AST-GPRO-ORBI-001 menjadi: Siap Digunakan', '2026-09-26 07:23:43'),
(204, 1, 'Superadmin', 'UPDATE', 'Aset', '23', 'Mengubah kondisi aset AST-GPRO-ORBI-001 menjadi: Maintenance', '2026-09-26 07:24:20'),
(205, 1, 'Superadmin', 'UPDATE', 'Aset', '22', 'Mengubah kondisi aset AST-GS-CAM-001 menjadi: Rusak', '2026-09-26 07:24:40'),
(206, 1, 'Superadmin', 'UPDATE', 'Aset', '22', 'Mengubah kondisi aset AST-GS-CAM-001 menjadi: Rusak Berat', '2026-09-26 07:24:51'),
(207, 1, 'Superadmin', 'UPDATE', 'Aset', '22', 'Mengubah kondisi aset AST-GS-CAM-001 menjadi: Siap Digunakan', '2026-09-26 07:25:53'),
(208, 1, 'Superadmin', 'UPDATE', 'Aksesoris', '45', 'Mengubah kondisi aksesoris ACC-GS-022 menjadi: Maintenance', '2026-09-28 06:48:12'),
(209, 1, 'Superadmin', 'UPDATE', 'Aksesoris', '45', 'Mengubah kondisi aksesoris ACC-GS-022 menjadi: Siap Digunakan', '2026-09-28 06:48:27');

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
(20, 'peminjaman_baru', 'Aditya Kurniawan membuat peminjaman baru (GKM-PJM-1)', NULL, 'super admin,admin,supervisor', 1, '2026-09-17 08:41:19'),
(21, 'stok_rendah_aset', 'Stok CAM1 tersisa 1 unit', 22, 'super admin,admin', 1, '2026-09-17 08:41:19'),
(22, 'approved', 'Peminjaman GKM-PJM-1 telah disetujui untuk dipinjam oleh Citra Ayu [Peminjam: Aditya Kurniawan] [By: Aditya Kurniawan]', 5, 'super admin,admin,supervisor,user', 1, '2026-09-17 08:47:39'),
(23, 'peminjaman_baru', 'Aurelia Karisma membuat peminjaman baru (GKM-PJM-1)', NULL, 'super admin,admin,supervisor', 1, '2026-09-18 01:22:36'),
(24, 'stok_rendah_aks', 'Stok HARDCASE BEAM tersisa 1 unit', 28, 'super admin,admin', 1, '2026-09-18 01:22:36'),
(25, 'stok_rendah_aks', 'Stok HARDCASE FOLLOWSPOT tersisa 0 unit', 25, 'super admin,admin', 1, '2026-09-18 01:22:36'),
(26, 'stok_rendah_aks', 'Stok hardcase parled tersisa 1 unit', 23, 'super admin,admin', 1, '2026-09-18 01:22:36'),
(27, 'stok_rendah_aks', 'Stok HARDCASE PARLED tersisa 1 unit', 26, 'super admin,admin', 1, '2026-09-18 01:22:36'),
(28, 'stok_rendah_aks', 'Stok HARDCASE SOUND HUPER tersisa 1 unit', 24, 'super admin,admin', 1, '2026-09-18 01:22:36'),
(29, 'stok_rendah_aks', 'Stok hardcase stop kontak tersisa 1 unit', 32, 'super admin,admin', 1, '2026-09-18 01:22:36'),
(30, 'stok_rendah_aks', 'Stok hardcase stop kontak tersisa 1 unit', 31, 'super admin,admin', 1, '2026-09-18 01:22:36'),
(31, 'stok_rendah_aks', 'Stok HARDCASE STOP KONTAK tersisa 1 unit', 30, 'super admin,admin', 1, '2026-09-18 01:22:36'),
(32, 'stok_rendah_aks', 'Stok HARDCASE TV 43\" tersisa 0 unit', 27, 'super admin,admin', 1, '2026-09-18 01:22:36'),
(33, 'stok_rendah_aks', 'Stok HARDCASE TV 50\" tersisa 0 unit', 29, 'super admin,admin', 1, '2026-09-18 01:22:36'),
(34, 'stok_rendah_aks', 'Stok HARDCASE TV 65\" tersisa 0 unit', 33, 'super admin,admin', 1, '2026-09-18 01:22:36'),
(35, 'approved', 'Peminjaman GKM-PJM-1 telah disetujui untuk dipinjam oleh super admin [Peminjam: Aurelia Karisma] [By: Aurelia Karisma]', 6, 'super admin,admin,supervisor,user', 1, '2026-09-18 01:23:23'),
(36, 'peminjaman_baru', 'Aurelia Karisma membuat peminjaman baru (GKM-PJM-1)', NULL, 'super admin,admin,supervisor', 1, '2026-09-18 01:26:02'),
(37, 'stok_rendah_aks', 'Stok HARDCASE BEAM tersisa 1 unit', 28, 'super admin,admin', 1, '2026-09-18 01:26:02'),
(38, 'stok_rendah_aks', 'Stok HARDCASE FOLLOWSPOT tersisa 0 unit', 25, 'super admin,admin', 1, '2026-09-18 01:26:02'),
(39, 'stok_rendah_aks', 'Stok HARDCASE TV 65\" tersisa 0 unit', 33, 'super admin,admin', 1, '2026-09-18 01:26:02'),
(40, 'approved', 'Peminjaman GKM-PJM-1 telah disetujui untuk dipinjam oleh super admin [Peminjam: Aurelia Karisma] [By: Aurelia Karisma]', 7, 'super admin,admin,supervisor,user', 1, '2026-09-18 01:40:46'),
(41, 'dikembalikan', 'Peminjaman GKM-PJM-1 menunggu verifikasi pengembalian dari Aurelia Karisma', 7, 'super admin,admin,supervisor', 1, '2026-09-18 01:51:22'),
(42, 'peminjaman_baru', 'Aurelia Karisma membuat peminjaman baru (GKM-PJM-1)', NULL, 'super admin,admin,supervisor', 1, '2026-09-18 06:55:27'),
(43, 'stok_rendah_aks', 'Stok KABEL LAN 50M tersisa 3 unit', 45, 'super admin,admin', 1, '2026-09-18 06:55:27'),
(44, 'stok_rendah_aks', 'Stok HARDCASE TV 43\" tersisa 0 unit', 27, 'super admin,admin', 1, '2026-09-18 06:55:27'),
(45, 'peminjaman_baru', 'Aurelia Karisma membuat peminjaman baru (GKM-PJM-1)', NULL, 'super admin,admin,supervisor', 1, '2026-09-18 07:27:05'),
(46, 'stok_rendah_aks', 'Stok HARDCASE BEAM tersisa 1 unit', 28, 'super admin,admin', 1, '2026-09-18 07:27:05'),
(47, 'stok_rendah_aks', 'Stok HARDCASE FOLLOWSPOT tersisa 0 unit', 25, 'super admin,admin', 1, '2026-09-18 07:27:05'),
(48, 'approved', 'Peminjaman GKM-PJM-1 telah disetujui untuk dipinjam oleh super admin [Peminjam: Aurelia Karisma] [By: Aurelia Karisma]', 9, 'super admin,admin,supervisor,user', 1, '2026-09-18 07:46:05'),
(49, 'dikembalikan', 'Peminjaman GKM-PJM-1 menunggu verifikasi pengembalian dari Aurelia Karisma', 9, 'super admin,admin,supervisor', 1, '2026-09-18 07:53:15'),
(50, 'approved', 'Peminjaman GKM-PJM-1 telah diverifikasi pengembaliannya oleh super admin [Peminjam: Aurelia Karisma] [By: Aurelia Karisma]', 9, 'super admin,admin,supervisor,user', 1, '2026-09-18 07:57:12'),
(51, 'peminjaman_baru', 'Aurelia Karisma membuat peminjaman baru (GKM-PJM-1)', NULL, 'super admin,admin,supervisor', 1, '2026-09-18 07:58:08'),
(52, 'stok_rendah_aks', 'Stok hardcase parled tersisa 1 unit', 23, 'super admin,admin', 1, '2026-09-18 07:58:08'),
(53, 'approved', 'Peminjaman GKM-PJM-1 telah disetujui untuk dipinjam oleh super admin [Peminjam: Aurelia Karisma] [By: Aurelia Karisma]', 10, 'super admin,admin,supervisor,user', 1, '2026-09-18 07:59:47'),
(54, 'dikembalikan', 'Peminjaman GKM-PJM-1 menunggu verifikasi pengembalian dari Aurelia Karisma', 10, 'super admin,admin,supervisor', 1, '2026-09-18 08:00:09'),
(55, 'approved', 'Peminjaman GKM-PJM-1 telah diverifikasi pengembaliannya oleh super admin [Peminjam: Aurelia Karisma] [By: Aurelia Karisma]', 10, 'super admin,admin,supervisor,user', 1, '2026-09-18 08:00:26'),
(56, 'peminjaman_baru', 'Aurelia Karisma membuat peminjaman baru (GKM-PJM-1)', NULL, 'super admin,admin,supervisor', 1, '2026-09-18 08:07:53'),
(57, 'stok_rendah_aks', 'Stok hardcase parled tersisa 1 unit', 23, 'super admin,admin', 1, '2026-09-18 08:07:53'),
(58, 'stok_rendah_aks', 'Stok HARDCASE PARLED tersisa 1 unit', 26, 'super admin,admin', 1, '2026-09-18 08:07:53'),
(59, 'approved', 'Peminjaman GKM-PJM-1 telah disetujui untuk dipinjam oleh super admin [Peminjam: Aurelia Karisma] [By: Aurelia Karisma]', 11, 'super admin,admin,supervisor,user', 1, '2026-09-18 08:08:03'),
(60, 'dikembalikan', 'Peminjaman GKM-PJM-1 menunggu verifikasi pengembalian dari Aurelia Karisma', 11, 'super admin,admin,supervisor', 1, '2026-09-18 08:08:25'),
(61, 'approved', 'Peminjaman GKM-PJM-1 telah diverifikasi pengembaliannya oleh super admin [Peminjam: Aurelia Karisma] [By: Aurelia Karisma]', 11, 'super admin,admin,supervisor,user', 1, '2026-09-18 08:08:44'),
(62, 'peminjaman_baru', 'Aurelia Karisma membuat peminjaman baru (GKM-PJM-1)', NULL, 'super admin,admin,supervisor', 1, '2026-09-18 08:12:21'),
(63, 'stok_rendah_aks', 'Stok HARDCASE SOUND HUPER tersisa 1 unit', 24, 'super admin,admin', 1, '2026-09-18 08:12:21'),
(64, 'stok_rendah_aks', 'Stok HARDCASE PARLED tersisa 1 unit', 26, 'super admin,admin', 1, '2026-09-18 08:12:21'),
(65, 'stok_rendah_aks', 'Stok HARDCASE TV 65\" tersisa 0 unit', 33, 'super admin,admin', 1, '2026-09-18 08:12:21'),
(66, 'approved', 'Peminjaman GKM-PJM-1 telah disetujui untuk dipinjam oleh super admin [Peminjam: Aurelia Karisma] [By: Aurelia Karisma]', 12, 'super admin,admin,supervisor,user', 1, '2026-09-18 08:12:37'),
(67, 'dikembalikan', 'Peminjaman GKM-PJM-1 menunggu verifikasi pengembalian dari Aurelia Karisma', 12, 'super admin,admin,supervisor', 1, '2026-09-18 08:12:57'),
(68, 'approved', 'Peminjaman GKM-PJM-1 telah diverifikasi pengembaliannya oleh super admin [Peminjam: Aurelia Karisma] [By: Aurelia Karisma]', 12, 'super admin,admin,supervisor,user', 1, '2026-09-18 08:13:18'),
(69, 'peminjaman_baru', 'Aditya Kurniawan membuat peminjaman baru (GKM-PJM-1)', NULL, 'super admin,admin,supervisor', 1, '2026-09-22 03:28:36'),
(70, 'stok_rendah_aset', 'Stok CAM1 tersisa 2 unit', 22, 'super admin,admin', 1, '2026-09-22 03:28:36'),
(71, 'approved', 'Peminjaman GKM-PJM-1 telah disetujui untuk dipinjam oleh Bayu Pratama [Peminjam: Aditya Kurniawan] [By: Aditya Kurniawan]', 13, 'super admin,admin,supervisor,user', 1, '2026-09-22 03:30:19'),
(72, 'dikembalikan', 'Peminjaman GKM-PJM-1 menunggu verifikasi pengembalian dari Aditya Kurniawan', 13, 'super admin,admin,supervisor', 1, '2026-09-22 03:32:06'),
(73, 'approved', 'Peminjaman GKM-PJM-1 telah diverifikasi pengembaliannya oleh super admin [Peminjam: Aditya Kurniawan] [By: Aditya Kurniawan]', 13, 'super admin,admin,supervisor,user', 1, '2026-09-22 03:35:58'),
(74, 'peminjaman_baru', 'Aditya Kurniawan membuat peminjaman baru (GKM-PJM-2)', NULL, 'super admin,admin,supervisor', 1, '2026-09-22 03:46:07'),
(75, 'stok_rendah_aset', 'Stok CAM1 tersisa 0 unit', 22, 'super admin,admin', 1, '2026-09-22 03:46:07'),
(76, 'approved', 'Peminjaman GKM-PJM-2 telah disetujui untuk dipinjam oleh super admin [Peminjam: Aditya Kurniawan] [By: Aditya Kurniawan]', 14, 'super admin,admin,supervisor,user', 1, '2026-09-22 04:15:55'),
(77, 'dikembalikan', 'Peminjaman GKM-PJM-2 menunggu verifikasi pengembalian dari Aditya Kurniawan', 14, 'super admin,admin,supervisor', 1, '2026-09-22 04:16:58'),
(78, 'approved', 'Peminjaman GKM-PJM-2 telah diverifikasi pengembaliannya oleh Bayu Pratama [Peminjam: Aditya Kurniawan] [By: Aditya Kurniawan]', 14, 'super admin,admin,supervisor,user', 1, '2026-09-22 04:17:38'),
(79, 'peminjaman_baru', 'Aditya Kurniawan membuat peminjaman baru (GKM-PJM-1)', NULL, 'super admin,admin,supervisor', 1, '2026-09-22 06:37:31'),
(80, 'stok_rendah_aset', 'Stok CAM1 tersisa 2 unit', 22, 'super admin,admin', 1, '2026-09-22 06:37:31'),
(81, 'approved', 'Peminjaman GKM-PJM-1 telah disetujui untuk dipinjam oleh Eko Prasetyo [Peminjam: Aditya Kurniawan] [By: Aditya Kurniawan]', 16, 'super admin,admin,supervisor,user', 1, '2026-09-22 06:38:51'),
(82, 'dikembalikan', 'Peminjaman GKM-PJM-1 menunggu verifikasi pengembalian dari Aditya Kurniawan', 16, 'super admin,admin,supervisor', 1, '2026-09-22 06:40:51'),
(83, 'approved', 'Peminjaman GKM-PJM-1 telah diverifikasi pengembaliannya oleh Eko Prasetyo [Peminjam: Aditya Kurniawan] [By: Aditya Kurniawan]', 16, 'super admin,admin,supervisor,user', 1, '2026-09-22 06:42:28'),
(84, 'peminjaman_baru', 'test membuat peminjaman baru (GKM-PJM-2)', NULL, 'super admin,admin,supervisor', 1, '2026-09-22 06:44:34'),
(85, 'stok_rendah_aset', 'Stok CAM1 tersisa 2 unit', 22, 'super admin,admin', 1, '2026-09-22 06:44:34'),
(86, 'stok_rendah_aks', 'Stok hardcase stop kontak tersisa 1 unit', 32, 'super admin,admin', 1, '2026-09-22 06:44:34'),
(87, 'stok_rendah_aks', 'Stok HARDCASE FOLLOWSPOT tersisa 0 unit', 25, 'super admin,admin', 1, '2026-09-22 06:44:34'),
(88, 'approved', 'Peminjaman GKM-PJM-2 telah disetujui untuk dipinjam oleh Eko Prasetyo [Peminjam: test] [By: test]', 17, 'super admin,admin,supervisor,user', 1, '2026-09-22 06:47:51'),
(89, 'dikembalikan', 'Peminjaman GKM-PJM-2 menunggu verifikasi pengembalian dari test', 17, 'super admin,admin,supervisor', 1, '2026-09-22 06:48:40'),
(90, 'approved', 'Peminjaman GKM-PJM-2 telah diverifikasi pengembaliannya oleh Eko Prasetyo [Peminjam: test] [By: test]', 17, 'super admin,admin,supervisor,user', 1, '2026-09-22 06:49:05'),
(91, 'peminjaman_baru', 'Budi Santoso membuat peminjaman baru (GKM-PJM-3)', NULL, 'super admin,admin,supervisor', 1, '2026-09-23 03:33:43'),
(92, 'stok_rendah_aset', 'Stok CAM1 tersisa 2 unit', 22, 'super admin,admin', 1, '2026-09-23 03:33:43'),
(93, 'stok_rendah_aks', 'Stok KABEL LAN 100M tersisa 1 unit', 44, 'super admin,admin', 1, '2026-09-23 03:33:43'),
(94, 'approved', 'Peminjaman GKM-PJM-3 telah disetujui untuk dipinjam oleh Superadmin [Peminjam: Budi Santoso] [By: Budi Santoso]', 18, 'super admin,admin,supervisor,user', 1, '2026-09-23 03:38:10'),
(95, 'dikembalikan', 'Peminjaman GKM-PJM-3 menunggu verifikasi pengembalian dari Budi Santoso', 18, 'super admin,admin,supervisor', 1, '2026-09-23 03:38:33'),
(96, 'approved', 'Peminjaman GKM-PJM-3 telah diverifikasi pengembaliannya oleh Superadmin [Peminjam: Budi Santoso] [By: Budi Santoso]', 18, 'super admin,admin,supervisor,user', 1, '2026-09-23 03:39:04');

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
  `keperluan_list` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`keperluan_list`)),
  `tanggal_peminjaman` datetime NOT NULL,
  `tanggal_pengembalian` datetime DEFAULT NULL,
  `status` enum('Menunggu Persetujuan','Sedang Dipinjam','Menunggu Verifikasi','Peminjaman Selesai') DEFAULT 'Menunggu Persetujuan',
  `yang_menyerahkan` varchar(255) DEFAULT NULL,
  `approved_by` varchar(255) DEFAULT NULL,
  `return_approved_by` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `bukti_peminjaman` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`bukti_peminjaman`)),
  `bukti_pengembalian` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`bukti_pengembalian`)),
  `user_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `peminjaman`
--

INSERT INTO `peminjaman` (`id`, `kode_pinjam`, `nama_peminjam`, `penerima_aset`, `alasan_peminjaman`, `keperluan_list`, `tanggal_peminjaman`, `tanggal_pengembalian`, `status`, `yang_menyerahkan`, `approved_by`, `return_approved_by`, `created_at`, `updated_at`, `bukti_peminjaman`, `bukti_pengembalian`, `user_id`) VALUES
(16, 'GKM-PJM-1', 'Aditya Kurniawan', 'Eko Prasetyo', 'Ngonten', '[{\"keperluan\":\"Ngonten\"}]', '2026-09-22 13:37:31', '2026-09-22 13:40:51', 'Peminjaman Selesai', 'Hahaha', 'Eko Prasetyo', 'Eko Prasetyo', '2026-09-22 06:37:31', '2026-09-22 06:42:28', NULL, NULL, 21),
(17, 'GKM-PJM-2', 'test', 'Eko Prasetyo', 'Mancing', '[{\"keperluan\":\"Mancing\"}]', '2026-09-22 13:44:34', '2026-09-22 13:48:40', 'Peminjaman Selesai', 'Budi Santoso', 'Eko Prasetyo', 'Eko Prasetyo', '2026-09-22 06:44:34', '2026-09-22 06:49:05', NULL, NULL, 24),
(18, 'GKM-PJM-3', 'Budi Santoso', 'Eko Prasetyo', 'Horeg', '[{\"keperluan\":\"Horeg\"}]', '2026-09-23 10:33:40', '2026-09-23 10:38:32', 'Peminjaman Selesai', 'Superadmin', 'Superadmin', 'Superadmin', '2026-09-23 03:33:43', '2026-09-23 03:39:04', '[\"/uploads/bukti_pinjam-1790134423583-333736515-0.webp\"]', '[\"/uploads/bukti_kembali-1790134713284-827547964-0.webp\"]', 22);

-- --------------------------------------------------------

--
-- Struktur dari tabel `peminjaman_items`
--

CREATE TABLE `peminjaman_items` (
  `id` int(11) NOT NULL,
  `peminjaman_id` int(11) NOT NULL,
  `asset_id` int(11) DEFAULT NULL,
  `aksesoris_id` int(11) DEFAULT NULL,
  `jumlah` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `peminjaman_items`
--

INSERT INTO `peminjaman_items` (`id`, `peminjaman_id`, `asset_id`, `aksesoris_id`, `jumlah`) VALUES
(34, 16, 22, NULL, 1),
(35, 17, 22, NULL, 1),
(36, 17, NULL, 32, 1),
(37, 17, NULL, 25, 1),
(38, 18, 22, NULL, 1),
(39, 18, NULL, 44, 1);

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
(16, 'Doni Saputra', 'Denpasar', '1990-07-14', 'Jl. Sunset Road No. 7, Denpasar', 'doni.saputra@email.com', '081234567009', '2026-09-16 04:51:04', '2026-09-16 04:51:04'),
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
(1, 13, 'Superadmin', 'superadmin@galeria.com', '$2b$12$v06p2QHKpbBXmdrl5XnG0Oe81ib/L6sWJsWCHHZA5E60M/drvp9WW', 'super admin', '2026-06-11 09:54:11', '2026-09-22 06:34:54', '/uploads/profiles/profile-1790058894151-527895862.webp', NULL, NULL, 0, 1),
(21, 28, 'Aditya Kurniawan', 'user@user.com', '$2b$10$Qg3dC8ias.K4pKXClsqa.usReqc5spF9YT1T0ToMxRApcwZ1p4cxG', 'user', '2026-09-22 06:26:20', '2026-09-22 06:26:20', NULL, NULL, NULL, 0, 1),
(22, 8, 'Budi Santoso', 'admin@admin.com', '$2b$10$Ui7KYmG.VB6QDH2I/Hy0wefjiKoLPZ2B8BC5gZfhXwAIFWj/TPJG.', 'admin', '2026-09-22 06:27:00', '2026-09-22 06:27:00', NULL, NULL, NULL, 0, 1),
(23, 30, 'Eko Prasetyo', 'supervisor@supervisor.com', '$2b$10$gY8eNZMlDaUHJsl6qxvrjusfDj4tGtB.OXBZlIxu1WXkemH7b1x6O', 'supervisor', '2026-09-22 06:27:43', '2026-09-22 06:27:43', NULL, NULL, NULL, 0, 1),
(24, NULL, 'test', 'test@test.com', '$2b$10$IkgLaupR1.YNz0keJZfiU.gnniGlFdSN1ivjifZulWGW4Ppw7Jf8q', 'user', '2026-09-22 06:32:02', '2026-09-22 06:32:02', NULL, '0812312312121', 'Magang STikom', 0, 1);

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
-- Indeks untuk tabel `peminjaman_items`
--
ALTER TABLE `peminjaman_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `peminjaman_id` (`peminjaman_id`),
  ADD KEY `asset_id` (`asset_id`),
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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- AUTO_INCREMENT untuk tabel `assets`
--
ALTER TABLE `assets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT untuk tabel `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=210;

--
-- AUTO_INCREMENT untuk tabel `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=97;

--
-- AUTO_INCREMENT untuk tabel `peminjaman`
--
ALTER TABLE `peminjaman`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT untuk tabel `peminjaman_items`
--
ALTER TABLE `peminjaman_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT untuk tabel `tbl_pegawai`
--
ALTER TABLE `tbl_pegawai`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `aksesoris`
--
ALTER TABLE `aksesoris`
  ADD CONSTRAINT `aksesoris_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `assets`
--
ALTER TABLE `assets`
  ADD CONSTRAINT `fk_asset_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

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
  ADD CONSTRAINT `peminjaman_items_ibfk_2` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`id`);

--
-- Ketidakleluasaan untuk tabel `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_pegawai` FOREIGN KEY (`pegawai_id`) REFERENCES `tbl_pegawai` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
