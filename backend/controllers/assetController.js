const Asset = require("../models/assetModel");
const Category = require("../models/categoryModel"); // Tambahkan ini
const path = require("path");
const fs = require("fs");
const { optimizeImage } = require("../utils/imageOptimizer");
const AuditLog = require("../models/auditModel");
const db = require("../config/db");

// Helper: Sinkronisasi jumlah unit, stok siap, dan kondisi master di tabel assets
async function syncAssetTotals(assetId, conn = db) {
  try {
    const [counts] = await conn.query(`
      SELECT 
        COUNT(*) as total_units,
        SUM(CASE WHEN kondisi = 'Siap Digunakan' AND status_pinjam = 'Tersedia' THEN 1 ELSE 0 END) as ready_units,
        SUM(CASE WHEN kondisi = 'Rusak' THEN 1 ELSE 0 END) as rusak_units,
        SUM(CASE WHEN kondisi = 'Rusak Berat' THEN 1 ELSE 0 END) as rusak_berat_units,
        SUM(CASE WHEN kondisi = 'Maintenance' THEN 1 ELSE 0 END) as maintenance_units
      FROM asset_units 
      WHERE asset_id = ?
    `, [assetId]);

    const row = counts[0] || {};
    const totalUnits = parseInt(row.total_units, 10) || 0;
    const readyUnits = parseInt(row.ready_units, 10) || 0;

    let masterKondisi = "Siap Digunakan";
    if (totalUnits > 0) {
      if (readyUnits === totalUnits) masterKondisi = "Siap Digunakan";
      else if (readyUnits === 0 && (row.rusak_units > 0 || row.rusak_berat_units > 0)) masterKondisi = "Rusak";
      else if (readyUnits === 0 && row.maintenance_units > 0) masterKondisi = "Maintenance";
      else masterKondisi = "Siap Digunakan";
    }

    if (totalUnits > 0) {
      await conn.query(`
        UPDATE assets 
        SET jumlah = ?, jumlah_total = ?, kondisi = ?
        WHERE id = ?
      `, [readyUnits, totalUnits, masterKondisi, assetId]);
    }

    return { totalUnits, readyUnits, masterKondisi };
  } catch (err) {
    console.error("Error syncAssetTotals:", err);
  }
}

const assetController = {
  // GET /api/assets
  getAll: async (req, res) => {
    try {
      const assets = await Asset.getAll();
      const [units] = await db.query(
        "SELECT id, asset_id, kode_unit, nama_unit, kondisi, status_pinjam FROM asset_units ORDER BY id ASC"
      );
      const unitsByAsset = {};
      for (const u of units) {
        if (!unitsByAsset[u.asset_id]) unitsByAsset[u.asset_id] = [];
        unitsByAsset[u.asset_id].push(u);
      }
      const data = assets.map((a) => ({
        ...a,
        units: unitsByAsset[a.id] || [],
      }));

      res.json({
        success: true,
        message: "Data aset berhasil diambil",
        data,
      });
    } catch (error) {
      console.error("Error getAll assets:", error);
      res.status(500).json({
        success: false,
        message: "Gagal mengambil data aset",
        error: error.message,
      });
    }
  },

  // GET /api/assets/:id
  getById: async (req, res) => {
    try {
      const asset = await Asset.getById(req.params.id);
      if (!asset) {
        return res.status(404).json({
          success: false,
          message: "Aset tidak ditemukan",
        });
      }
      res.json({
        success: true,
        message: "Detail aset berhasil diambil",
        data: asset,
      });
    } catch (error) {
      console.error("Error getById asset:", error);
      res.status(500).json({
        success: false,
        message: "Gagal mengambil detail aset",
        error: error.message,
      });
    }
  },

  // POST /api/assets
  create: async (req, res) => {
    try {
      const { nama_aset, kategori, jenis_aset } = req.body;

      // Validasi field wajib
      if (!nama_aset || !kategori || !jenis_aset) {
        return res.status(400).json({
          success: false,
          message: "Nama Aset, Kategori, dan Jenis Aset wajib diisi",
        });
      }

      // Ambil kode_singkat dari kategori
      const categoryData = await Category.findByNama(kategori);
      const kodeSingkat = categoryData ? categoryData.kode_singkat : "GEN";

      // Auto-generate kode_aset berdasarkan jenis_aset dan kategori
      const generatedKode = await Asset.getNextKodeAset(jenis_aset, kodeSingkat);

      // Jika ada file upload, simpan path-nya & Optimize
      const data = { 
        ...req.body, 
        kode_aset: generatedKode,
        user_id: req.user.id 
      };
      if (req.file) {
        const newFilename = await optimizeImage(
          req.file.path,
          path.join(__dirname, "..", "public", "uploads"),
          req.file.filename
        );
        data.gambar = `/uploads/${newFilename}`;
      }

      const newAsset = await Asset.create(data);
      const assetId = newAsset.id || newAsset.insertId;
      const qty = parseInt(data.jumlah, 10) || 1;

      for (let i = 1; i <= qty; i++) {
        const numStr = String(i).padStart(2, "0");
        const kodeUnit = `${data.kode_aset}-${numStr}`;
        const unitSn = qty === 1 ? (data.no_sn || null) : null;
        const unitNama = qty > 1 ? `${data.nama_aset} (Unit ${i})` : data.nama_aset;

        await db.query(
          `INSERT INTO asset_units (asset_id, kode_unit, nama_unit, no_sn, kondisi, status_pinjam, lokasi_unit, keterangan)
           VALUES (?, ?, ?, ?, ?, 'Tersedia', ?, ?)`,
          [
            assetId,
            kodeUnit,
            unitNama,
            unitSn,
            data.kondisi || "Siap Digunakan",
            data.lokasi_aset || null,
            data.keterangan || null,
          ]
        );
      }
      await syncAssetTotals(assetId);

      await AuditLog.create({
        userId: req.user?.userId,
        userName: req.user?.nama,
        action: 'CREATE',
        entityType: 'Aset',
        entityId: assetId,
        details: `Menambahkan aset: ${data.nama_aset} (${data.kode_aset}) dengan ${qty} unit fisik`
      });

      res.status(201).json({
        success: true,
        message: "Aset berhasil ditambahkan",
        data: newAsset,
      });
    } catch (error) {
      console.error("Error create asset:", error);

      // Handle duplicate entry
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({
          success: false,
          message: "Kode Aset atau No. SN sudah ada di database",
        });
      }

      res.status(500).json({
        success: false,
        message: "Gagal menambahkan aset",
        error: error.message,
      });
    }
  },

  // PUT /api/assets/:id
  update: async (req, res) => {
    try {
      const { id } = req.params;

      // Cek apakah aset ada
      const existing = await Asset.getById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: "Aset tidak ditemukan",
        });
      }

      const { kode_aset, nama_aset } = req.body;

      // Validasi field wajib
      if (!kode_aset || !nama_aset) {
        return res.status(400).json({
          success: false,
          message: "Kode Aset dan Nama Aset wajib diisi",
        });
      }

      const data = { ...req.body };

      // Sinkronisasi jumlah_total berdasarkan perubahan jumlah
      const newJumlah = parseInt(data.jumlah) || 0;
      const oldJumlah = parseInt(existing.jumlah) || 0;
      const oldJumlahTotal = parseInt(existing.jumlah_total) || oldJumlah;
      data.jumlah_total = oldJumlahTotal + (newJumlah - oldJumlah);

      // Jika ada file upload baru, simpan path, hapus gambar lama & Optimize
      if (req.file) {
        const newFilename = await optimizeImage(
          req.file.path,
          path.join(__dirname, "..", "public", "uploads"),
          req.file.filename
        );
        data.gambar = `/uploads/${newFilename}`;

        // Hapus file gambar lama jika ada
        if (existing.gambar) {
          const oldPath = path.join(__dirname, "..", "public", existing.gambar);
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
          }
        }
      } else {
        // Pertahankan gambar lama jika tidak upload baru
        data.gambar = existing.gambar;
      }

      const affectedRows = await Asset.update(id, data);

      if (affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Aset tidak ditemukan",
        });
      }

      const updated = await Asset.getById(id);

      const changedFields = [];
      const dataKeys = Object.keys(req.body);
      dataKeys.forEach(key => {
        let existingVal = existing[key];
        let newVal = req.body[key];

        // Format Date ke YYYY-MM-DD agar sama dengan format dari frontend
        if (existingVal instanceof Date) {
          existingVal = existingVal.toISOString().split('T')[0];
        }

        // Tangani null dan empty string
        if (existingVal === null || existingVal === 'null') existingVal = "";
        if (newVal === null || newVal === 'null') newVal = "";

        if (existingVal !== undefined && String(existingVal) !== String(newVal)) {
          changedFields.push(key.replace(/_/g, ' '));
        }
      });
      if (req.file) changedFields.push('gambar');
      const changedText = changedFields.length > 0 ? changedFields.join(", ") : "";

      await AuditLog.create({
        userId: req.user?.userId,
        userName: req.user?.nama,
        action: 'UPDATE',
        entityType: 'Aset',
        entityId: id,
        details: changedText 
          ? `Memperbarui ${changedText} pada ${updated.nama_aset} (${updated.kode_aset})`
          : `Memperbarui ${updated.nama_aset} (${updated.kode_aset})`
      });

      res.json({
        success: true,
        message: "Aset berhasil diperbarui",
        data: updated,
      });
    } catch (error) {
      console.error("Error update asset:", error);

      if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({
          success: false,
          message: "Kode Aset atau No. SN sudah digunakan oleh aset lain",
        });
      }

      res.status(500).json({
        success: false,
        message: "Gagal memperbarui aset",
        error: error.message,
      });
    }
  },

  // DELETE /api/assets/:id
  delete: async (req, res) => {
    const connection = await db.getConnection();
    try {
      const { id } = req.params;
      await connection.beginTransaction();

      // Cek apakah aset ada & ambil data gambar
      const [assetRows] = await connection.query("SELECT * FROM assets WHERE id = ?", [id]);
      const existing = assetRows[0];
      if (!existing) {
        await connection.rollback();
        return res.status(404).json({
          success: false,
          message: "Aset tidak ditemukan",
        });
      }

      // Cek apakah aset sedang dipinjam (peminjaman aktif)
      const [activeLoans] = await connection.query(
        `SELECT DISTINCT p.kode_pinjam, p.tanggal_peminjaman, p.alasan_peminjaman, p.status,
                (SELECT COUNT(*) FROM peminjaman_items pi2 WHERE pi2.peminjaman_id = p.id) AS total_aset
         FROM peminjaman_items pi
         JOIN peminjaman p ON pi.peminjaman_id = p.id
         WHERE pi.asset_id = ? AND p.status NOT IN ('Peminjaman Selesai')
         ORDER BY p.created_at DESC`,
        [id]
      );

      if (activeLoans.length > 0) {
        await connection.rollback();
        return res.status(409).json({
          success: false,
          message: 'Aset tidak dapat dihapus karena masih terdapat dalam peminjaman yang belum selesai.',
          activePeminjaman: activeLoans
        });
      }

      // Hapus data peminjaman_items terkait (yang peminjaman-nya sudah selesai)
      await connection.query(
        "DELETE FROM peminjaman_items WHERE asset_id = ?",
        [id]
      );

      // Hapus aset
      await connection.query("DELETE FROM assets WHERE id = ?", [id]);

      await connection.commit();

      // Hapus file gambar jika ada (dilakukan setelah commit agar tidak kehilangan data jika rollback)
      if (existing.gambar) {
        const imgPath = path.join(__dirname, "..", "public", existing.gambar);
        if (fs.existsSync(imgPath)) {
          fs.unlinkSync(imgPath);
        }
      }

      await AuditLog.create({
        userId: req.user?.userId,
        userName: req.user?.nama,
        action: 'DELETE',
        entityType: 'Aset',
        entityId: id,
        details: `Menghapus aset: ${existing.nama_aset} (${existing.kode_aset})`
      });

      res.json({
        success: true,
        message: "Aset dan seluruh riwayat terkait berhasil dihapus",
      });
    } catch (error) {
      await connection.rollback();
      console.error("Error delete asset:", error);

      // Handle foreign key constraint error sebagai fallback
      if (error.code === "ER_ROW_IS_REFERENCED_2" || error.code === "ER_ROW_IS_REFERENCED") {
        return res.status(409).json({
          success: false,
          message: "Aset tidak dapat dihapus karena masih memiliki data terkait di sistem. Pastikan semua peminjaman terkait aset ini sudah selesai.",
        });
      }

      res.status(500).json({
        success: false,
        message: "Gagal menghapus aset",
        error: error.message,
      });
    } finally {
      connection.release();
    }
  },

  // DELETE /api/assets/bulk/delete-all
  // Khusus Super Admin: Hapus seluruh aset dan/atau aksesoris
  deleteAll: async (req, res) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const { target = "both" } = req.body || {}; // "both", "assets", "accessories"

      // 1. Cek apakah ada peminjaman aktif yang belum selesai
      if (target === "assets" || target === "both") {
        const [activeAssetLoans] = await connection.query(
          `SELECT p.kode_pinjam, p.status, p.nama_peminjam
           FROM peminjaman_items pi
           JOIN peminjaman p ON pi.peminjaman_id = p.id
           WHERE pi.asset_id IS NOT NULL 
             AND p.status IN ('Menunggu Persetujuan', 'Sedang Dipinjam', 'Menunggu Verifikasi')`
        );
        if (activeAssetLoans.length > 0) {
          await connection.rollback();
          return res.status(409).json({
            success: false,
            message: "Tidak dapat menghapus seluruh aset karena masih terdapat peminjaman aktif yang belum selesai.",
            activeLoans: activeAssetLoans
          });
        }
      }

      if (target === "accessories" || target === "both") {
        const [activeAksLoans] = await connection.query(
          `SELECT p.kode_pinjam, p.status, p.nama_peminjam
           FROM peminjaman_items pi
           JOIN peminjaman p ON pi.peminjaman_id = p.id
           WHERE pi.aksesoris_id IS NOT NULL 
             AND p.status IN ('Menunggu Persetujuan', 'Sedang Dipinjam', 'Menunggu Verifikasi')`
        );
        if (activeAksLoans.length > 0) {
          await connection.rollback();
          return res.status(409).json({
            success: false,
            message: "Tidak dapat menghapus seluruh aksesoris karena masih terdapat peminjaman aktif yang belum selesai.",
            activeLoans: activeAksLoans
          });
        }
      }

      // Ambil file gambar sebelum data dihapus dari database
      let assetImages = [];
      let aksImages = [];

      if (target === "assets" || target === "both") {
        const [assets] = await connection.query("SELECT gambar FROM assets WHERE gambar IS NOT NULL");
        assetImages = assets.map(a => a.gambar);

        // Hapus relasi peminjaman_items yang mereferensikan aset
        await connection.query("DELETE FROM peminjaman_items WHERE asset_id IS NOT NULL");
        // Hapus seluruh aset
        await connection.query("DELETE FROM assets");
      }

      if (target === "accessories" || target === "both") {
        const [aksesoris] = await connection.query("SELECT gambar FROM aksesoris WHERE gambar IS NOT NULL");
        aksImages = aksesoris.map(a => a.gambar);

        // Hapus relasi peminjaman_items yang mereferensikan aksesoris
        await connection.query("DELETE FROM peminjaman_items WHERE aksesoris_id IS NOT NULL");
        // Hapus seluruh aksesoris
        await connection.query("DELETE FROM aksesoris");
      }

      await connection.commit();

      // Bersihkan file gambar di folder public/uploads
      const allImages = [...assetImages, ...aksImages];
      allImages.forEach(img => {
        if (img) {
          const fullPath = path.join(__dirname, "..", "public", img);
          if (fs.existsSync(fullPath)) {
            try { fs.unlinkSync(fullPath); } catch (e) { console.error("Error unlinking image:", fullPath, e); }
          }
        }
      });

      // Audit Log
      await AuditLog.create({
        userId: req.user?.userId,
        userName: req.user?.nama,
        action: 'DELETE',
        entityType: 'System',
        entityId: 'ALL',
        details: `SUPER ADMIN menghapus seluruh data: ${target === 'both' ? 'Aset & Aksesoris' : target === 'assets' ? 'Seluruh Aset' : 'Seluruh Aksesoris'}`
      });

      res.json({
        success: true,
        message: `Seluruh data ${target === 'both' ? 'Aset & Aksesoris' : target === 'assets' ? 'Aset' : 'Aksesoris'} berhasil dihapus permanen oleh Super Admin.`
      });
    } catch (error) {
      await connection.rollback();
      console.error("Error deleteAll inventory:", error);
      res.status(500).json({
        success: false,
        message: "Gagal menghapus seluruh data",
        error: error.message
      });
    } finally {
      connection.release();
    }
  },

  // PATCH /api/assets/:id/kondisi
  updateKondisi: async (req, res) => {
    try {
      const { id } = req.params;
      const { kondisi, is_split, jumlah_ubah, keterangan } = req.body;

      if (!kondisi) {
        return res.status(400).json({ success: false, message: "Kondisi wajib diisi" });
      }

      const existing = await Asset.getById(id);
      if (!existing) {
        return res.status(404).json({ success: false, message: "Aset tidak ditemukan" });
      }

      const currentQty = parseInt(existing.jumlah, 10) || 1;
      const qtyToSplit = parseInt(jumlah_ubah, 10);

      // Jika user memilih split dan jumlah yang diubah valid (< total unit)
      if (is_split && qtyToSplit > 0 && qtyToSplit < currentQty) {
        const conn = await db.getConnection();
        try {
          await conn.beginTransaction();

          // Generate kode aset turunan unik
          const baseKode = existing.kode_aset;
          let counter = 1;
          let newKodeAset = `${baseKode}-P${counter}`;
          while (true) {
            const [check] = await conn.query("SELECT id FROM assets WHERE kode_aset = ?", [newKodeAset]);
            if (check.length === 0) break;
            counter++;
            newKodeAset = `${baseKode}-P${counter}`;
          }

          let newNoSn = null;
          if (existing.no_sn) {
            newNoSn = `${existing.no_sn}-P${counter}`;
          }

          const splitNote = keterangan?.trim()
            ? `${keterangan.trim()} (Pecahan dari ${existing.kode_aset})`
            : `Pecahan ${qtyToSplit} unit dari ${existing.kode_aset}`;

          // Insert baris baru untuk unit yang kondisinya berbeda
          const [insertRes] = await conn.query(
            `INSERT INTO assets 
              (kode_aset, nama_aset, pengguna, kategori, merek, model, no_sn, spesifikasi, lokasi_aset, jenis_aset, kondisi, unit, gambar, keterangan, jumlah, harga_aset, jumlah_total, tanggal_pembelian, user_id)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              newKodeAset,
              existing.nama_aset,
              existing.pengguna || null,
              existing.kategori || null,
              existing.merek || null,
              existing.model || null,
              newNoSn,
              existing.spesifikasi || null,
              existing.lokasi_aset || null,
              existing.jenis_aset || null,
              kondisi,
              existing.unit || null,
              existing.gambar || null,
              splitNote,
              qtyToSplit,
              existing.harga_aset || null,
              qtyToSplit,
              existing.tanggal_pembelian || null,
              req.user?.userId || existing.user_id || null,
            ]
          );

          // Kurangi stok pada aset asal
          const remainingJumlah = currentQty - qtyToSplit;
          const remainingTotal = Math.max(0, (parseInt(existing.jumlah_total, 10) || currentQty) - qtyToSplit);
          await conn.query(
            "UPDATE assets SET jumlah = ?, jumlah_total = ? WHERE id = ?",
            [remainingJumlah, remainingTotal, id]
          );

          await conn.commit();

          await AuditLog.create({
            userId: req.user?.userId,
            userName: req.user?.nama,
            action: 'UPDATE',
            entityType: 'Aset',
            entityId: id,
            details: `Pemisahan (Split) aset ${existing.kode_aset}: ${qtyToSplit} unit dipindah ke kondisi "${kondisi}" (Kode baru: ${newKodeAset}), sisa ${remainingJumlah} unit.`
          });

          return res.json({
            success: true,
            message: `Berhasil memisahkan ${qtyToSplit} unit ke kondisi "${kondisi}" dengan kode ${newKodeAset}`,
            data: {
              newKodeAset,
              newAssetId: insertRes.insertId,
              remainingJumlah,
              splitJumlah: qtyToSplit
            }
          });
        } catch (splitErr) {
          await conn.rollback();
          throw splitErr;
        } finally {
          conn.release();
        }
      }

      // Update seluruh unit seperti biasa
      const affectedRows = await Asset.updateKondisi(id, kondisi);
      if (affectedRows === 0) {
        return res.status(400).json({ success: false, message: "Kondisi gagal diperbarui" });
      }

      if (keterangan && keterangan.trim()) {
        await db.query("UPDATE assets SET keterangan = ? WHERE id = ?", [keterangan.trim(), id]);
      }

      await AuditLog.create({
        userId: req.user?.userId,
        userName: req.user?.nama,
        action: 'UPDATE',
        entityType: 'Aset',
        entityId: id,
        details: `Mengubah kondisi aset ${existing.kode_aset} menjadi: ${kondisi}`
      });

      res.json({ success: true, message: "Kondisi aset berhasil diperbarui" });
    } catch (error) {
      console.error("Error updateKondisi asset:", error);
      res.status(500).json({ success: false, message: "Gagal memperbarui kondisi", error: error.message });
    }
  },

  // GET /api/assets/search?q=keyword
  search: async (req, res) => {
    try {
      const { q } = req.query;
      if (!q) {
        return res.status(400).json({
          success: false,
          message: "Parameter pencarian (q) wajib diisi",
        });
      }

      const assets = await Asset.search(q);
      res.json({
        success: true,
        message: `Ditemukan ${assets.length} aset`,
        data: assets,
      });
    } catch (error) {
      console.error("Error search assets:", error);
      res.status(500).json({
        success: false,
        message: "Gagal mencari aset",
        error: error.message,
      });
    }
  },

  // POST /api/assets/import (Import massal dari Excel)
  importExcel: async (req, res) => {
    const connection = await db.getConnection();
    try {
      const { items } = req.body;
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Data import tidak boleh kosong",
        });
      }

      await connection.beginTransaction();

      const nextNumMap = {};
      const inserted = [];

      for (const item of items) {
        const namaAset = (item.namaAset || item.nama_aset || "").trim();
        if (!namaAset) continue; // Lewati jika nama aset kosong

        const kategori = (item.kategori || "").trim() || null;
        const merek = (item.merek || "").trim() || null;
        const model = (item.model || "").trim() || null;
        let jenisAset = (item.jenisAset || item.jenis_aset || "").trim();
        if (jenisAset !== "Galeria Studio" && jenisAset !== "Galeria Production") {
          if (jenisAset.toLowerCase().includes("studio")) jenisAset = "Galeria Studio";
          else jenisAset = "Galeria Production";
        }

        // Tentukan kode singkat kategori
        let kodeSingkat = "GEN";
        if (kategori) {
          const [catRows] = await connection.query(
            "SELECT kode_singkat FROM categories WHERE nama = ? AND tipe = 'aset'",
            [kategori]
          );
          if (catRows[0] && catRows[0].kode_singkat) {
            kodeSingkat = catRows[0].kode_singkat.toUpperCase().slice(0, 4);
          } else {
            kodeSingkat = kategori.replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase() || "GEN";
          }
        }

        const jenisKode = jenisAset === "Galeria Production" ? "GPRO" : "GS";
        const prefix = `AST-${jenisKode}-${kodeSingkat}-`;

        // Tentukan nomor urut berikutnya per prefix
        if (nextNumMap[prefix] === undefined) {
          const [rows] = await connection.query(
            "SELECT kode_aset FROM assets WHERE kode_aset LIKE ? ORDER BY id DESC LIMIT 1",
            [`${prefix}%`]
          );
          let currentMax = 0;
          if (rows[0] && rows[0].kode_aset) {
            const match = rows[0].kode_aset.match(new RegExp(`AST-${jenisKode}-${kodeSingkat}-(\\d+)`));
            if (match) currentMax = parseInt(match[1], 10);
          }
          nextNumMap[prefix] = currentMax + 1;
        } else {
          nextNumMap[prefix] += 1;
        }

        const kodeAset = `${prefix}${String(nextNumMap[prefix]).padStart(3, "0")}`;

        const rawJumlah = parseInt(item.jumlah, 10);
        const jumlah = !isNaN(rawJumlah) && rawJumlah > 0 ? rawJumlah : 1;
        const rawHarga = parseFloat(item.hargaAset || item.harga_aset);
        const hargaAset = !isNaN(rawHarga) && rawHarga >= 0 ? rawHarga : 0;
        const kondisi = ["Siap Digunakan", "Rusak", "Rusak Berat", "Maintenance", "Dijual"].includes(item.kondisi)
          ? item.kondisi
          : "Siap Digunakan";
        const lokasiAset = (item.lokasiAset || item.lokasi_aset || "").trim() || null;
        const pengguna = (item.pengguna || "").trim() || null;
        const noSn = (item.noSN || item.no_sn || "").trim() || null;
        const spesifikasi = (item.spesifikasi || "").trim() || null;
        const keterangan = (item.keterangan || "").trim() || null;
        const tanggalPembelian = (item.tanggalPembelian || item.tanggal_pembelian || "").trim() || null;
        let tipeHarga = (item.tipeHarga || item.tipe_harga || item["Tipe Perhitungan Harga"] || item["Tipe Harga"] || "").trim();
        if (tipeHarga.toLowerCase().includes("paket") || tipeHarga.toLowerCase().includes("set") || tipeHarga.toLowerCase().includes("box")) {
          tipeHarga = "Per Paket";
        } else {
          tipeHarga = "Per Unit";
        }

        const [insertRes] = await connection.query(
          `INSERT INTO assets
            (kode_aset, nama_aset, pengguna, kategori, merek, model, no_sn, spesifikasi, lokasi_aset, jenis_aset, kondisi, unit, gambar, keterangan, jumlah, harga_aset, tipe_harga, jumlah_total, tanggal_pembelian, user_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            kodeAset,
            namaAset,
            pengguna,
            kategori,
            merek,
            model,
            noSn,
            spesifikasi,
            lokasiAset,
            jenisAset,
            kondisi,
            null,
            null, // gambar kosong
            keterangan,
            jumlah,
            hargaAset,
            tipeHarga,
            jumlah,
            tanggalPembelian,
            req.user?.userId || req.user?.id || null,
          ]
        );

        const assetId = insertRes.insertId;

        for (let u = 1; u <= jumlah; u++) {
          const numStr = String(u).padStart(2, "0");
          const kodeUnit = `${kodeAset}-${numStr}`;
          const unitSn = jumlah === 1 ? noSn : (noSn ? `${noSn}-${numStr}` : null);
          const unitNama = jumlah > 1 ? `${namaAset} #${numStr}` : namaAset;

          await connection.query(
            `INSERT INTO asset_units (asset_id, kode_unit, nama_unit, no_sn, kondisi, status_pinjam, lokasi_unit, keterangan)
             VALUES (?, ?, ?, ?, ?, 'Tersedia', ?, ?)`,
            [
              assetId,
              kodeUnit,
              unitNama,
              unitSn,
              kondisi,
              lokasiAset,
              keterangan,
            ]
          );
        }
        await syncAssetTotals(assetId, connection);

        inserted.push({ id: assetId, kodeAset, namaAset });
      }

      await connection.commit();

      if (inserted.length > 0) {
        await AuditLog.create({
          userId: req.user?.userId || req.user?.id,
          userName: req.user?.nama,
          action: "CREATE",
          entityType: "Aset",
          entityId: inserted[0].id,
          details: `Import massal ${inserted.length} aset dari file Excel`,
        });
      }

      res.status(201).json({
        success: true,
        message: `Berhasil mengimpor ${inserted.length} data aset`,
        count: inserted.length,
        data: inserted,
      });
    } catch (error) {
      await connection.rollback();
      console.error("Error import aset:", error);
      res.status(500).json({
        success: false,
        message: "Gagal mengimpor data aset",
        error: error.message,
      });
    } finally {
      connection.release();
    }
  },

  // GET /api/assets/:id/units
  getUnits: async (req, res) => {
    try {
      const { id } = req.params;
      const [units] = await db.query(
        "SELECT * FROM asset_units WHERE asset_id = ? ORDER BY id ASC",
        [id]
      );
      res.json({
        success: true,
        data: units,
      });
    } catch (error) {
      console.error("Error getUnits:", error);
      res.status(500).json({ success: false, message: "Gagal mengambil unit aset", error: error.message });
    }
  },

  // POST /api/assets/:id/units
  addUnit: async (req, res) => {
    try {
      const { id } = req.params;
      const asset = await Asset.getById(id);
      if (!asset) {
        return res.status(404).json({ success: false, message: "Aset tidak ditemukan" });
      }

      const { kode_unit, nama_unit, no_sn, kondisi = "Siap Digunakan", lokasi_unit, keterangan } = req.body;

      let finalKodeUnit = kode_unit;
      if (!finalKodeUnit) {
        const [existingUnits] = await db.query(
          "SELECT kode_unit FROM asset_units WHERE asset_id = ? ORDER BY id DESC LIMIT 1",
          [id]
        );
        let nextUnitNum = 1;
        if (existingUnits[0]) {
          const match = existingUnits[0].kode_unit.match(/-(\d+)$/);
          if (match) nextUnitNum = parseInt(match[1], 10) + 1;
        }
        finalKodeUnit = `${asset.kode_aset}-${String(nextUnitNum).padStart(2, "0")}`;
      }

      const [insertRes] = await db.query(
        `INSERT INTO asset_units (asset_id, kode_unit, nama_unit, no_sn, kondisi, status_pinjam, lokasi_unit, keterangan)
         VALUES (?, ?, ?, ?, ?, 'Tersedia', ?, ?)`,
        [
          id,
          finalKodeUnit,
          nama_unit || `${asset.nama_aset} (Tambahan)`,
          no_sn || null,
          kondisi,
          lokasi_unit || asset.lokasi_aset || null,
          keterangan || null,
        ]
      );

      await syncAssetTotals(id);

      await AuditLog.create({
        userId: req.user?.userId,
        userName: req.user?.nama,
        action: "CREATE",
        entityType: "Aset Unit",
        entityId: insertRes.insertId,
        details: `Menambahkan unit fisik ${finalKodeUnit} untuk ${asset.nama_aset}`,
      });

      res.status(201).json({
        success: true,
        message: "Unit fisik berhasil ditambahkan",
        data: { id: insertRes.insertId, kode_unit: finalKodeUnit },
      });
    } catch (error) {
      console.error("Error addUnit:", error);
      res.status(500).json({ success: false, message: "Gagal menambahkan unit", error: error.message });
    }
  },

  // PUT /api/assets/units/:unitId
  updateUnit: async (req, res) => {
    try {
      const { unitId } = req.params;
      const [unitRows] = await db.query("SELECT * FROM asset_units WHERE id = ?", [unitId]);
      if (unitRows.length === 0) {
        return res.status(404).json({ success: false, message: "Unit aset tidak ditemukan" });
      }
      const unit = unitRows[0];
      const { kode_unit, nama_unit, no_sn, kondisi, status_pinjam, lokasi_unit, keterangan } = req.body;

      await db.query(
        `UPDATE asset_units 
         SET kode_unit = COALESCE(?, kode_unit),
             nama_unit = ?,
             no_sn = ?,
             kondisi = COALESCE(?, kondisi),
             status_pinjam = COALESCE(?, status_pinjam),
             lokasi_unit = ?,
             keterangan = ?
         WHERE id = ?`,
        [
          kode_unit || unit.kode_unit,
          nama_unit !== undefined ? nama_unit : unit.nama_unit,
          no_sn !== undefined ? no_sn : unit.no_sn,
          kondisi || unit.kondisi,
          status_pinjam || unit.status_pinjam,
          lokasi_unit !== undefined ? lokasi_unit : unit.lokasi_unit,
          keterangan !== undefined ? keterangan : unit.keterangan,
          unitId,
        ]
      );

      await syncAssetTotals(unit.asset_id);

      await AuditLog.create({
        userId: req.user?.userId,
        userName: req.user?.nama,
        action: "UPDATE",
        entityType: "Aset Unit",
        entityId: unitId,
        details: `Mengubah unit ${unit.kode_unit}: kondisi menjadi ${kondisi || unit.kondisi}`,
      });

      const [updated] = await db.query("SELECT * FROM asset_units WHERE id = ?", [unitId]);
      res.json({
        success: true,
        message: "Unit fisik berhasil diperbarui",
        data: updated[0],
      });
    } catch (error) {
      console.error("Error updateUnit:", error);
      res.status(500).json({ success: false, message: "Gagal memperbarui unit", error: error.message });
    }
  },

  // DELETE /api/assets/units/:unitId
  deleteUnit: async (req, res) => {
    try {
      const { unitId } = req.params;
      const [unitRows] = await db.query("SELECT * FROM asset_units WHERE id = ?", [unitId]);
      if (unitRows.length === 0) {
        return res.status(404).json({ success: false, message: "Unit aset tidak ditemukan" });
      }
      const unit = unitRows[0];

      if (unit.status_pinjam === "Dipinjam") {
        return res.status(400).json({ success: false, message: "Unit sedang dipinjam dan tidak dapat dihapus" });
      }

      await db.query("DELETE FROM asset_units WHERE id = ?", [unitId]);
      await syncAssetTotals(unit.asset_id);

      await AuditLog.create({
        userId: req.user?.userId,
        userName: req.user?.nama,
        action: "DELETE",
        entityType: "Aset Unit",
        entityId: unitId,
        details: `Menghapus unit fisik ${unit.kode_unit}`,
      });

      res.json({
        success: true,
        message: `Unit ${unit.kode_unit} berhasil dihapus`,
      });
    } catch (error) {
      console.error("Error deleteUnit:", error);
      res.status(500).json({ success: false, message: "Gagal menghapus unit", error: error.message });
    }
  },
};

module.exports = assetController;
