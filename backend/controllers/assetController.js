const Asset = require("../models/assetModel");
const Category = require("../models/categoryModel"); // Tambahkan ini
const path = require("path");
const fs = require("fs");
const { optimizeImage } = require("../utils/imageOptimizer");
const AuditLog = require("../models/auditModel");
const db = require("../config/db");

const assetController = {
  // GET /api/assets
  getAll: async (req, res) => {
    try {
      const assets = await Asset.getAll();
      res.json({
        success: true,
        message: "Data aset berhasil diambil",
        data: assets,
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

      await AuditLog.create({
        userId: req.user?.userId,
        userName: req.user?.nama,
        action: 'CREATE',
        entityType: 'Aset',
        entityId: newAsset.insertId,
        details: `Menambahkan aset: ${data.nama_aset} (${data.kode_aset})`
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

  // PATCH /api/assets/:id/kondisi
  updateKondisi: async (req, res) => {
    try {
      const { id } = req.params;
      const { kondisi } = req.body;

      if (!kondisi) {
        return res.status(400).json({ success: false, message: "Kondisi wajib diisi" });
      }

      const existing = await Asset.getById(id);
      if (!existing) {
        return res.status(404).json({ success: false, message: "Aset tidak ditemukan" });
      }

      const affectedRows = await Asset.updateKondisi(id, kondisi);
      if (affectedRows === 0) {
        return res.status(400).json({ success: false, message: "Kondisi gagal diperbarui" });
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

        const [insertRes] = await connection.query(
          `INSERT INTO assets
            (kode_aset, nama_aset, pengguna, kategori, merek, model, no_sn, spesifikasi, lokasi_aset, jenis_aset, kondisi, unit, gambar, keterangan, jumlah, harga_aset, jumlah_total, tanggal_pembelian, user_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
            jumlah,
            tanggalPembelian,
            req.user?.userId || req.user?.id || null,
          ]
        );

        inserted.push({ id: insertRes.insertId, kodeAset, namaAset });
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
};

module.exports = assetController;
