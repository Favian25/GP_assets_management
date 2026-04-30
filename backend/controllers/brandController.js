const Brand = require("../models/brandModel");

const brandController = {
  getAll: async (req, res) => {
    try {
      const { tipe } = req.query;
      const brands = tipe ? await Brand.getByTipe(tipe) : await Brand.getAll();
      res.json({ success: true, data: brands });
    } catch (error) {
      console.error("Error getAll brands:", error);
      res.status(500).json({ success: false, message: "Gagal mengambil data merek" });
    }
  },

  create: async (req, res) => {
    try {
      const { nama, tipe } = req.body;
      if (!nama) {
        return res.status(400).json({ success: false, message: "Nama merek wajib diisi" });
      }

      const brandTipe = tipe || "aset";
      const existing = await Brand.findByNama(nama, brandTipe);
      if (existing) {
        return res.status(409).json({ success: false, message: "Merek sudah ada" });
      }

      const newBrand = await Brand.create(nama, brandTipe);
      res.status(201).json({ success: true, message: "Merek berhasil ditambahkan", data: newBrand });
    } catch (error) {
      console.error("Error create brand:", error);
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ success: false, message: "Nama merek sudah ada" });
      }
      res.status(500).json({ success: false, message: "Gagal menambahkan merek" });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { nama } = req.body;
      if (!nama) {
        return res.status(400).json({ success: false, message: "Nama merek wajib diisi" });
      }

      const existingBrand = await Brand.findById(id);
      if (!existingBrand) {
        return res.status(404).json({ success: false, message: "Merek tidak ditemukan" });
      }

      // Check duplicate name
      const duplicate = await Brand.findByNama(nama, existingBrand.tipe);
      if (duplicate && duplicate.id !== parseInt(id)) {
        return res.status(409).json({ success: false, message: "Nama merek sudah digunakan" });
      }

      await Brand.update(id, existingBrand.nama, nama, existingBrand.tipe);
      res.json({ success: true, message: "Merek berhasil diperbarui" });
    } catch (error) {
      console.error("Error update brand:", error);
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ success: false, message: "Nama merek sudah ada" });
      }
      res.status(500).json({ success: false, message: "Gagal memperbarui merek" });
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;
      const affectedRows = await Brand.delete(id);
      if (affectedRows === 0) {
        return res.status(404).json({ success: false, message: "Merek tidak ditemukan" });
      }
      res.json({ success: true, message: "Merek berhasil dihapus" });
    } catch (error) {
      console.error("Error delete brand:", error);
      res.status(500).json({ success: false, message: "Gagal menghapus merek" });
    }
  },
};

module.exports = brandController;
