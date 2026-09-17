-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Sep 16, 2026 at 08:16 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";

START TRANSACTION;

SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */
;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */
;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */
;
/*!40101 SET NAMES utf8mb4 */
;

--
-- Database: `gp_asset_management`
--

-- --------------------------------------------------------

--
-- Table structure for table `aksesoris`
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
    `kondisi` enum(
        'Siap Digunakan',
        'Rusak',
        'Rusak Berat',
        'Maintenance',
        'Dijual'
    ) DEFAULT 'Siap Digunakan',
    `lokasi` varchar(255) DEFAULT NULL,
    `jenis_aset` enum(
        'Galeria Studio',
        'Galeria Production'
    ) DEFAULT NULL,
    `gambar` varchar(500) DEFAULT NULL,
    `keterangan` text DEFAULT NULL,
    `user_id` int(11) DEFAULT NULL,
    `created_at` timestamp NULL DEFAULT current_timestamp(),
    `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

--
-- Dumping data for table `aksesoris`
--

INSERT INTO
    `aksesoris` (
        `id`,
        `kode_aksesoris`,
        `nama_aksesoris`,
        `kategori`,
        `merek`,
        `model`,
        `jumlah_unit`,
        `jumlah_total`,
        `harga_aset`,
        `tanggal_pembelian`,
        `kondisi`,
        `lokasi`,
        `jenis_aset`,
        `gambar`,
        `keterangan`,
        `user_id`,
        `created_at`,
        `updated_at`
    )
VALUES (3, 'AKS-STD-001', 'Matador ', 'matador ', NULL, 'Stand tv bawah ', 2, 2, 1500000, NULL, 'Siap Digunakan', 'Gudang ', 'Galeria Studio', '/uploads/aksesoris-1782113128906-799255324.webp', 'sudah termasuk perekat untuk tvnya ', NULL, '2026-06-22 07:23:06', '2026-06-22 07:25:29'
    ), (
        4, 'AKS-PRO-001', 'Stand Tv Warna putih ', 'Stand Tv putih ', NULL, 'Berdiri', 2, 2, 1400000, NULL, 'Siap Digunakan', 'Gudang ', 'Galeria Production', '/uploads/aksesoris-1782113324883-981953466.webp', 'tidak termasuk perekat tv nya ', NULL, '2026-06-22 07:28:45', '2026-06-29 10:26:56'
    ), (
        5, 'AKS-STD-002', 'Kabel Genset', 'Kabel Genset', NULL, NULL, 1, 1, 900000, NULL, 'Siap Digunakan', 'Gudang', 'Galeria Studio', '/uploads/aksesoris-1782717049362-150997086.webp', NULL, NULL, '2026-06-29 07:10:50', '2026-06-29 10:26:31'
    ), (
        6, 'AKS-PRO-002', 'Kabel Hdmi 1 M', 'KABEL HDMI', 'VENTION ', 'HDMI TO HDMI 1 M', 2, 2, 700000, NULL, 'Siap Digunakan', 'Dalam box krisbow di ruangan editing lemari atas', 'Galeria Production', '/uploads/aksesoris-1782717602695-639086677.webp', NULL, NULL, '2026-06-29 07:20:03', '2026-07-01 07:53:02'
    ), (
        7, 'AKS-STD-003', 'Kabel Hdmi 1,5 M ', 'KABEL HDMI', 'VENTION ', 'HDMI TO HDMI ukuran 1,5 M', 2, 2, 850000, NULL, 'Siap Digunakan', 'Dalam box krisbow di ruangan editing lemari atas', 'Galeria Studio', '/uploads/aksesoris-1782717804366-743995769.webp', NULL, NULL, '2026-06-29 07:23:25', '2026-07-01 07:52:42'
    ), (
        8, 'AKS-PRO-003', 'Kabel Hdmi  2 M ', 'KABEL HDMI', 'VENTION ', 'HDMI TO HDMI 2 M', 1, 1, 1000000, NULL, 'Siap Digunakan', 'Didalam box krisbow ruangan editing lemari ataz ', 'Galeria Production', '/uploads/aksesoris-1782717985619-391757426.webp', NULL, NULL, '2026-06-29 07:26:26', '2026-07-01 07:52:52'
    ), (
        9, 'AKS-STD-004', 'Kabel Usb B To Usb A', 'Kabel usb', NULL, 'USB A TO USB B ', 1, 1, 600000, NULL, 'Siap Digunakan', 'Didalam box krisbow di ruangan editing lemari atas', 'Galeria Studio', '/uploads/aksesoris-1782718108747-714905909.webp', NULL, NULL, '2026-06-29 07:28:29', '2026-07-01 07:50:36'
    ), (
        10, 'AKS-PRO-004', 'Kabel usb ', 'Kabel usb', 'UGREEN', 'USB A TO USB A', 1, 1, 750000, NULL, 'Siap Digunakan', 'Didalam box krisbow di ruangan editing lemari atas ', 'Galeria Production', '/uploads/aksesoris-1782718205794-302566125.webp', NULL, NULL, '2026-06-29 07:30:07', '2026-06-29 07:30:07'
    ), (
        11, 'AKS-STD-005', 'Tripod Flash Takara ', 'STAND FLASH ', 'TAKARA', 'SPIRIT-1', 3, 3, 1000000, NULL, 'Siap Digunakan', 'Di Ruangan Produksi', 'Galeria Studio', '/uploads/aksesoris-1782892664260-562202897.webp', NULL, NULL, '2026-07-01 07:57:44', '2026-07-01 07:57:44'
    ), (
        12, 'AKS-PRO-005', 'Stand NX200 Kuning Benro', 'Stand kamera', 'BENRO', 'KH25P', 1, 1, 1200000, NULL, 'Siap Digunakan', 'Diruangan Produksi ', 'Galeria Production', '/uploads/aksesoris-1782893088458-32527721.webp', 'Stand Tanpa Tas ', NULL, '2026-07-01 08:04:48', '2026-07-01 08:04:48'
    ), (
        13, 'AKS-STD-006', 'STAND FLASH No Brand', 'STAND FLASH ', NULL, 'No Brand ', 2, 2, 1200000, NULL, 'Siap Digunakan', 'Di Ruangan Produksi', 'Galeria Studio', '/uploads/aksesoris-1782893827051-502251738.webp', 'Agak macet ', NULL, '2026-07-01 08:17:07', '2026-07-01 08:17:07'
    ), (
        14, 'AKS-PRO-006', 'Lensa Zeis 35 F1,4 ', 'LENSA ', 'ZEIS', 'ZEIS', 1, 1, 6000000, NULL, 'Siap Digunakan', 'Lemari di dalam ruangan editing ', 'Galeria Production', '/uploads/aksesoris-1782894375675-822251233.webp', NULL, NULL, '2026-07-01 08:26:16', '2026-07-01 08:26:16'
    ), (
        15, 'AKS-STD-007', 'Lensa Samyang 35 F1,8', 'LENSA ', 'SAMYANG', 'Samyang', 2, 2, 8000000, NULL, 'Siap Digunakan', 'Di ruangan editing di lemari ', 'Galeria Studio', '/uploads/aksesoris-1782894487375-474606763.webp', NULL, NULL, '2026-07-01 08:28:07', '2026-07-01 08:28:07'
    ), (
        16, 'AKS-PRO-007', 'Lensa Sony 85 F 1.8', 'LENSA ', 'SONY ', 'Sony', 1, 1, 10000000, NULL, 'Siap Digunakan', 'Di Ruangan Editing Lemari ', 'Galeria Production', '/uploads/aksesoris-1782909689123-948022068.webp', NULL, NULL, '2026-07-01 12:41:29', '2026-07-01 12:41:29'
    ), (
        17, 'AKS-STD-008', 'Lensa 18 F 2.8', 'LENSA ', 'SAMYANG', 'SAMYANG', 1, 1, 12000000, NULL, 'Siap Digunakan', 'Di lemari ruangan editing', 'Galeria Studio', '/uploads/aksesoris-1782909793123-773230285.webp', NULL, NULL, '2026-07-01 12:43:13', '2026-07-01 12:43:13'
    ), (
        18, 'AKS-PRO-008', 'Lensa Samyang V-AF 35 F 1.9', 'LENSA ', 'SAMYANG', 'V-AF ', 1, 1, 14000000, NULL, 'Siap Digunakan', 'Di lemari ruangan editing', 'Galeria Production', '/uploads/aksesoris-1782909931593-890360454.webp', NULL, NULL, '2026-07-01 12:45:31', '2026-07-01 12:45:31'
    ), (
        19, 'AKS-STD-009', 'Lensa Sony 35 F 1.8', 'LENSA ', 'SONY ', 'ZEIS', 1, 1, 16000000, NULL, 'Siap Digunakan', 'Di ruangan editing di lemari', 'Galeria Studio', '/uploads/aksesoris-1782910065475-409865535.webp', NULL, NULL, '2026-07-01 12:47:45', '2026-07-01 12:47:45'
    ), (
        20, 'AKS-PRO-009', 'Lensa Samyang 75 F 1.8  ', 'LENSA ', 'SAMYANG', 'SAMYANG', 1, 1, 18000000, NULL, 'Siap Digunakan', 'Di ruangan editing di lemari', 'Galeria Production', '/uploads/aksesoris-1782910283112-596668372.webp', 'Tutup lensa bawah nya agak kendor', NULL, '2026-07-01 12:51:23', '2026-07-01 12:51:23'
    ), (
        21, 'AKS-STD-010', 'Lensa Zeis 25 F 2', 'LENSA ', 'ZEIS', 'Batis 2/25', 1, 1, 20000000, NULL, 'Siap Digunakan', 'Di ruangan editing di lemari ', 'Galeria Studio', '/uploads/aksesoris-1782910430846-651171844.webp', NULL, NULL, '2026-07-01 12:53:51', '2026-07-01 12:53:51'
    ), (
        22, 'AKS-PRO-010', 'Lensa Fish eye 7,5 F2.8', 'LENSA ', NULL, '7Artisans', 1, 1, 6000000, NULL, 'Siap Digunakan', 'Di ruangan editing dalam lemari ', 'Galeria Production', '/uploads/aksesoris-1782910594831-165897737.webp', NULL, NULL, '2026-07-01 12:56:35', '2026-07-01 12:56:35'
    ), (
        23, 'AKS-STD-011', 'hardcase parled', 'hardcase', 'Non Merk', 'box', 2, 2, 1100000, NULL, 'Siap Digunakan', 'Gudang Galeria Production', 'Galeria Studio', '/uploads/aksesoris-1782957484178-154044960.webp', 'Box Hardcase ukuran 80 × 50 x 40', NULL, '2026-07-02 01:58:04', '2026-07-02 01:58:04'
    ), (
        24, 'AKS-PRO-011', 'HARDCASE SOUND HUPER', 'hardcase', 'Non Merk', 'Box', 2, 2, 1400000, NULL, 'Siap Digunakan', 'Gudang Galeria', 'Galeria Production', NULL, NULL, NULL, '2026-07-02 01:59:33', '2026-07-04 02:04:45'
    ), (
        25, 'AKS-STD-012', 'HARDCASE FOLLOWSPOT', 'hardcase', NULL, 'box', 1, 1, 1500000, NULL, 'Siap Digunakan', 'gudang production', 'Galeria Studio', '/uploads/aksesoris-1782957754262-243930616.webp', 'Box hardcase ukuran 70 x 37 x 45', NULL, '2026-07-02 02:02:34', '2026-07-04 02:00:54'
    ), (
        26, 'AKS-PRO-012', 'HARDCASE PARLED', 'hardcase', 'Non Merk', 'box', 2, 2, 1100000, NULL, 'Siap Digunakan', 'gudang galeria production', 'Galeria Production', '/uploads/aksesoris-1782957936267-996623935.webp', 'dimensi 80 x 50 x 40', NULL, '2026-07-02 02:05:36', '2026-07-04 02:00:36'
    ), (
        27, 'AKS-STD-013', 'HARDCASE TV 43\"', 'hardcase', 'Non Merk', 'box', 1, 1, 1700000, NULL, 'Siap Digunakan', 'gudang galeria', 'Galeria Studio', '/uploads/aksesoris-1782958143035-625919983.webp', 'ukuran box 102 x 26 x 63', NULL, '2026-07-02 02:09:03', '2026-07-04 02:00:18'
    ), (
        28, 'AKS-PRO-013', 'HARDCASE BEAM', 'hardcase', 'Lunar', '260 v2', 2, 2, 1000000, NULL, 'Siap Digunakan', 'gudang galeria production', 'Galeria Production', '/uploads/aksesoris-1782958320967-765305831.webp', 'dimensi 60 x 50 x 35', NULL, '2026-07-02 02:12:01', '2026-07-04 01:59:55'
    ), (
        29, 'AKS-STD-014', 'HARDCASE TV 50\"', 'hardcase', 'Non Merk', 'box', 1, 1, 1900000, NULL, 'Siap Digunakan', 'gudang galeria', 'Galeria Studio', '/uploads/aksesoris-1782958374854-480234277.webp', 'ukuran hardcase P,116 x L,34 x T84', NULL, '2026-07-02 02:12:55', '2026-07-04 01:59:41'
    ), (
        30, 'AKS-PRO-014', 'HARDCASE STOP KONTAK', 'hardcase', 'Non Merk', NULL, 2, 2, 900000, NULL, 'Siap Digunakan', 'gudang galeria production', 'Galeria Production', '/uploads/aksesoris-1782958509049-929864566.webp', '60 x 50 x 40', NULL, '2026-07-02 02:15:10', '2026-07-04 01:59:10'
    ), (
        31, 'AKS-STD-015', 'hardcase stop kontak', 'hardcase', 'Non Merk', NULL, 2, 2, 900000, NULL, 'Siap Digunakan', 'gudang galeria production', 'Galeria Studio', '/uploads/aksesoris-1782958520728-546200409.webp', '60 x 50 x 40', NULL, '2026-07-02 02:15:21', '2026-07-02 02:15:21'
    ), (
        32, 'AKS-PRO-015', 'hardcase stop kontak', 'hardcase', 'Non Merk', NULL, 2, 2, 900000, NULL, 'Siap Digunakan', 'gudang galeria production', 'Galeria Production', '/uploads/aksesoris-1782958535358-838054979.webp', '60 x 50 x 40', NULL, '2026-07-02 02:15:36', '2026-07-02 02:15:36'
    ), (
        33, 'AKS-STD-016', 'HARDCASE TV 65\"', 'hardcase', 'Non Merk', 'box', 1, 1, 2200000, NULL, 'Siap Digunakan', 'gudang galeria ', 'Galeria Studio', '/uploads/aksesoris-1782958736049-238645002.webp', 'ukuran box P,165 x L,38 x T,97', NULL, '2026-07-02 02:18:56', '2026-07-04 01:58:44'
    ), (
        34, 'AKS-PRO-016', 'SD CARD - 06 - MM', 'CARD 64', 'SANDISK', '64 / 200', 1, 1, 800000, NULL, 'Siap Digunakan', 'Admin / CA', 'Galeria Production', '/uploads/aksesoris-1782977149075-677206067.webp', NULL, NULL, '2026-07-02 07:25:49', '2026-07-02 07:25:49'
    ), (
        35, 'AKS-STD-017', 'SD CARD - 07 - DYS', 'CARD 64', 'SANDISK', '64 / 170', 1, 1, 900000, NULL, 'Siap Digunakan', 'Admin / CS', 'Galeria Studio', '/uploads/aksesoris-1782978320571-550648901.webp', NULL, NULL, '2026-07-02 07:45:21', '2026-07-02 07:45:21'
    ), (
        36, 'AKS-PRO-017', 'SD CARD - 05 - AGF', 'CARD 64', 'SANDISK', '64 / 200', 1, 1, 1000000, NULL, 'Siap Digunakan', 'Admin / CS', 'Galeria Production', '/uploads/aksesoris-1782978473130-186968453.webp', NULL, NULL, '2026-07-02 07:47:53', '2026-07-02 07:47:53'
    ), (
        37, 'AKS-STD-018', 'SD CARD - 10 ', 'CARD 32', 'SANDISK', '32 / 100', 1, 1, 600000, NULL, 'Siap Digunakan', 'Cs / Admin', 'Galeria Studio', '/uploads/aksesoris-1782978782740-354959613.webp', NULL, NULL, '2026-07-02 07:53:03', '2026-07-02 07:53:03'
    ), (
        38, 'AKS-PRO-018', 'SD CARD - 11 ', 'CARD 32', 'SANDISK', '32 / 45', 1, 1, 700000, NULL, 'Siap Digunakan', 'Cs / Admin', 'Galeria Production', '/uploads/aksesoris-1782979189749-19698610.webp', NULL, NULL, '2026-07-02 07:59:50', '2026-07-02 07:59:50'
    ), (
        39, 'AKS-STD-019', 'SD CARD - 12', 'CARD 32', 'SANDISK', '32 / 45', 1, 1, 800000, NULL, 'Siap Digunakan', 'Admin / CS', 'Galeria Studio', '/uploads/aksesoris-1782979299276-685732357.webp', NULL, NULL, '2026-07-02 08:01:39', '2026-07-02 08:01:39'
    ), (
        40, 'AKS-PRO-019', 'SD CARD - 13 ', 'CARD 32', 'SANDISK', '32 / 45', 1, 1, 900000, NULL, 'Siap Digunakan', 'Admin / CS', 'Galeria Production', '/uploads/aksesoris-1782979397203-138038223.webp', NULL, NULL, '2026-07-02 08:03:17', '2026-07-02 08:03:17'
    ), (
        41, 'AKS-STD-020', 'SD CARD - 14', 'CARD 32', 'SANDISK', '32 / 45', 1, 1, 600000, NULL, 'Siap Digunakan', 'Admin / CS', 'Galeria Studio', '/uploads/aksesoris-1782979513736-294198248.webp', NULL, NULL, '2026-07-02 08:05:14', '2026-07-02 08:05:14'
    ), (
        42, 'AKS-PRO-020', 'SD CARD - 16', 'CARD 64', 'SANDISK', '64 / 150', 1, 1, 1100000, NULL, 'Siap Digunakan', 'Admin / CS', 'Galeria Production', '/uploads/aksesoris-1783066457432-353378327.webp', NULL, NULL, '2026-07-03 08:14:18', '2026-07-03 08:14:18'
    ), (
        43, 'AKS-STD-021', 'STAND TRIPOD LIGHTING', 'STAND TRIPOD', 'Non Merk', 'Tripod Lighting 3M', 4, 4, 1100000, NULL, 'Siap Digunakan', 'Gudang Galeria Production', 'Galeria Studio', '/uploads/aksesoris-1783132625357-946634537.webp', 'Jumlah 4 Unit Ready', NULL, '2026-07-04 02:37:05', '2026-07-04 02:37:05'
    ), (
        44, 'AKS-PRO-021', 'KABEL LAN 100M', 'KABEL LAN', NULL, 'LAN 100M', 2, 2, 750000, NULL, 'Siap Digunakan', 'GUDANG GALERIA', 'Galeria Production', '/uploads/aksesoris-1783138492248-687516695.webp', 'UNIT 1 SIAP DIGUNAKAN\nUNIT 2 SIAP DIGUNAKAN', NULL, '2026-07-04 04:14:52', '2026-07-04 04:17:05'
    ), (
        45, 'AKS-STD-022', 'KABEL LAN 50M', 'KABEL LAN', 'Non Merk', 'LAN 50M', 4, 4, 500000, NULL, 'Siap Digunakan', 'GUDANG GALERIA PRODUCTION', 'Galeria Studio', NULL, 'UNIT 1 SIAP DIGUNAKAN\nUNIT 2 SIAP DIGUNAKAN\nUNIT 3 SIAP DIGUNAKAN\nUNIT 4 SIAP DIGUNAKAN', NULL, '2026-07-04 04:29:49', '2026-09-14 07:27:46');

-- --------------------------------------------------------

--
-- Table structure for table `assets`
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
    `jenis_aset` enum(
        'Galeria Studio',
        'Galeria Production'
    ) DEFAULT NULL,
    `kondisi` enum(
        'Siap Digunakan',
        'Rusak',
        'Rusak Berat',
        'Maintenance',
        'Dijual'
    ) DEFAULT 'Siap Digunakan',
    `unit` varchar(100) DEFAULT NULL,
    `gambar` varchar(255) DEFAULT NULL,
    `keterangan` text DEFAULT NULL,
    `created_at` timestamp NULL DEFAULT current_timestamp(),
    `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    `jumlah` int(11) DEFAULT NULL,
    `harga_aset` decimal(15, 2) DEFAULT NULL,
    `jumlah_total` int(11) DEFAULT NULL,
    `tanggal_pembelian` date DEFAULT NULL,
    `user_id` int(11) DEFAULT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

--
-- Dumping data for table `assets`
--

INSERT INTO
    `assets` (
        `id`,
        `kode_aset`,
        `nama_aset`,
        `pengguna`,
        `kategori`,
        `merek`,
        `model`,
        `no_sn`,
        `spesifikasi`,
        `lokasi_aset`,
        `jenis_aset`,
        `kondisi`,
        `unit`,
        `gambar`,
        `keterangan`,
        `created_at`,
        `updated_at`,
        `jumlah`,
        `harga_aset`,
        `jumlah_total`,
        `tanggal_pembelian`,
        `user_id`
    )
VALUES (2, 'AST-STD-001', 'Video Processor Colorlight X4m', NULL, 'Video Processor ', 'Colorlight', 'X4m', 'X4m023370145', 'input : 4 LAN \r\noutput : hdmi 2, DP 1, VGA 1 ', 'Tempat Maintenace ', 'Galeria Studio', 'Siap Digunakan', NULL, '/uploads/asset-1782095780857-831620838.webp', 'input LAN no 1 rusak  terpasang di hardcase ', '2026-06-22 02:34:55', '2026-06-22 02:36:22', 1, 8500000, 1, NULL, NULL
    ), (
        3, 'AST-PRO-001', 'Orbit Besar ', NULL, 'ORBIT', 'HUAWEI', 'HUAWEI ', 'VNNDW21322000442', 'LAN : 2 \r\nWAN : 1', 'Ruangan produksi ', 'Galeria Production', 'Siap Digunakan', NULL, '/uploads/asset-1782113770794-348845295.webp', 'Didalam Hardcase Hitam Dan Termasuk Adaptornya ', '2026-06-22 07:36:11', '2026-06-22 08:55:29', 1, 3500000, 1, NULL, NULL
    ), (
        4, 'AST-STD-002', 'Zoom Recorder Besar ', NULL, 'ZOOM ', 'H4nPro', 'H4nPro ', 'B93228992', 'IN JACK 3,5 : 1\r\nIN XLR : 2', 'Ruang editing ', 'Galeria Studio', 'Siap Digunakan', NULL, '/uploads/asset-1782116142863-435897010.webp', 'Hanya Recoder Nya Saja Tanpa Kabel ', '2026-06-22 08:14:33', '2026-06-22 08:15:43', 1, 5500000, 1, NULL, NULL
    ), (
        5, 'AST-PRO-002', 'Zoom Recoder kecil 01', NULL, 'Recorder Kecil', NULL, 'H1n ', NULL, 'IN JACK 3,5 : 1\r\n', 'Ruang Editing lemari atas pc', 'Galeria Production', 'Siap Digunakan', NULL, '/uploads/asset-1782116983034-277630635.webp', 'Tas warna hijau batik include kabel input', '2026-06-22 08:29:02', '2026-06-23 03:43:18', 1, 5500000, 1, NULL, NULL
    ), (
        6, 'AST-STD-003', 'Zoom Recorder kecil 02', 'DIKI', 'Recorder Kecil', 'ZOOM', 'H1n ', 'C1367795', 'IN Jack 3,5 : 1', 'Ruangan Editing Lemari Atas pc', 'Galeria Studio', 'Siap Digunakan', NULL, '/uploads/asset-1782117332274-472683340.webp', 'Tas Hitam Kulit include Kabel Input ', '2026-06-22 08:34:54', '2026-06-22 08:35:32', 1, 6500000, 1, NULL, NULL
    ), (
        7, 'AST-PRO-003', 'Zoom Recoder 03', 'Ivan/Agung ', 'Recorder Kecil', 'ZOOM', 'H1essential', 'C99058843', 'IN Jack 3,5 : 1', 'Ruangan Editing Lemari Atas Pc', 'Galeria Production', 'Siap Digunakan', NULL, '/uploads/asset-1782117633721-509550063.webp', 'Tas Warna Hijau Polos Include Kabel input & Adaptor zoom Typ c ', '2026-06-22 08:40:34', '2026-06-22 08:42:52', 1, 7500000, 1, NULL, NULL
    ), (
        8, 'AST-STD-004', 'Orbit kecil ', NULL, 'ORBIT', 'TELKOMSEL', 'B628-350', '3AU7S23202001628', 'LAN : 2 INPUT\r\nWAN : 1 INPUT', 'Ruangan Editing Lemari Atas Pc ', 'Galeria Studio', 'Siap Digunakan', NULL, '/uploads/asset-1782118506625-147529094.webp', 'Dalan Box Nya Include Adaptor & LAN', '2026-06-22 08:54:10', '2026-06-22 08:59:51', NULL, 4500000, NULL, NULL, NULL
    ), (
        9, 'AST-PRO-004', 'Video Switcher ', NULL, 'Switcher ', 'FEELWORLD', 'L2 PLUS', '0321519LPRF2KT004950', 'HDMI IN : 4\r\nHDMI OUT : 1', 'Ruangan Editing Lemari Atas pc', 'Galeria Production', 'Siap Digunakan', NULL, '/uploads/asset-1782119113142-662361423.webp', 'Di Dalam Hardcase Krisbow Silver ', '2026-06-22 09:05:13', '2026-06-29 01:44:58', 1, 6000000, 1, NULL, NULL
    ), (
        10, 'AST-STD-005', 'Printer Narsis Booth', 'Karina', 'Printer', 'Epson', 'SL-D530', 'XBRK001084', 'Inkjet,1080 Nosel, 1440 x 720 dpi, 70ml ', 'Ruang Produksi', 'Galeria Studio', 'Siap Digunakan', NULL, '/uploads/asset-1782699468718-413151352.webp', NULL, '2026-06-29 02:17:49', '2026-06-29 02:17:49', 1, 13500000.00, 1, NULL, NULL
    ), (
        11, 'AST-PRO-005', 'Audio Interface', NULL, 'Audio Interface', 'Behringer ', 'UMC204HD', 'S230700974BK0', NULL, 'Dalan box krisbow di ruangan editing lemari atas ', 'Galeria Production', 'Siap Digunakan', NULL, '/uploads/asset-1782717354778-753003389.webp', 'Include Adaptornya ', '2026-06-29 07:15:55', '2026-06-29 07:15:55', 1, 8000000, 1, NULL, NULL
    ), (
        12, 'AST-STD-006', 'KABEL SNAKE 16 CHANNEL', 'FREZA', 'KABEL', 'Non Merk', 'KSD-1685', NULL, 'Kabel Snake Panjang 50 meter untuk 16 Channel CANON', 'Gudang Galeria Production', 'Galeria Studio', 'Siap Digunakan', NULL, '/uploads/asset-1783133031092-18992517.webp', NULL, '2026-07-04 02:43:51', '2026-07-04 02:43:51', 1, 5800000.00, 1, NULL, NULL
    ), (
        13, 'AST-PRO-006', 'MIC QA Electronic', NULL, 'MIC', 'QA electronic', 'HMD46PROX', 'QA20260100258', '2 chanel mic ', 'Gudang ', 'Galeria Production', 'Siap Digunakan', NULL, '/uploads/asset-1783494431192-228320733.webp', NULL, '2026-07-08 07:07:12', '2026-09-16 02:28:39', 1, 10500000, 1, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
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
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO
    `audit_logs` (
        `id`,
        `user_id`,
        `user_name`,
        `action`,
        `entity_type`,
        `entity_id`,
        `details`,
        `created_at`
    )
VALUES (
        1,
        2,
        'Admin',
        'CREATE',
        'Aset',
        NULL,
        'Menambahkan aset: Sony A7C (GKM-CAM-001)',
        '2026-06-12 06:25:26'
    ),
    (
        2,
        1,
        'super admin',
        'CREATE',
        'Aksesoris',
        NULL,
        'Menambahkan aksesoris: Baterai Kamera NP-FZ100 (GKM-BAT-001)',
        '2026-06-12 06:27:25'
    ),
    (
        3,
        4,
        'User',
        'CREATE',
        'Peminjaman',
        NULL,
        'Membuat peminjaman baru (GKM-PJM-1) untuk Cahyo',
        '2026-06-12 06:28:55'
    ),
    (
        4,
        3,
        'Supervisor',
        'UPDATE',
        'Peminjaman',
        '1',
        'Melakukan approve/verifikasi peminjaman: GKM-PJM-1',
        '2026-06-12 06:29:27'
    ),
    (
        5,
        4,
        'User',
        'UPDATE',
        'Peminjaman',
        '1',
        'Memperbarui peminjaman: GKM-PJM-1',
        '2026-06-12 06:30:52'
    ),
    (
        6,
        3,
        'Supervisor',
        'UPDATE',
        'Peminjaman',
        '1',
        'Melakukan approve/verifikasi peminjaman: GKM-PJM-1',
        '2026-06-12 06:31:39'
    ),
    (
        7,
        4,
        'User',
        'CREATE',
        'Peminjaman',
        NULL,
        'Membuat peminjaman baru (GKM-PJM-2) untuk Cahyo',
        '2026-06-12 07:50:15'
    ),
    (
        8,
        6,
        'Muhammad Hoirul Fanani',
        'CREATE',
        'Aset',
        NULL,
        'Menambahkan aset: Video Processor Colorlight X4m (GKM-VPROC-001)',
        '2026-06-22 02:34:55'
    ),
    (
        9,
        6,
        'Muhammad Hoirul Fanani',
        'UPDATE',
        'Aset',
        '2',
        'Memperbarui aset: Video Processor Colorlight X4m (GKM-VPROC-001)',
        '2026-06-22 02:36:22'
    ),
    (
        10,
        6,
        'Muhammad Hoirul Fanani',
        'CREATE',
        'Aksesoris',
        NULL,
        'Menambahkan aksesoris: Orbit (GKM-ORBIT-001)',
        '2026-06-22 07:14:20'
    ),
    (
        11,
        6,
        'Muhammad Hoirul Fanani',
        'UPDATE',
        'Aksesoris',
        '2',
        'Memperbarui aksesoris: Orbit (GKM-ORBIT-001)',
        '2026-06-22 07:14:47'
    ),
    (
        12,
        6,
        'Muhammad Hoirul Fanani',
        'CREATE',
        'Aksesoris',
        NULL,
        'Menambahkan aksesoris: Matador  (GKM-STAND TV -001)',
        '2026-06-22 07:23:06'
    ),
    (
        13,
        6,
        'Muhammad Hoirul Fanani',
        'UPDATE',
        'Aksesoris',
        '3',
        'Memperbarui aksesoris: Matador  (GKM-STAND TV -001)',
        '2026-06-22 07:25:15'
    ),
    (
        14,
        6,
        'Muhammad Hoirul Fanani',
        'UPDATE',
        'Aksesoris',
        '3',
        'Memperbarui aksesoris: Matador  (GKM-STAND TV -001)',
        '2026-06-22 07:25:29'
    ),
    (
        15,
        6,
        'Muhammad Hoirul Fanani',
        'CREATE',
        'Aksesoris',
        NULL,
        'Menambahkan aksesoris: Stand Tv Warna putih  (GKM-STAND TV P-001)',
        '2026-06-22 07:28:45'
    ),
    (
        16,
        6,
        'Muhammad Hoirul Fanani',
        'DELETE',
        'Aksesoris',
        '2',
        'Menghapus aksesoris: Orbit (GKM-ORBIT-001)',
        '2026-06-22 07:29:53'
    ),
    (
        17,
        6,
        'Muhammad Hoirul Fanani',
        'CREATE',
        'Aset',
        NULL,
        'Menambahkan aset: Orbit Besar  (GKM-UMUM-001)',
        '2026-06-22 07:36:11'
    ),
    (
        18,
        6,
        'Muhammad Hoirul Fanani',
        'CREATE',
        'Aset',
        NULL,
        'Menambahkan aset: Zoom Recorder Besar  (GKM-ZOOM-001)',
        '2026-06-22 08:14:33'
    ),
    (
        19,
        6,
        'Muhammad Hoirul Fanani',
        'UPDATE',
        'Aset',
        '4',
        'Memperbarui aset: Zoom Recorder Besar  (GKM-ZOOM-001)',
        '2026-06-22 08:15:43'
    ),
    (
        20,
        6,
        'Muhammad Hoirul Fanani',
        'CREATE',
        'Aset',
        NULL,
        'Menambahkan aset: Zoom Recoder kecil 01 (GKM-ZOOM-002)',
        '2026-06-22 08:29:02'
    ),
    (
        21,
        6,
        'Muhammad Hoirul Fanani',
        'UPDATE',
        'Aset',
        '5',
        'Memperbarui aset: Zoom Recoder kecil 01 (GKM-ZOOM-002)',
        '2026-06-22 08:29:43'
    ),
    (
        22,
        6,
        'Muhammad Hoirul Fanani',
        'CREATE',
        'Aset',
        NULL,
        'Menambahkan aset: Zoom Recorder kecil 02 (GKM-RECORDER-001)',
        '2026-06-22 08:34:54'
    ),
    (
        23,
        6,
        'Muhammad Hoirul Fanani',
        'UPDATE',
        'Aset',
        '6',
        'Memperbarui aset: Zoom Recorder kecil 02 (GKM-RECORDER-001)',
        '2026-06-22 08:35:32'
    ),
    (
        24,
        6,
        'Muhammad Hoirul Fanani',
        'CREATE',
        'Aset',
        NULL,
        'Menambahkan aset: Zoom Recoder 03 (GKM-RECORDER-002)',
        '2026-06-22 08:40:34'
    ),
    (
        25,
        6,
        'Muhammad Hoirul Fanani',
        'UPDATE',
        'Aset',
        '7',
        'Memperbarui aset: Zoom Recoder 03 (GKM-RECORDER-002)',
        '2026-06-22 08:42:52'
    ),
    (
        26,
        6,
        'Muhammad Hoirul Fanani',
        'CREATE',
        'Aset',
        NULL,
        'Menambahkan aset: Orbit kecil  (GKM-ORBIT -001)',
        '2026-06-22 08:54:10'
    ),
    (
        27,
        6,
        'Muhammad Hoirul Fanani',
        'UPDATE',
        'Aset',
        '8',
        'Memperbarui aset: Orbit kecil  (GKM-ORBIT -001)',
        '2026-06-22 08:55:07'
    ),
    (
        28,
        6,
        'Muhammad Hoirul Fanani',
        'UPDATE',
        'Aset',
        '3',
        'Memperbarui aset: Orbit Besar  (GKM-UMUM-001)',
        '2026-06-22 08:55:29'
    ),
    (
        29,
        6,
        'Muhammad Hoirul Fanani',
        'UPDATE',
        'Aset',
        '8',
        'Memperbarui aset: Orbit kecil  (GKM-ORBIT -001)',
        '2026-06-22 08:55:41'
    ),
    (
        30,
        6,
        'Muhammad Hoirul Fanani',
        'UPDATE',
        'Aset',
        '8',
        'Memperbarui aset: Orbit kecil  (GKM-ORBIT -001)',
        '2026-06-22 08:59:51'
    ),
    (
        31,
        6,
        'Muhammad Hoirul Fanani',
        'CREATE',
        'Aset',
        NULL,
        'Menambahkan aset: Video Switcher  (GKM-VIDEO SWIT-001)',
        '2026-06-22 09:05:13'
    ),
    (
        32,
        6,
        'Muhammad Hoirul Fanani',
        'UPDATE',
        'Aset',
        '5',
        'Memperbarui aset: Zoom Recoder kecil 01 (GKM-ZOOM-002)',
        '2026-06-23 03:43:18'
    ),
    (
        33,
        1,
        'super admin',
        'DELETE',
        'Aksesoris',
        '1',
        'Menghapus aksesoris: Baterai Kamera NP-FZ100 (GKM-BAT-001)',
        '2026-06-23 05:58:23'
    ),
    (
        34,
        1,
        'super admin',
        'UPDATE',
        'Peminjaman',
        '2',
        'Melakukan approve/verifikasi peminjaman: GKM-PJM-2',
        '2026-06-23 06:03:41'
    ),
    (
        35,
        1,
        'super admin',
        'DELETE',
        'Peminjaman',
        '2',
        'Menghapus peminjaman: GKM-PJM-2',
        '2026-06-23 06:05:10'
    ),
    (
        36,
        1,
        'super admin',
        'DELETE',
        'Aset',
        '1',
        'Menghapus aset: Sony A7C (GKM-CAM-001)',
        '2026-06-23 08:31:29'
    ),
    (
        37,
        8,
        'Mochammad Muhsin',
        'UPDATE',
        'Aset',
        '9',
        'Memperbarui aset: Video Switcher  (GKM-VIDEO SWIT-001)',
        '2026-06-29 01:44:58'
    ),
    (
        38,
        8,
        'Mochammad Muhsin',
        'CREATE',
        'Aset',
        NULL,
        'Menambahkan aset: Printer Narsis Booth (GKM-PRINT-001)',
        '2026-06-29 02:17:49'
    ),
    (
        39,
        6,
        'Muhammad Hoirul Fanani',
        'CREATE',
        'Aksesoris',
        NULL,
        'Menambahkan aksesoris: Kabel Ganset (GKM-KABEL-001)',
        '2026-06-29 07:10:50'
    ),
    (
        40,
        6,
        'Muhammad Hoirul Fanani',
        'CREATE',
        'Aset',
        NULL,
        'Menambahkan aset: Audio Interface (GKM-AUDIO INTE-001)',
        '2026-06-29 07:15:55'
    ),
    (
        41,
        6,
        'Muhammad Hoirul Fanani',
        'CREATE',
        'Aksesoris',
        NULL,
        'Menambahkan aksesoris: Hdmi To Hdmi (GKM-KABEL HDMI-001)',
        '2026-06-29 07:20:03'
    ),
    (
        42,
        6,
        'Muhammad Hoirul Fanani',
        'UPDATE',
        'Aksesoris',
        '6',
        'Memperbarui aksesoris: Kabel Hdmi (GKM-KABEL HDMI-001)',
        '2026-06-29 07:21:02'
    ),
    (
        43,
        6,
        'Muhammad Hoirul Fanani',
        'CREATE',
        'Aksesoris',
        NULL,
        'Menambahkan aksesoris: Kabel Hdmi (GKM-KABEL HDMI-002)',
        '2026-06-29 07:23:25'
    ),
    (
        44,
        6,
        'Muhammad Hoirul Fanani',
        'UPDATE',
        'Aksesoris',
        '6',
        'Memperbarui aksesoris: Kabel Hdmi (GKM-KABEL HDMI-001)',
        '2026-06-29 07:23:49'
    ),
    (
        45,
        6,
        'Muhammad Hoirul Fanani',
        'CREATE',
        'Aksesoris',
        NULL,
        'Menambahkan aksesoris: Kabel Hdmi  (GKM-KABEL HDMI-003)',
        '2026-06-29 07:26:26'
    ),
    (
        46,
        6,
        'Muhammad Hoirul Fanani',
        'CREATE',
        'Aksesoris',
        NULL,
        'Menambahkan aksesoris: Kabel usb (GKM-U-001)',
        '2026-06-29 07:28:29'
    ),
    (
        47,
        6,
        'Muhammad Hoirul Fanani',
        'CREATE',
        'Aksesoris',
        NULL,
        'Menambahkan aksesoris: Kabel usb  (GKM-U-002)',
        '2026-06-29 07:30:07'
    ),
    (
        48,
        8,
        'Mochammad Muhsin',
        'UPDATE',
        'Aksesoris',
        '5',
        'Memperbarui aksesoris: Kabel Genset (GKM-KABEL-001)',
        '2026-06-29 10:26:31'
    ),
    (
        49,
        8,
        'Mochammad Muhsin',
        'UPDATE',
        'Aksesoris',
        '4',
        'Memperbarui aksesoris: Stand Tv Warna putih  (GKM-STAND TV P-001)',
        '2026-06-29 10:26:56'
    ),
    (
        50,
        6,
        'Muhammad Hoirul Fanani',
        'UPDATE',
        'Aksesoris',
        '9',
        'Memperbarui aksesoris: Kabel Usb B To Usb A (GKM-U-001)',
        '2026-07-01 07:50:36'
    ),
    (
        51,
        6,
        'Muhammad Hoirul Fanani',
        'UPDATE',
        'Aksesoris',
        '8',
        'Memperbarui aksesoris: Kabel Hdmi  2M  (GKM-KABEL HDMI-003)',
        '2026-07-01 07:52:23'
    ),
    (
        52,
        6,
        'Muhammad Hoirul Fanani',
        'UPDATE',
        'Aksesoris',
        '7',
        'Memperbarui aksesoris: Kabel Hdmi 1,5 M  (GKM-KABEL HDMI-002)',
        '2026-07-01 07:52:43'
    ),
    (
        53,
        6,
        'Muhammad Hoirul Fanani',
        'UPDATE',
        'Aksesoris',
        '8',
        'Memperbarui aksesoris: Kabel Hdmi  2 M  (GKM-KABEL HDMI-003)',
        '2026-07-01 07:52:52'
    ),
    (
        54,
        6,
        'Muhammad Hoirul Fanani',
        'UPDATE',
        'Aksesoris',
        '6',
        'Memperbarui aksesoris: Kabel Hdmi 1 M (GKM-KABEL HDMI-001)',
        '2026-07-01 07:53:02'
    ),
    (
        55,
        6,
        'Muhammad Hoirul Fanani',
        'CREATE',
        'Aksesoris',
        NULL,
        'Menambahkan aksesoris: Tripod Flash Takara  (GKM-STAND -001)',
        '2026-07-01 07:57:45'
    ),
    (
        56,
        6,
        'Muhammad Hoirul Fanani',
        'CREATE',
        'Aksesoris',
        NULL,
        'Menambahkan aksesoris: Stand NX200 Kuning Benro (GKM-STND-001)',
        '2026-07-01 08:04:48'
    ),
    (
        57,
        6,
        'Muhammad Hoirul Fanani',
        'CREATE',
        'Aksesoris',
        NULL,
        'Menambahkan aksesoris: STAND FLASH No Brand (GKM-STAND -002)',
        '2026-07-01 08:17:07'
    ),
    (
        58,
        6,
        'Muhammad Hoirul Fanani',
        'CREATE',
        'Aksesoris',
        NULL,
        'Menambahkan aksesoris: Lensa Zeis 35 F1,4  (GKM-LENSA-001)',
        '2026-07-01 08:26:16'
    ),
    (
        59,
        6,
        'Muhammad Hoirul Fanani',
        'CREATE',
        'Aksesoris',
        NULL,
        'Menambahkan aksesoris: Lensa Samyang 35 F1,8 (GKM-LENSA-002)',
        '2026-07-01 08:28:07'
    ),
    (
        60,
        6,
        'Muhammad Hoirul Fanani',
        'CREATE',
        'Aksesoris',
        NULL,
        'Menambahkan aksesoris: Lensa Sony 85 F 1.8 (GKM-LENSA-003)',
        '2026-07-01 12:41:29'
    ),
    (
        61,
        6,
        'Muhammad Hoirul Fanani',
        'CREATE',
        'Aksesoris',
        NULL,
        'Menambahkan aksesoris: Lensa 18 F 2.8 (GKM-LENSA-004)',
        '2026-07-01 12:43:13'
    ),
    (
        62,
        6,
        'Muhammad Hoirul Fanani',
        'CREATE',
        'Aksesoris',
        NULL,
        'Menambahkan aksesoris: Lensa Samyang V-AF 35 F 1.9 (GKM-LENSA-005)',
        '2026-07-01 12:45:31'
    ),
    (
        63,
        6,
        'Muhammad Hoirul Fanani',
        'CREATE',
        'Aksesoris',
        NULL,
        'Menambahkan aksesoris: Lensa Sony 35 F 1.8 (GKM-LENSA-006)',
        '2026-07-01 12:47:45'
    ),
    (
        64,
        6,
        'Muhammad Hoirul Fanani',
        'CREATE',
        'Aksesoris',
        NULL,
        'Menambahkan aksesoris: Lensa Samyang 75 F 1.8   (GKM-LENSA-007)',
        '2026-07-01 12:51:23'
    ),
    (
        65,
        6,
        'Muhammad Hoirul Fanani',
        'CREATE',
        'Aksesoris',
        NULL,
        'Menambahkan aksesoris: Lensa Zeis 25 F 2 (GKM-LENSA-008)',
        '2026-07-01 12:53:51'
    ),
    (
        66,
        6,
        'Muhammad Hoirul Fanani',
        'CREATE',
        'Aksesoris',
        NULL,
        'Menambahkan aksesoris: Lensa Fish eye 7,5 F2.8 (GKM-LENSA-009)',
        '2026-07-01 12:56:35'
    ),
    (
        67,
        8,
        'Mochammad Muhsin',
        'CREATE',
        'Aksesoris',
        NULL,
        'Menambahkan aksesoris: hardcase parled (GKM-HRC-001)',
        '2026-07-02 01:58:04'
    ),
    (
        68,
        8,
        'Mochammad Muhsin',
        'CREATE',
        'Aksesoris',
        NULL,
        'Menambahkan aksesoris: Hardcase Sound (GKM-HRC-002)',
        '2026-07-02 01:59:33'
    ),
    (
        69,
        8,
        'Mochammad Muhsin',
        'CREATE',
        'Aksesoris',
        NULL,
        'Menambahkan aksesoris: Hardcase followspot (GKM-HRC-003)',
        '2026-07-02 02:02:34'
    ),
    (
        70,
        8,
        'Mochammad Muhsin',
        'UPDATE',
        'Aksesoris',
        '25',
        'Memperbarui aksesoris: Hardcase followspot (GKM-HRC-003)',
        '2026-07-02 02:05:08'
    ),
    (
        71,
        8,
        'Mochammad Muhsin',
        'CREATE',
        'Aksesoris',
        NULL,
        'Menambahkan aksesoris: harcase parled (GKM-HRC-004)',
        '2026-07-02 02:05:36'
    ),
    (
        72,
        8,
        'Mochammad Muhsin',
        'CREATE',
        'Aksesoris',
        NULL,
        'Menambahkan aksesoris: hardcase tv 43\" (GKM-HRC-005)',
        '2026-07-02 02:09:03'
    ),
    (
        73,
        8,
        'Mochammad Muhsin',
        'CREATE',
        'Aksesoris',
        NULL,
        'Menambahkan aksesoris: hardcase beam (GKM-HRC-006)',
        '2026-07-02 02:12:01'
    ),
    (
        74,
        8,
        'Mochammad Muhsin',
        'CREATE',
        'Aksesoris',
        NULL,
        'Menambahkan aksesoris: hardcase tv 50\" (GKM-HRC-007)',
        '2026-07-02 02:12:55'
    ),
    (
        75,
        8,
        'Mochammad Muhsin',
        'CREATE',
        'Aksesoris',
        NULL,
        'Menambahkan aksesoris: hardcase stop kontak (GKM-HRC-008)',
        '2026-07-02 02:15:10'
    ),
    (
        76,
        8,
        'Mochammad Muhsin',
        'CREATE',
        'Aksesoris',
        NULL,
        'Menambahkan aksesoris: hardcase stop kontak (GKM-HRC-009)',
        '2026-07-02 02:15:21'
    ),
    (
        77,
        8,
        'Mochammad Muhsin',
        'CREATE',
        'Aksesoris',
        NULL,
        'Menambahkan aksesoris: hardcase stop kontak (GKM-HRC-010)',
        '2026-07-02 02:15:36'
    ),
    (
        78,
        8,
        'Mochammad Muhsin',
        'CREATE',
        'Aksesoris',
        NULL,
        'Menambahkan aksesoris: hardcase tv 65\" (GKM-HRC-011)',
        '2026-07-02 02:18:56'
    ),
    (
        79,
        7,
        'Mohamad Mahmudi',
        'CREATE',
        'Aksesoris',
        NULL,
        'Menambahkan aksesoris: SD CARD - 06 - MM (GKM-C-64-001)',
        '2026-07-02 07:25:49'
    ),
    (
        80,
        7,
        'Mohamad Mahmudi',
        'CREATE',
        'Aksesoris',
        NULL,
        'Menambahkan aksesoris: SD CARD - 07 - DYS (GKM-C-64-002)',
        '2026-07-02 07:45:21'
    ),
    (
        81,
        7,
        'Mohamad Mahmudi',
        'CREATE',
        'Aksesoris',
        NULL,
        'Menambahkan aksesoris: SD CARD - 05 - AGF (GKM-C-64-003)',
        '2026-07-02 07:47:53'
    ),
    (
        82,
        7,
        'Mohamad Mahmudi',
        'CREATE',
        'Aksesoris',
        NULL,
        'Menambahkan aksesoris: SD CARD - 10  (GKM-C-32-001)',
        '2026-07-02 07:53:04'
    ),
    (
        83,
        7,
        'Mohamad Mahmudi',
        'CREATE',
        'Aksesoris',
        NULL,
        'Menambahkan aksesoris: SD CARD - 11  (GKM-C-32-002)',
        '2026-07-02 07:59:50'
    ),
    (
        84,
        7,
        'Mohamad Mahmudi',
        'CREATE',
        'Aksesoris',
        NULL,
        'Menambahkan aksesoris: SD CARD - 12 (GKM-C-32-003)',
        '2026-07-02 08:01:39'
    ),
    (
        85,
        7,
        'Mohamad Mahmudi',
        'CREATE',
        'Aksesoris',
        NULL,
        'Menambahkan aksesoris: SD CARD - 13  (GKM-C-32-004)',
        '2026-07-02 08:03:17'
    ),
    (
        86,
        7,
        'Mohamad Mahmudi',
        'CREATE',
        'Aksesoris',
        NULL,
        'Menambahkan aksesoris: SD CARD - 14 (GKM-C-32-005)',
        '2026-07-02 08:05:14'
    ),
    (
        87,
        7,
        'Mohamad Mahmudi',
        'CREATE',
        'Aksesoris',
        NULL,
        'Menambahkan aksesoris: SD CARD - 16 (GKM-C-64-004)',
        '2026-07-03 08:14:18'
    ),
    (
        88,
        8,
        'Mochammad Muhsin',
        'UPDATE',
        'Aksesoris',
        '25',
        'Memperbarui aksesoris: Hardcase Fllowspot (GKM-HRC-003)',
        '2026-07-04 01:54:22'
    ),
    (
        89,
        8,
        'Mochammad Muhsin',
        'UPDATE',
        'Aksesoris',
        '33',
        'Memperbarui aksesoris: hardcase tv 65\" (GKM-HRC-011)',
        '2026-07-04 01:56:16'
    ),
    (
        90,
        8,
        'Mochammad Muhsin',
        'UPDATE',
        'Aksesoris',
        '29',
        'Memperbarui aksesoris: hardcase tv 50\" (GKM-HRC-007)',
        '2026-07-04 01:56:47'
    ),
    (
        91,
        8,
        'Mochammad Muhsin',
        'UPDATE',
        'Aksesoris',
        '27',
        'Memperbarui aksesoris: hardcase tv 43\" (GKM-HRC-005)',
        '2026-07-04 01:57:01'
    ),
    (
        92,
        8,
        'Mochammad Muhsin',
        'UPDATE',
        'Aksesoris',
        '25',
        'Memperbarui aksesoris: Hardcase Followspot (GKM-HRC-003)',
        '2026-07-04 01:57:15'
    ),
    (
        93,
        8,
        'Mochammad Muhsin',
        'UPDATE',
        'Aksesoris',
        '32',
        'Memperbarui aksesoris: hardcase stop kontak (GKM-HRC-010)',
        '2026-07-04 01:57:58'
    ),
    (
        94,
        8,
        'Mochammad Muhsin',
        'UPDATE',
        'Aksesoris',
        '33',
        'Memperbarui aksesoris: HARDCASE TV 65\" (GKM-HRC-011)',
        '2026-07-04 01:58:44'
    ),
    (
        95,
        8,
        'Mochammad Muhsin',
        'UPDATE',
        'Aksesoris',
        '30',
        'Memperbarui aksesoris: HARDCASE STOP KONTAK (GKM-HRC-008)',
        '2026-07-04 01:59:10'
    ),
    (
        96,
        8,
        'Mochammad Muhsin',
        'UPDATE',
        'Aksesoris',
        '29',
        'Memperbarui aksesoris: HARDCASE TV 50\" (GKM-HRC-007)',
        '2026-07-04 01:59:41'
    ),
    (
        97,
        8,
        'Mochammad Muhsin',
        'UPDATE',
        'Aksesoris',
        '28',
        'Memperbarui aksesoris: HARDCASE BEAM (GKM-HRC-006)',
        '2026-07-04 01:59:55'
    ),
    (
        98,
        8,
        'Mochammad Muhsin',
        'UPDATE',
        'Aksesoris',
        '27',
        'Memperbarui aksesoris: HARDCASE TV 43\" (GKM-HRC-005)',
        '2026-07-04 02:00:18'
    ),
    (
        99,
        8,
        'Mochammad Muhsin',
        'UPDATE',
        'Aksesoris',
        '26',
        'Memperbarui aksesoris: HARDCASE PARLED (GKM-HRC-004)',
        '2026-07-04 02:00:36'
    ),
    (
        100,
        8,
        'Mochammad Muhsin',
        'UPDATE',
        'Aksesoris',
        '25',
        'Memperbarui aksesoris: HARDCASE FOLLOWSPOT (GKM-HRC-003)',
        '2026-07-04 02:00:54'
    ),
    (
        101,
        8,
        'Mochammad Muhsin',
        'UPDATE',
        'Aksesoris',
        '24',
        'Memperbarui aksesoris: HARDCASE SOUND HUPER (GKM-HRC-002)',
        '2026-07-04 02:04:09'
    ),
    (
        102,
        8,
        'Mochammad Muhsin',
        'UPDATE',
        'Aksesoris',
        '24',
        'Memperbarui aksesoris: HARDCASE SOUND HUPER (GKM-HRC-002)',
        '2026-07-04 02:04:45'
    ),
    (
        103,
        8,
        'Mochammad Muhsin',
        'CREATE',
        'Aksesoris',
        NULL,
        'Menambahkan aksesoris: STAND TRIPOD LIGHTING (GKM-STN-001)',
        '2026-07-04 02:37:05'
    ),
    (
        104,
        8,
        'Mochammad Muhsin',
        'CREATE',
        'Aset',
        NULL,
        'Menambahkan aset: KABEL SNAKE 16 CHANNEL (GKM-KSN-001)',
        '2026-07-04 02:43:51'
    ),
    (
        105,
        8,
        'Mochammad Muhsin',
        'CREATE',
        'Aksesoris',
        NULL,
        'Menambahkan aksesoris: KABEL LAN 100M (GKM-KBL-001)',
        '2026-07-04 04:14:52'
    ),
    (
        106,
        8,
        'Mochammad Muhsin',
        'UPDATE',
        'Aksesoris',
        '44',
        'Memperbarui aksesoris: KABEL LAN 100M (GKM-KBL-001)',
        '2026-07-04 04:15:58'
    ),
    (
        107,
        8,
        'Mochammad Muhsin',
        'UPDATE',
        'Aksesoris',
        '44',
        'Memperbarui aksesoris: KABEL LAN 100M (GKM-KBL-001)',
        '2026-07-04 04:17:05'
    ),
    (
        108,
        8,
        'Mochammad Muhsin',
        'CREATE',
        'Aksesoris',
        NULL,
        'Menambahkan aksesoris: KABEL LAN 50 (GKM-KBL-002)',
        '2026-07-04 04:29:49'
    ),
    (
        109,
        8,
        'Mochammad Muhsin',
        'UPDATE',
        'Aksesoris',
        '45',
        'Memperbarui aksesoris: KABEL LAN 50M (GKM-KBL-002)',
        '2026-07-04 04:30:00'
    ),
    (
        110,
        6,
        'Muhammad Hoirul Fanani',
        'UPDATE',
        'Aksesoris',
        '44',
        'Memperbarui aksesoris: KABEL LAN 100M (GKM-KBL-001)',
        '2026-07-08 07:00:38'
    ),
    (
        111,
        6,
        'Muhammad Hoirul Fanani',
        'CREATE',
        'Aset',
        NULL,
        'Menambahkan aset: MIC QA Electronic (GKM-MIC-001)',
        '2026-07-08 07:07:12'
    ),
    (
        112,
        1,
        'super admin',
        'CREATE',
        'Peminjaman',
        NULL,
        'Membuat peminjaman baru (GKM-PJM-2) untuk Favian',
        '2026-09-14 07:25:51'
    ),
    (
        113,
        1,
        'super admin',
        'UPDATE',
        'Peminjaman',
        '3',
        'Melakukan approve/verifikasi peminjaman: GKM-PJM-2',
        '2026-09-14 07:27:07'
    ),
    (
        114,
        1,
        'super admin',
        'UPDATE',
        'Peminjaman',
        '3',
        'Memperbarui peminjaman: GKM-PJM-2',
        '2026-09-14 07:27:35'
    ),
    (
        115,
        1,
        'super admin',
        'UPDATE',
        'Peminjaman',
        '3',
        'Melakukan approve/verifikasi peminjaman: GKM-PJM-2',
        '2026-09-14 07:27:46'
    ),
    (
        116,
        4,
        'User',
        'CREATE',
        'Peminjaman',
        NULL,
        'Membuat peminjaman baru (GKM-PJM-3) untuk Dandi',
        '2026-09-14 07:33:41'
    ),
    (
        117,
        1,
        'super admin',
        'UPDATE',
        'Peminjaman',
        '4',
        'Melakukan approve/verifikasi peminjaman: GKM-PJM-3',
        '2026-09-14 07:33:57'
    ),
    (
        118,
        1,
        'super admin',
        'UPDATE',
        'Peminjaman',
        '4',
        'Memperbarui peminjaman: GKM-PJM-3',
        '2026-09-15 07:57:27'
    ),
    (
        119,
        1,
        'super admin',
        'DELETE',
        'Peminjaman',
        '4',
        'Menghapus peminjaman: GKM-PJM-3',
        '2026-09-16 02:28:39'
    ),
    (
        120,
        1,
        'super admin',
        'DELETE',
        'Peminjaman',
        '3',
        'Menghapus peminjaman: GKM-PJM-2',
        '2026-09-16 02:28:41'
    ),
    (
        121,
        1,
        'super admin',
        'DELETE',
        'Peminjaman',
        '1',
        'Menghapus peminjaman: GKM-PJM-1',
        '2026-09-16 02:28:43'
    );

-- --------------------------------------------------------

--
-- Table structure for table `brands`
--

CREATE TABLE `brands` (
    `id` int(11) NOT NULL,
    `nama` varchar(100) NOT NULL,
    `tipe` enum('aset', 'aksesoris') NOT NULL DEFAULT 'aset',
    `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

--
-- Dumping data for table `brands`
--

INSERT INTO
    `brands` (
        `id`,
        `nama`,
        `tipe`,
        `created_at`
    )
VALUES (
        1,
        'Sony',
        'aset',
        '2026-06-12 06:21:22'
    ),
    (
        3,
        'Soni',
        'aksesoris',
        '2026-06-12 06:26:44'
    ),
    (
        4,
        'Colorlight',
        'aset',
        '2026-06-22 02:30:37'
    ),
    (
        5,
        'HUAWEI',
        'aksesoris',
        '2026-06-22 07:12:03'
    ),
    (
        6,
        'H4nPro',
        'aset',
        '2026-06-22 08:10:34'
    ),
    (
        7,
        'ZOOM',
        'aset',
        '2026-06-22 08:31:59'
    ),
    (
        8,
        'TELKOMSEL',
        'aset',
        '2026-06-22 08:51:37'
    ),
    (
        9,
        'FEELWORLD',
        'aset',
        '2026-06-22 09:02:35'
    ),
    (
        10,
        'Epson',
        'aset',
        '2026-06-29 02:09:32'
    ),
    (
        11,
        'Behringer ',
        'aset',
        '2026-06-29 07:13:14'
    ),
    (
        12,
        'VENTION ',
        'aksesoris',
        '2026-06-29 07:18:00'
    ),
    (
        13,
        'UGREEN',
        'aksesoris',
        '2026-06-29 07:29:07'
    ),
    (
        14,
        'TAKARA',
        'aksesoris',
        '2026-07-01 07:56:39'
    ),
    (
        15,
        'BENRO',
        'aksesoris',
        '2026-07-01 08:03:58'
    ),
    (
        16,
        'ZEIS',
        'aksesoris',
        '2026-07-01 08:24:27'
    ),
    (
        17,
        'SAMYANG',
        'aksesoris',
        '2026-07-01 08:27:20'
    ),
    (
        24,
        'SONY ',
        'aksesoris',
        '2026-07-01 12:40:33'
    ),
    (
        25,
        'Non Merk',
        'aksesoris',
        '2026-07-02 01:54:25'
    ),
    (
        26,
        'Lunar',
        'aksesoris',
        '2026-07-02 02:09:31'
    ),
    (
        27,
        'QA electronic',
        'aksesoris',
        '2026-07-02 02:22:07'
    ),
    (
        28,
        'SANDISK',
        'aksesoris',
        '2026-07-02 07:23:38'
    ),
    (
        29,
        'QA ',
        'aset',
        '2026-07-08 07:03:25'
    );

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
    `id` int(11) NOT NULL,
    `nama` varchar(100) NOT NULL,
    `kode_singkat` varchar(10) NOT NULL,
    `tipe` enum('aset', 'aksesoris') NOT NULL DEFAULT 'aset',
    `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO
    `categories` (
        `id`,
        `nama`,
        `kode_singkat`,
        `tipe`,
        `created_at`
    )
VALUES (
        1,
        'Kamera',
        'CAM',
        'aset',
        '2026-06-12 06:21:14'
    ),
    (
        2,
        'Baterai Kamera',
        'BAT',
        'aksesoris',
        '2026-06-12 06:25:47'
    ),
    (
        3,
        'Video Processor ',
        'VPROC',
        'aset',
        '2026-06-22 02:30:10'
    ),
    (
        4,
        'ORBIT HUAWEI ',
        'ORBIT',
        'aksesoris',
        '2026-06-22 07:11:52'
    ),
    (
        5,
        'matador ',
        'STAND TV ',
        'aksesoris',
        '2026-06-22 07:20:37'
    ),
    (
        6,
        'Stand Tv putih ',
        'STAND TV P',
        'aksesoris',
        '2026-06-22 07:27:52'
    ),
    (
        7,
        'ZOOM ',
        'ZOOM',
        'aset',
        '2026-06-22 08:10:01'
    ),
    (
        8,
        'Recorder Kecil',
        'RECORDER',
        'aset',
        '2026-06-22 08:32:29'
    ),
    (
        9,
        'ORBIT',
        'ORBIT ',
        'aset',
        '2026-06-22 08:51:27'
    ),
    (
        10,
        'Switcher ',
        'VIDEO SWIT',
        'aset',
        '2026-06-22 09:02:12'
    ),
    (
        11,
        'Printer',
        'PRINT',
        'aset',
        '2026-06-29 02:09:00'
    ),
    (
        12,
        'Kabel Genset',
        'KABEL',
        'aksesoris',
        '2026-06-29 07:09:48'
    ),
    (
        13,
        'Audio Interface',
        'AUDIO INTE',
        'aset',
        '2026-06-29 07:12:58'
    ),
    (
        14,
        'KABEL HDMI',
        'KABEL HDMI',
        'aksesoris',
        '2026-06-29 07:17:46'
    ),
    (
        15,
        'Kabel usb',
        'U',
        'aksesoris',
        '2026-06-29 07:27:22'
    ),
    (
        16,
        'STAND FLASH ',
        'STAND ',
        'aksesoris',
        '2026-07-01 07:56:16'
    ),
    (
        20,
        'Stand kamera',
        'STND',
        'aksesoris',
        '2026-07-01 08:03:45'
    ),
    (
        21,
        'LENSA ',
        'LENSA',
        'aksesoris',
        '2026-07-01 08:24:16'
    ),
    (
        22,
        'hardcase',
        'HRC',
        'aksesoris',
        '2026-07-02 01:51:14'
    ),
    (
        23,
        'CARD 64',
        'C-64',
        'aksesoris',
        '2026-07-02 07:23:09'
    ),
    (
        24,
        'CARD 32',
        'C-32',
        'aksesoris',
        '2026-07-02 07:51:54'
    ),
    (
        25,
        'STAND TRIPOD',
        'STN',
        'aksesoris',
        '2026-07-04 02:34:50'
    ),
    (
        26,
        'KABEL',
        'KSN',
        'aset',
        '2026-07-04 02:41:04'
    ),
    (
        31,
        'KABEL LAN',
        'KBL',
        'aksesoris',
        '2026-07-04 04:12:53'
    ),
    (
        32,
        'MIC',
        'MIC',
        'aset',
        '2026-07-08 07:03:17'
    );

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
    `id` int(11) NOT NULL,
    `type` varchar(50) NOT NULL,
    `message` text NOT NULL,
    `reference_id` int(11) DEFAULT NULL,
    `target_roles` varchar(255) NOT NULL,
    `is_read` tinyint(1) DEFAULT 0,
    `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO
    `notifications` (
        `id`,
        `type`,
        `message`,
        `reference_id`,
        `target_roles`,
        `is_read`,
        `created_at`
    )
VALUES (
        1,
        'peminjaman_baru',
        'Cahyo membuat peminjaman baru (GKM-PJM-1)',
        NULL,
        'super admin,admin,supervisor',
        1,
        '2026-06-12 06:28:55'
    ),
    (
        2,
        'stok_rendah_aset',
        'Stok Sony A7C tersisa 0 unit',
        1,
        'super admin,admin',
        1,
        '2026-06-12 06:28:55'
    ),
    (
        3,
        'stok_rendah_aks',
        'Stok Baterai Kamera NP-FZ100 tersisa 3 unit',
        1,
        'super admin,admin',
        1,
        '2026-06-12 06:28:55'
    ),
    (
        4,
        'approved',
        'Peminjaman GKM-PJM-1 telah disetujui untuk dipinjam oleh Supervisor [Peminjam: Cahyo] [By: User]',
        1,
        'super admin,admin,supervisor,user',
        1,
        '2026-06-12 06:29:27'
    ),
    (
        5,
        'dikembalikan',
        'Peminjaman GKM-PJM-1 menunggu verifikasi pengembalian dari Cahyo',
        1,
        'super admin,admin,supervisor',
        1,
        '2026-06-12 06:30:52'
    ),
    (
        6,
        'approved',
        'Peminjaman GKM-PJM-1 telah diverifikasi pengembaliannya oleh Supervisor [Peminjam: Cahyo] [By: User]',
        1,
        'super admin,admin,supervisor,user',
        1,
        '2026-06-12 06:31:39'
    ),
    (
        7,
        'peminjaman_baru',
        'Cahyo membuat peminjaman baru (GKM-PJM-2)',
        NULL,
        'super admin,admin,supervisor',
        1,
        '2026-06-12 07:50:15'
    ),
    (
        8,
        'stok_rendah_aset',
        'Stok Sony A7C tersisa 0 unit',
        1,
        'super admin,admin',
        1,
        '2026-06-12 07:50:15'
    ),
    (
        9,
        'approved',
        'Peminjaman GKM-PJM-2 telah disetujui untuk dipinjam oleh super admin [Peminjam: Cahyo] [By: User]',
        2,
        'super admin,admin,supervisor,user',
        1,
        '2026-06-23 06:03:41'
    ),
    (
        10,
        'peminjaman_baru',
        'Favian membuat peminjaman baru (GKM-PJM-2)',
        NULL,
        'super admin,admin,supervisor',
        1,
        '2026-09-14 07:25:51'
    ),
    (
        11,
        'stok_rendah_aset',
        'Stok MIC QA Electronic tersisa 0 unit',
        13,
        'super admin,admin',
        1,
        '2026-09-14 07:25:51'
    ),
    (
        12,
        'stok_rendah_aks',
        'Stok KABEL LAN 50M tersisa 3 unit',
        45,
        'super admin,admin',
        1,
        '2026-09-14 07:25:51'
    ),
    (
        13,
        'approved',
        'Peminjaman GKM-PJM-2 telah disetujui untuk dipinjam oleh super admin [Peminjam: Favian] [By: super admin]',
        3,
        'super admin,admin,supervisor,user',
        1,
        '2026-09-14 07:27:07'
    ),
    (
        14,
        'dikembalikan',
        'Peminjaman GKM-PJM-2 menunggu verifikasi pengembalian dari Favian',
        3,
        'super admin,admin,supervisor',
        1,
        '2026-09-14 07:27:34'
    ),
    (
        15,
        'approved',
        'Peminjaman GKM-PJM-2 telah diverifikasi pengembaliannya oleh super admin [Peminjam: Favian] [By: super admin]',
        3,
        'super admin,admin,supervisor,user',
        1,
        '2026-09-14 07:27:46'
    ),
    (
        16,
        'peminjaman_baru',
        'Dandi membuat peminjaman baru (GKM-PJM-3)',
        NULL,
        'super admin,admin,supervisor',
        1,
        '2026-09-14 07:33:41'
    ),
    (
        17,
        'stok_rendah_aset',
        'Stok MIC QA Electronic tersisa 0 unit',
        13,
        'super admin,admin',
        1,
        '2026-09-14 07:33:41'
    ),
    (
        18,
        'approved',
        'Peminjaman GKM-PJM-3 telah disetujui untuk dipinjam oleh super admin [Peminjam: Dandi] [By: User]',
        4,
        'super admin,admin,supervisor,user',
        1,
        '2026-09-14 07:33:57'
    ),
    (
        19,
        'dikembalikan',
        'Peminjaman GKM-PJM-3 menunggu verifikasi pengembalian dari Dandi',
        4,
        'super admin,admin,supervisor',
        0,
        '2026-09-15 07:57:27'
    );

-- --------------------------------------------------------

--
-- Table structure for table `peminjaman`
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
    `status` enum(
        'Menunggu Persetujuan',
        'Sedang Dipinjam',
        'Menunggu Verifikasi',
        'Peminjaman Selesai'
    ) DEFAULT 'Menunggu Persetujuan',
    `yang_menyerahkan` varchar(255) DEFAULT NULL,
    `approved_by` varchar(255) DEFAULT NULL,
    `return_approved_by` varchar(255) DEFAULT NULL,
    `created_at` timestamp NULL DEFAULT current_timestamp(),
    `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    `bukti_peminjaman` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (
        json_valid(`bukti_peminjaman`)
    ),
    `bukti_pengembalian` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (
        json_valid(`bukti_pengembalian`)
    ),
    `user_id` int(11) DEFAULT NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `peminjaman_items`
--

CREATE TABLE `peminjaman_items` (
    `id` int(11) NOT NULL,
    `peminjaman_id` int(11) NOT NULL,
    `asset_id` int(11) DEFAULT NULL,
    `aksesoris_id` int(11) DEFAULT NULL,
    `jumlah` int(11) NOT NULL DEFAULT 1
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_pegawai`
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
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

--
-- Dumping data for table `tbl_pegawai`
--

INSERT INTO
    `tbl_pegawai` (
        `id`,
        `nama_lengkap`,
        `tempat_lahir`,
        `tanggal_lahir`,
        `alamat`,
        `email`,
        `nomor_hp`,
        `created_at`,
        `updated_at`
    )
VALUES (
        8,
        'Budi Santoso',
        'Jakarta',
        '1990-05-12',
        'Jl. Merdeka No. 10, Jakarta Pusat',
        'budi.santoso@email.com',
        '081234567001',
        '2026-09-16 04:51:04',
        '2026-09-16 04:51:04'
    ),
    (
        9,
        'Siti Aminah',
        'Bandung',
        '1992-08-23',
        'Jl. Asia Afrika No. 25, Bandung',
        'siti.aminah@email.com',
        '081234567002',
        '2026-09-16 04:51:04',
        '2026-09-16 04:51:04'
    ),
    (
        10,
        'Andi Wijaya',
        'Surabaya',
        '1988-01-15',
        'Jl. Tunjungan No. 5, Surabaya',
        'andi.wijaya@email.com',
        '081234567003',
        '2026-09-16 04:51:04',
        '2026-09-16 04:51:04'
    ),
    (
        11,
        'Dewi Lestari',
        'Yogyakarta',
        '1995-03-30',
        'Jl. Malioboro No. 12, Yogyakarta',
        'dewi.lestari@email.com',
        '081234567004',
        '2026-09-16 04:51:04',
        '2026-09-16 04:51:04'
    ),
    (
        12,
        'Rudi Hartono',
        'Medan',
        '1991-11-07',
        'Jl. Gatot Subroto No. 8, Medan',
        'rudi.hartono@email.com',
        '081234567005',
        '2026-09-16 04:51:04',
        '2026-09-16 04:51:04'
    ),
    (
        13,
        'Rina Marlina',
        'Semarang',
        '1993-06-18',
        'Jl. Pandanaran No. 20, Semarang',
        'rina.marlina@email.com',
        '081234567006',
        '2026-09-16 04:51:04',
        '2026-09-16 04:51:04'
    ),
    (
        14,
        'Agus Setiawan',
        'Makassar',
        '1989-09-25',
        'Jl. Pettarani No. 3, Makassar',
        'agus.setiawan@email.com',
        '081234567007',
        '2026-09-16 04:51:04',
        '2026-09-16 04:51:04'
    ),
    (
        15,
        'Fitri Handayani',
        'Palembang',
        '1994-12-02',
        'Jl. Sudirman No. 15, Palembang',
        'fitri.handayani@email.com',
        '081234567008',
        '2026-09-16 04:51:04',
        '2026-09-16 04:51:04'
    ),
    (
        16,
        'Doni Saputra',
        'Denpasar',
        '1990-07-14',
        'Jl. Sunset Road No. 7, Denpasar',
        'doni.saputra@email.com',
        '081234567009',
        '2026-09-16 04:51:04',
        '2026-09-16 04:51:04'
    ),
    (
        17,
        'Maya Sari',
        'Balikpapan',
        '1996-04-21',
        'Jl. Sudirman No. 30, Balikpapan',
        'maya.sari@email.com',
        '081234567010',
        '2026-09-16 04:51:04',
        '2026-09-16 04:51:04'
    ),
    (
        18,
        'Hendra Gunawan',
        'Pontianak',
        '1987-02-11',
        'Jl. Gajah Mada No. 9, Pontianak',
        'hendra.gunawan@email.com',
        '081234567011',
        '2026-09-16 04:51:04',
        '2026-09-16 04:51:04'
    ),
    (
        19,
        'Lina Kusuma',
        'Manado',
        '1992-10-05',
        'Jl. Sam Ratulangi No. 18, Manado',
        'lina.kusuma@email.com',
        '081234567012',
        '2026-09-16 04:51:04',
        '2026-09-16 04:51:04'
    ),
    (
        20,
        'Bayu Pratama',
        'Padang',
        '1991-01-27',
        'Jl. Imam Bonjol No. 22, Padang',
        'bayu.pratama@email.com',
        '081234567013',
        '2026-09-16 04:51:04',
        '2026-09-16 04:51:04'
    ),
    (
        21,
        'Nina Septiani',
        'Pekanbaru',
        '1993-08-09',
        'Jl. Jenderal Sudirman No. 11, Pekanbaru',
        'nina.septiani@email.com',
        '081234567014',
        '2026-09-16 04:51:04',
        '2026-09-16 04:51:04'
    ),
    (
        22,
        'Fajar Nugroho',
        'Bogor',
        '1988-05-19',
        'Jl. Pajajaran No. 6, Bogor',
        'fajar.nugroho@email.com',
        '081234567015',
        '2026-09-16 04:51:04',
        '2026-09-16 04:51:04'
    ),
    (
        23,
        'Indah Permata',
        'Malang',
        '1995-11-23',
        'Jl. Ijen No. 14, Malang',
        'indah.permata@email.com',
        '081234567016',
        '2026-09-16 04:51:04',
        '2026-09-16 04:51:04'
    ),
    (
        24,
        'Yoga Prasetyo',
        'Solo',
        '1990-03-08',
        'Jl. Slamet Riyadi No. 17, Solo',
        'yoga.prasetyo@email.com',
        '081234567017',
        '2026-09-16 04:51:04',
        '2026-09-16 04:51:04'
    ),
    (
        25,
        'Citra Ayu',
        'Cirebon',
        '1994-07-30',
        'Jl. Siliwangi No. 4, Cirebon',
        'citra.ayu@email.com',
        '081234567018',
        '2026-09-16 04:51:04',
        '2026-09-16 04:51:04'
    ),
    (
        26,
        'Rizky Ramadhan',
        'Tangerang',
        '1992-09-16',
        'Jl. Jenderal Sudirman No. 28, Tangerang',
        'rizky.ramadhan@email.com',
        '081234567019',
        '2026-09-16 04:51:04',
        '2026-09-16 04:51:04'
    ),
    (
        27,
        'Putri Wulandari',
        'Bekasi',
        '1996-02-14',
        'Jl. Ahmad Yani No. 13, Bekasi',
        'putri.wulandari@email.com',
        '081234567020',
        '2026-09-16 04:51:04',
        '2026-09-16 04:51:04'
    ),
    (
        28,
        'Aditya Kurniawan',
        'Depok',
        '1989-06-27',
        'Jl. Margonda No. 21, Depok',
        'aditya.kurniawan@email.com',
        '081234567021',
        '2026-09-16 04:51:04',
        '2026-09-16 04:51:04'
    ),
    (
        29,
        'Sari Dewi',
        'Samarinda',
        '1993-10-11',
        'Jl. Mulawarman No. 16, Samarinda',
        'sari.dewi@email.com',
        '081234567022',
        '2026-09-16 04:51:04',
        '2026-09-16 04:51:04'
    ),
    (
        30,
        'Eko Prasetyo',
        'Banjarmasin',
        '1991-04-03',
        'Jl. A. Yani No. 19, Banjarmasin',
        'eko.prasetyo@email.com',
        '081234567023',
        '2026-09-16 04:51:04',
        '2026-09-16 04:51:04'
    ),
    (
        31,
        'Wulan Sari',
        'Mataram',
        '1995-12-29',
        'Jl. Pejanggik No. 8, Mataram',
        'wulan.sari@email.com',
        '081234567024',
        '2026-09-16 04:51:04',
        '2026-09-16 04:51:04'
    ),
    (
        32,
        'Taufik Hidayat',
        'Kupang',
        '1987-08-17',
        'Jl. El Tari No. 2, Kupang',
        'taufik.hidayat@email.com',
        '081234567025',
        '2026-09-16 04:51:04',
        '2026-09-16 04:51:04'
    ),
    (
        33,
        'Ayu Lestari',
        'Ambon',
        '1994-05-06',
        'Jl. Pattimura No. 24, Ambon',
        'ayu.lestari@email.com',
        '081234567026',
        '2026-09-16 04:51:04',
        '2026-09-16 04:51:04'
    ),
    (
        34,
        'Rendi Saputra',
        'Jayapura',
        '1990-11-13',
        'Jl. Yos Sudarso No. 27, Jayapura',
        'rendi.saputra@email.com',
        '081234567027',
        '2026-09-16 04:51:04',
        '2026-09-16 04:51:04'
    ),
    (
        35,
        'Melati Kusuma',
        'Batam',
        '1992-01-22',
        'Jl. Engku Putri No. 10, Batam',
        'melati.kusuma@email.com',
        '081234567028',
        '2026-09-16 04:51:04',
        '2026-09-16 04:51:04'
    ),
    (
        36,
        'Arif Budiman',
        'Bandar Lampung',
        '1988-09-04',
        'Jl. Raden Intan No. 12, Bandar Lampung',
        'arif.budiman@email.com',
        '081234567029',
        '2026-09-16 04:51:04',
        '2026-09-16 04:51:04'
    ),
    (
        37,
        'Nadia Safira',
        'Jambi',
        '1996-06-15',
        'Jl. Sultan Thaha No. 5, Jambi',
        'nadia.safira@email.com',
        '081234567030',
        '2026-09-16 04:51:04',
        '2026-09-16 04:51:04'
    );

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
    `id` int(11) NOT NULL,
    `pegawai_id` int(11) DEFAULT NULL,
    `nama_lengkap` varchar(255) NOT NULL,
    `email` varchar(255) NOT NULL,
    `password` varchar(255) NOT NULL,
    `role` enum(
        'super admin',
        'admin',
        'supervisor',
        'user',
        'guest'
    ) NOT NULL DEFAULT 'user',
    `created_at` timestamp NULL DEFAULT current_timestamp(),
    `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    `foto_profil` varchar(255) DEFAULT NULL,
    `nomor_hp` varchar(20) DEFAULT NULL,
    `keterangan` text DEFAULT NULL,
    `is_guest` tinyint(1) DEFAULT 0,
    `is_active` tinyint(1) NOT NULL DEFAULT 1
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO
    `users` (
        `id`,
        `pegawai_id`,
        `nama_lengkap`,
        `email`,
        `password`,
        `role`,
        `created_at`,
        `updated_at`,
        `foto_profil`,
        `nomor_hp`,
        `keterangan`,
        `is_guest`,
        `is_active`
    )
VALUES (
        1,
        13,
        'super admin',
        'superadmin@galeria.com',
        '$2a$12$GZxcV0xlojxkuo5PxA1yw.WCFnXW724TCCFJLljkGzI08vs6sZ1h.',
        'super admin',
        '2026-06-11 09:54:11',
        '2026-09-16 04:57:24',
        NULL,
        NULL,
        NULL,
        0,
        1
    ),
    (
        17,
        28,
        'Aditya Kurniawan',
        'aditya.kurniawan@email.com',
        '$2b$10$/Lfla933itTJ65FpDKkP1eQFr/EpXMhjDdphzAtlL3In25mvUuFky',
        'user',
        '2026-09-16 04:53:50',
        '2026-09-16 04:53:50',
        NULL,
        NULL,
        NULL,
        0,
        1
    ),
    (
        18,
        20,
        'Bayu Pratama',
        'bayu.pratama@email.com',
        '$2b$10$lNq5IgWQVpT9X6n63TqZVuJLhFvZO9RXrT8uh3yzm0HxzOdCk/0M.',
        'supervisor',
        '2026-09-16 04:54:36',
        '2026-09-16 04:54:36',
        NULL,
        NULL,
        NULL,
        0,
        1
    ),
    (
        19,
        25,
        'Citra Ayu',
        'citra.ayu@email.com',
        '$2b$10$8OqASiQPy0CrMrq8kOT0G.kPGAu.CqaOts4pvf7I0v/8LYoUHbseK',
        'admin',
        '2026-09-16 04:54:58',
        '2026-09-16 04:54:58',
        NULL,
        NULL,
        NULL,
        0,
        1
    ),
    (
        20,
        NULL,
        'Aurelia Karisma',
        'Karisma@email.com',
        '$2b$10$n5lc3SSACNmqUYlEgyoKCO56N0lFTmfTt2VEw3dDc3F7Op6fdzRja',
        'user',
        '2026-09-16 04:55:40',
        '2026-09-16 04:55:40',
        NULL,
        '0129731827891',
        'magang',
        0,
        1
    );

--
-- Indexes for dumped tables
--

--
-- Indexes for table `aksesoris`
--
ALTER TABLE `aksesoris`
ADD PRIMARY KEY (`id`),
ADD UNIQUE KEY `kode_aksesoris` (`kode_aksesoris`),
ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `assets`
--
ALTER TABLE `assets`
ADD PRIMARY KEY (`id`),
ADD UNIQUE KEY `kode_aset` (`kode_aset`),
ADD UNIQUE KEY `no_sn` (`no_sn`),
ADD KEY `fk_asset_user` (`user_id`);

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs` ADD PRIMARY KEY (`id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications` ADD PRIMARY KEY (`id`);

--
-- Indexes for table `peminjaman`
--
ALTER TABLE `peminjaman`
ADD PRIMARY KEY (`id`),
ADD UNIQUE KEY `kode_pinjam` (`kode_pinjam`),
ADD KEY `fk_user_peminjaman` (`user_id`),
ADD KEY `idx_status` (`status`),
ADD KEY `idx_user_id` (`user_id`),
ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `peminjaman_items`
--
ALTER TABLE `peminjaman_items`
ADD PRIMARY KEY (`id`),
ADD KEY `peminjaman_id` (`peminjaman_id`),
ADD KEY `asset_id` (`asset_id`),
ADD KEY `fk_peminjaman_items_aksesoris` (`aksesoris_id`),
ADD KEY `idx_asset_aksesoris` (`asset_id`, `aksesoris_id`);

--
-- Indexes for table `tbl_pegawai`
--
ALTER TABLE `tbl_pegawai`
ADD PRIMARY KEY (`id`),
ADD KEY `idx_nama_email` (`nama_lengkap`, `email`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
ADD PRIMARY KEY (`id`),
ADD UNIQUE KEY `email` (`email`),
ADD KEY `fk_users_pegawai` (`pegawai_id`),
ADD KEY `idx_role_active` (`role`, `is_active`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `aksesoris`
--
ALTER TABLE `aksesoris`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,
AUTO_INCREMENT = 46;

--
-- AUTO_INCREMENT for table `assets`
--
ALTER TABLE `assets`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,
AUTO_INCREMENT = 19;

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,
AUTO_INCREMENT = 122;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,
AUTO_INCREMENT = 20;

--
-- AUTO_INCREMENT for table `peminjaman`
--
ALTER TABLE `peminjaman`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,
AUTO_INCREMENT = 5;

--
-- AUTO_INCREMENT for table `peminjaman_items`
--
ALTER TABLE `peminjaman_items`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,
AUTO_INCREMENT = 7;

--
-- AUTO_INCREMENT for table `tbl_pegawai`
--
ALTER TABLE `tbl_pegawai`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,
AUTO_INCREMENT = 38;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,
AUTO_INCREMENT = 21;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `aksesoris`
--
ALTER TABLE `aksesoris`
ADD CONSTRAINT `aksesoris_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `assets`
--
ALTER TABLE `assets`
ADD CONSTRAINT `fk_asset_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `peminjaman`
--
ALTER TABLE `peminjaman`
ADD CONSTRAINT `fk_user_peminjaman` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `peminjaman_items`
--
ALTER TABLE `peminjaman_items`
ADD CONSTRAINT `fk_peminjaman_items_aksesoris` FOREIGN KEY (`aksesoris_id`) REFERENCES `aksesoris` (`id`) ON DELETE SET NULL,
ADD CONSTRAINT `peminjaman_items_ibfk_1` FOREIGN KEY (`peminjaman_id`) REFERENCES `peminjaman` (`id`) ON DELETE CASCADE,
ADD CONSTRAINT `peminjaman_items_ibfk_2` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`id`);

--
-- Constraints for table `users`
--
ALTER TABLE `users`
ADD CONSTRAINT `fk_users_pegawai` FOREIGN KEY (`pegawai_id`) REFERENCES `tbl_pegawai` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */
;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */
;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */
;