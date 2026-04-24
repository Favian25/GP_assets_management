const Asset = require("../models/assetModel");
const Category = require("../models/categoryModel"); // Tambahkan ini
const path = require("path");
const fs = require("fs");

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
      const { nama_aset, kategori } = req.body;

      // Validasi field wajib
      if (!nama_aset || !kategori) {
        return res.status(400).json({
          success: false,
          message: "Nama Aset dan Kategori wajib diisi",
        });
      }

      // Ambil kode_singkat dari kategori
      const categoryData = await Category.findByNama(kategori);
      const kodeSingkat = categoryData ? categoryData.kode_singkat : "UMUM";

      // Auto-generate kode_aset
      const generatedKode = await Asset.getNextKodeAset(kodeSingkat);

      // Jika ada file upload, simpan path-nya
      const data = { ...req.body, kode_aset: generatedKode };
      if (req.file) {
        data.gambar = `/uploads/${req.file.filename}`;
      }

      const newAsset = await Asset.create(data);
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

      // Jika ada file upload baru, simpan path dan hapus gambar lama
      if (req.file) {
        data.gambar = `/uploads/${req.file.filename}`;

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
    try {
      const { id } = req.params;

      // Cek apakah aset ada & ambil data gambar
      const existing = await Asset.getById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: "Aset tidak ditemukan",
        });
      }

      const affectedRows = await Asset.delete(id);

      // Hapus file gambar jika ada
      if (existing.gambar) {
        const imgPath = path.join(__dirname, "..", "public", existing.gambar);
        if (fs.existsSync(imgPath)) {
          fs.unlinkSync(imgPath);
        }
      }

      res.json({
        success: true,
        message: "Aset berhasil dihapus",
      });
    } catch (error) {
      console.error("Error delete asset:", error);
      res.status(500).json({
        success: false,
        message: "Gagal menghapus aset",
        error: error.message,
      });
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
};

module.exports = assetController;
