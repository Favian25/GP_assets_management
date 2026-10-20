const Aksesoris = require("../models/aksesorisModel");
const Category = require("../models/categoryModel");
const path = require("path");
const fs = require("fs");
const { optimizeImage } = require("../utils/imageOptimizer");
const AuditLog = require("../models/auditModel");
const db = require("../config/db");

const aksesorisController = {
  // GET /api/aksesoris
  getAll: async (req, res) => {
    try {
      const items = await Aksesoris.getAll();
      res.json({
        success: true,
        message: "Data aksesoris berhasil diambil",
        data: items,
      });
    } catch (error) {
      console.error("Error getAll aksesoris:", error);
      res.status(500).json({
        success: false,
        message: "Gagal mengambil data aksesoris",
        error: error.message,
      });
    }
  },

  // GET /api/aksesoris/:id
  getById: async (req, res) => {
    try {
      const item = await Aksesoris.getById(req.params.id);
      if (!item) {
        return res.status(404).json({
          success: false,
          message: "Aksesoris tidak ditemukan",
        });
      }
      res.json({
        success: true,
        message: "Detail aksesoris berhasil diambil",
        data: item,
      });
    } catch (error) {
      console.error("Error getById aksesoris:", error);
      res.status(500).json({
        success: false,
        message: "Gagal mengambil detail aksesoris",
        error: error.message,
      });
    }
  },

  // POST /api/aksesoris
  create: async (req, res) => {
    try {
      const { nama_aksesoris, kategori, jenis_aset } = req.body;

      // Validasi field wajib
      if (!nama_aksesoris || !kategori || !jenis_aset) {
        return res.status(400).json({
          success: false,
          message: "Nama Aksesoris, Kategori, dan Jenis Aset wajib diisi",
        });
      }

      // Ambil kode_singkat dari kategori
      const categoryData = await Category.findByNama(kategori, "aksesoris");
      const kodeSingkat = categoryData ? categoryData.kode_singkat : "GEN";

      // Auto-generate kode_aksesoris berdasarkan jenis_aset dan kategori
      const generatedKode = await Aksesoris.getNextKode(jenis_aset, kodeSingkat);

      const data = {
        ...req.body,
        kode_aksesoris: generatedKode,
        user_id: req.user.id,
      };

      if (req.file) {
        const newFilename = await optimizeImage(
          req.file.path,
          path.join(__dirname, "..", "public", "uploads"),
          req.file.filename
        );
        data.gambar = `/uploads/${newFilename}`;
      }

      const newItem = await Aksesoris.create(data);

      await AuditLog.create({
        userId: req.user?.userId,
        userName: req.user?.nama,
        action: 'CREATE',
        entityType: 'Aksesoris',
        entityId: newItem.insertId,
        details: `Menambahkan aksesoris: ${data.nama_aksesoris} (${data.kode_aksesoris})`
      });

      res.status(201).json({
        success: true,
        message: "Aksesoris berhasil ditambahkan",
        data: newItem,
      });
    } catch (error) {
      console.error("Error create aksesoris:", error);

      if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({
          success: false,
          message: "Kode Aksesoris sudah ada di database",
        });
      }

      res.status(500).json({
        success: false,
        message: "Gagal menambahkan aksesoris",
        error: error.message,
      });
    }
  },

  // PUT /api/aksesoris/:id
  update: async (req, res) => {
    try {
      const { id } = req.params;

      const existing = await Aksesoris.getById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: "Aksesoris tidak ditemukan",
        });
      }

      const { kode_aksesoris, nama_aksesoris } = req.body;

      if (!kode_aksesoris || !nama_aksesoris) {
        return res.status(400).json({
          success: false,
          message: "Kode Aksesoris dan Nama Aksesoris wajib diisi",
        });
      }

      const data = { ...req.body };

      // Sinkronisasi jumlah_total berdasarkan perubahan jumlah_unit
      const newJumlah = parseInt(data.jumlah_unit) || 0;
      const oldJumlah = parseInt(existing.jumlah_unit) || 0;
      const oldJumlahTotal = parseInt(existing.jumlah_total) || oldJumlah;
      data.jumlah_total = oldJumlahTotal + (newJumlah - oldJumlah);

      if (req.file) {
        const newFilename = await optimizeImage(
          req.file.path,
          path.join(__dirname, "..", "public", "uploads"),
          req.file.filename
        );
        data.gambar = `/uploads/${newFilename}`;

        if (existing.gambar) {
          const oldPath = path.join(__dirname, "..", "public", existing.gambar);
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
          }
        }
      } else {
        data.gambar = existing.gambar;
      }

      const affectedRows = await Aksesoris.update(id, data);

      if (affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Aksesoris tidak ditemukan",
        });
      }

      const updated = await Aksesoris.getById(id);

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
        entityType: 'Aksesoris',
        entityId: id,
        details: changedText 
          ? `Memperbarui ${changedText} pada ${updated.nama_aksesoris} (${updated.kode_aksesoris})`
          : `Memperbarui ${updated.nama_aksesoris} (${updated.kode_aksesoris})`
      });

      res.json({
        success: true,
        message: "Aksesoris berhasil diperbarui",
        data: updated,
      });
    } catch (error) {
      console.error("Error update aksesoris:", error);

      if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({
          success: false,
          message: "Kode Aksesoris sudah digunakan oleh aksesoris lain",
        });
      }

      res.status(500).json({
        success: false,
        message: "Gagal memperbarui aksesoris",
        error: error.message,
      });
    }
  },

  // DELETE /api/aksesoris/:id
  delete: async (req, res) => {
    const connection = await db.getConnection();
    try {
      const { id } = req.params;
      await connection.beginTransaction();

      // Cek apakah aksesoris ada
      const [aksRows] = await connection.query("SELECT * FROM aksesoris WHERE id = ?", [id]);
      const existing = aksRows[0];
      if (!existing) {
        await connection.rollback();
        return res.status(404).json({
          success: false,
          message: "Aksesoris tidak ditemukan",
        });
      }

      // Cek apakah aksesoris sedang dipinjam (peminjaman aktif)
      const [activeLoans] = await connection.query(
        `SELECT DISTINCT p.kode_pinjam, p.tanggal_peminjaman, p.alasan_peminjaman, p.status,
                (SELECT COUNT(*) FROM peminjaman_items pi2 WHERE pi2.peminjaman_id = p.id) AS total_aset
         FROM peminjaman_items pi
         JOIN peminjaman p ON pi.peminjaman_id = p.id
         WHERE pi.aksesoris_id = ? AND p.status NOT IN ('Peminjaman Selesai')
         ORDER BY p.created_at DESC`,
        [id]
      );

      if (activeLoans.length > 0) {
        await connection.rollback();
        return res.status(409).json({
          success: false,
          message: 'Aksesoris tidak dapat dihapus karena masih terdapat dalam peminjaman yang belum selesai.',
          activePeminjaman: activeLoans
        });
      }

      // Hapus data peminjaman_items terkait (yang peminjaman-nya sudah selesai)
      await connection.query(
        "DELETE FROM peminjaman_items WHERE aksesoris_id = ?",
        [id]
      );

      // Hapus aksesoris
      await connection.query("DELETE FROM aksesoris WHERE id = ?", [id]);

      await connection.commit();

      // Hapus file gambar jika ada
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
        entityType: 'Aksesoris',
        entityId: id,
        details: `Menghapus aksesoris: ${existing.nama_aksesoris} (${existing.kode_aksesoris})`
      });

      res.json({
        success: true,
        message: "Aksesoris dan seluruh riwayat terkait berhasil dihapus",
      });
    } catch (error) {
      await connection.rollback();
      console.error("Error delete aksesoris:", error);

      if (error.code === "ER_ROW_IS_REFERENCED_2" || error.code === "ER_ROW_IS_REFERENCED") {
        return res.status(409).json({
          success: false,
          message: "Aksesoris tidak dapat dihapus karena masih memiliki data terkait di sistem. Pastikan semua peminjaman terkait sudah selesai.",
        });
      }

      res.status(500).json({
        success: false,
        message: "Gagal menghapus aksesoris",
        error: error.message,
      });
    } finally {
      connection.release();
    }
  },

  // PATCH /api/aksesoris/:id/kondisi
  updateKondisi: async (req, res) => {
    try {
      const { id } = req.params;
      const { kondisi } = req.body;

      if (!kondisi) {
        return res.status(400).json({ success: false, message: "Kondisi wajib diisi" });
      }

      const existing = await Aksesoris.getById(id);
      if (!existing) {
        return res.status(404).json({ success: false, message: "Aksesoris tidak ditemukan" });
      }

      const affectedRows = await Aksesoris.updateKondisi(id, kondisi);
      if (affectedRows === 0) {
        return res.status(400).json({ success: false, message: "Kondisi gagal diperbarui" });
      }

      await AuditLog.create({
        userId: req.user?.userId,
        userName: req.user?.nama,
        action: 'UPDATE',
        entityType: 'Aksesoris',
        entityId: id,
        details: `Mengubah kondisi aksesoris ${existing.kode_aksesoris} menjadi: ${kondisi}`
      });

      res.json({ success: true, message: "Kondisi aksesoris berhasil diperbarui" });
    } catch (error) {
      console.error("Error updateKondisi aksesoris:", error);
      res.status(500).json({ success: false, message: "Gagal memperbarui kondisi", error: error.message });
    }
  },

  // GET /api/aksesoris/search?q=keyword
  search: async (req, res) => {
    try {
      const { q } = req.query;
      if (!q) {
        return res.status(400).json({
          success: false,
          message: "Parameter pencarian (q) wajib diisi",
        });
      }

      const items = await Aksesoris.search(q);
      res.json({
        success: true,
        message: `Ditemukan ${items.length} aksesoris`,
        data: items,
      });
    } catch (error) {
      console.error("Error search aksesoris:", error);
      res.status(500).json({
        success: false,
        message: "Gagal mencari aksesoris",
        error: error.message,
      });
    }
  },

  // POST /api/aksesoris/import (Import massal dari Excel)
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
        const namaAksesoris = (item.namaAksesoris || item.nama_aksesoris || "").trim();
        if (!namaAksesoris) continue; // Lewati jika nama aksesoris kosong

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
            "SELECT kode_singkat FROM categories WHERE nama = ? AND tipe = 'aksesoris'",
            [kategori]
          );
          if (catRows[0] && catRows[0].kode_singkat) {
            kodeSingkat = catRows[0].kode_singkat.toUpperCase().slice(0, 4);
          } else {
            kodeSingkat = kategori.replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase() || "GEN";
          }
        }

        const jenisKode = jenisAset === "Galeria Production" ? "GPRO" : "GS";
        const prefix = `ACC-${jenisKode}-${kodeSingkat}-`;

        // Tentukan nomor urut berikutnya per prefix
        if (nextNumMap[prefix] === undefined) {
          const [rows] = await connection.query(
            "SELECT kode_aksesoris FROM aksesoris WHERE kode_aksesoris LIKE ? ORDER BY id DESC LIMIT 1",
            [`${prefix}%`]
          );
          let currentMax = 0;
          if (rows[0] && rows[0].kode_aksesoris) {
            const match = rows[0].kode_aksesoris.match(new RegExp(`ACC-${jenisKode}-${kodeSingkat}-(\\d+)`));
            if (match) currentMax = parseInt(match[1], 10);
          }
          nextNumMap[prefix] = currentMax + 1;
        } else {
          nextNumMap[prefix] += 1;
        }

        const kodeAksesoris = `${prefix}${String(nextNumMap[prefix]).padStart(3, "0")}`;

        const rawJumlah = parseInt(item.jumlahUnit || item.jumlah_unit || item.jumlah, 10);
        const jumlahUnit = !isNaN(rawJumlah) && rawJumlah > 0 ? rawJumlah : 1;
        const rawHarga = parseFloat(item.hargaAset || item.harga_aset);
        const hargaAset = !isNaN(rawHarga) && rawHarga >= 0 ? rawHarga : 0;
        const kondisi = ["Siap Digunakan", "Rusak", "Rusak Berat", "Maintenance", "Dijual"].includes(item.kondisi)
          ? item.kondisi
          : "Siap Digunakan";
        const lokasi = (item.lokasi || "").trim() || null;
        const keterangan = (item.keterangan || "").trim() || null;
        const tanggalPembelian = (item.tanggalPembelian || item.tanggal_pembelian || "").trim() || null;

        const [insertRes] = await connection.query(
          `INSERT INTO aksesoris
            (kode_aksesoris, nama_aksesoris, kategori, merek, model, jumlah_unit, harga_aset, tanggal_pembelian, jenis_aset, kondisi, lokasi, gambar, keterangan, jumlah_total, user_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            kodeAksesoris,
            namaAksesoris,
            kategori,
            merek,
            model,
            jumlahUnit,
            hargaAset,
            tanggalPembelian,
            jenisAset,
            kondisi,
            lokasi,
            null, // gambar kosong
            keterangan,
            jumlahUnit,
            req.user?.userId || req.user?.id || null,
          ]
        );

        inserted.push({ id: insertRes.insertId, kodeAksesoris, namaAksesoris });
      }

      await connection.commit();

      if (inserted.length > 0) {
        await AuditLog.create({
          userId: req.user?.userId || req.user?.id,
          userName: req.user?.nama,
          action: "CREATE",
          entityType: "Aksesoris",
          entityId: inserted[0].id,
          details: `Import massal ${inserted.length} aksesoris dari file Excel`,
        });
      }

      res.status(201).json({
        success: true,
        message: `Berhasil mengimpor ${inserted.length} data aksesoris`,
        count: inserted.length,
        data: inserted,
      });
    } catch (error) {
      await connection.rollback();
      console.error("Error import aksesoris:", error);
      res.status(500).json({
        success: false,
        message: "Gagal mengimpor data aksesoris",
        error: error.message,
      });
    } finally {
      connection.release();
    }
  },
};

module.exports = aksesorisController;
