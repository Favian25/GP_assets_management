-- ==============================================
-- Migration: Add Aksesoris table & tipe column to categories/brands
-- ==============================================

-- 1. Add 'tipe' column to categories table
ALTER TABLE categories ADD COLUMN tipe ENUM('aset', 'aksesoris') NOT NULL DEFAULT 'aset' AFTER kode_singkat;

-- 2. Add 'tipe' column to brands table  
ALTER TABLE brands ADD COLUMN tipe ENUM('aset', 'aksesoris') NOT NULL DEFAULT 'aset' AFTER nama;

-- 3. Create aksesoris table
CREATE TABLE IF NOT EXISTS aksesoris (
  id INT AUTO_INCREMENT PRIMARY KEY,
  kode_aksesoris VARCHAR(50) NOT NULL UNIQUE,
  nama_aksesoris VARCHAR(255) NOT NULL,
  kategori VARCHAR(100) DEFAULT NULL,
  merek VARCHAR(100) DEFAULT NULL,
  model VARCHAR(100) DEFAULT NULL,
  jumlah_unit INT DEFAULT NULL,
  jumlah_total INT DEFAULT NULL,
  harga_aset BIGINT DEFAULT NULL,
  tanggal_pembelian DATE DEFAULT NULL,
  kondisi VARCHAR(50) DEFAULT 'Siap Digunakan',
  lokasi VARCHAR(255) DEFAULT NULL,
  gambar VARCHAR(500) DEFAULT NULL,
  keterangan TEXT DEFAULT NULL,
  user_id INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
