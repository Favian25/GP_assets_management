const Aksesoris = require("../models/aksesorisModel");
const Category = require("../models/categoryModel");
const path = require("path");
const fs = require("fs");
const { optimizeImage } = require("../utils/imageOptimizer");
const AuditLog = require("../models/auditModel");

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
      const { nama_aksesoris, kategori } = req.body;

      // Validasi field wajib
      if (!nama_aksesoris || !kategori) {
        return res.status(400).json({
          success: false,
          message: "Nama Aksesoris dan Kategori wajib diisi",
        });
      }

      // Ambil kode_singkat dari kategori (tipe aksesoris)
      const categoryData = await Category.findByNama(kategori, "aksesoris");
      const kodeSingkat = categoryData ? categoryData.kode_singkat : "UMUM";

      // Auto-generate kode_aksesoris
      const generatedKode = await Aksesoris.getNextKode(kodeSingkat);

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

      await AuditLog.create({
        userId: req.user?.userId,
        userName: req.user?.nama,
        action: 'UPDATE',
        entityType: 'Aksesoris',
        entityId: id,
        details: `Memperbarui aksesoris: ${updated.nama_aksesoris} (${updated.kode_aksesoris})`
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
    try {
      const { id } = req.params;

      const existing = await Aksesoris.getById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: "Aksesoris tidak ditemukan",
        });
      }

      await Aksesoris.delete(id);

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
        message: "Aksesoris berhasil dihapus",
      });
    } catch (error) {
      console.error("Error delete aksesoris:", error);
      res.status(500).json({
        success: false,
        message: "Gagal menghapus aksesoris",
        error: error.message,
      });
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
};

module.exports = aksesorisController;
