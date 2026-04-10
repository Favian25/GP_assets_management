const Brand = require("../models/brandModel");

const brandController = {
  getAll: async (req, res) => {
    try {
      const brands = await Brand.getAll();
      res.json({ success: true, data: brands });
    } catch (error) {
      console.error("Error getAll brands:", error);
      res.status(500).json({ success: false, message: "Gagal mengambil data merek" });
    }
  },

  create: async (req, res) => {
    try {
      const { nama } = req.body;
      if (!nama) {
        return res.status(400).json({ success: false, message: "Nama merek wajib diisi" });
      }

      const existing = await Brand.findByNama(nama);
      if (existing) {
        return res.status(409).json({ success: false, message: "Merek sudah ada" });
      }

      const newBrand = await Brand.create(nama);
      res.status(201).json({ success: true, message: "Merek berhasil ditambahkan", data: newBrand });
    } catch (error) {
      console.error("Error create brand:", error);
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ success: false, message: "Nama merek sudah ada" });
      }
      res.status(500).json({ success: false, message: "Gagal menambahkan merek" });
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
