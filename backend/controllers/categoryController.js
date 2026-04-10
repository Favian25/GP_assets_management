const Category = require("../models/categoryModel");

const categoryController = {
  getAll: async (req, res) => {
    try {
      const categories = await Category.getAll();
      res.json({ success: true, data: categories });
    } catch (error) {
      console.error("Error getAll categories:", error);
      res.status(500).json({ success: false, message: "Gagal mengambil data kategori" });
    }
  },

  create: async (req, res) => {
    try {
      const { nama, kode_singkat } = req.body;
      if (!nama || !kode_singkat) {
        return res.status(400).json({ success: false, message: "Nama dan Kode Singkat wajib diisi" });
      }

      const existing = await Category.findByNama(nama);
      if (existing) {
        return res.status(409).json({ success: false, message: "Kategori sudah ada" });
      }

      const newCategory = await Category.create(nama, kode_singkat);
      res.status(201).json({ success: true, message: "Kategori berhasil ditambahkan", data: newCategory });
    } catch (error) {
      console.error("Error create category:", error);
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ success: false, message: "Nama atau Kode Singkat kategori sudah ada" });
      }
      res.status(500).json({ success: false, message: "Gagal menambahkan kategori" });
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;
      const affectedRows = await Category.delete(id);
      if (affectedRows === 0) {
        return res.status(404).json({ success: false, message: "Kategori tidak ditemukan" });
      }
      res.json({ success: true, message: "Kategori berhasil dihapus" });
    } catch (error) {
      console.error("Error delete category:", error);
      res.status(500).json({ success: false, message: "Gagal menghapus kategori" });
    }
  },
};

module.exports = categoryController;
