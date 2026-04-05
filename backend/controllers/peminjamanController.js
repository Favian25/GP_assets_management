const Peminjaman = require("../models/peminjamanModel");

const peminjamanController = {
  // GET semua data
  getAllPeminjaman: async (req, res) => {
    try {
      const data = await Peminjaman.getAll();
      res.status(200).json({ success: true, data });
    } catch (error) {
      console.error("Error get all peminjaman:", error);
      res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
  },

  // GET data by ID
  getPeminjamanById: async (req, res) => {
    try {
      const data = await Peminjaman.getById(req.params.id);
      if (!data) {
        return res.status(404).json({ success: false, message: "Data peminjaman tidak ditemukan" });
      }
      res.status(200).json({ success: true, data });
    } catch (error) {
      console.error("Error get peminjaman by id:", error);
      res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
  },

  // GET kode pinjam berikutnya
  getNextKode: async (req, res) => {
    try {
      const kode = await Peminjaman.getNextKodePinjam();
      res.status(200).json({ success: true, kode });
    } catch (error) {
      console.error("Error get next kode:", error);
      res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
  },

  // CREATE peminjaman baru
  createPeminjaman: async (req, res) => {
    try {
      const { nama_peminjam, alasan_peminjaman, tanggal_peminjaman, yang_menyerahkan, items } = req.body;

      if (!nama_peminjam || !tanggal_peminjaman) {
        return res.status(400).json({ success: false, message: "Nama peminjam dan tanggal peminjaman wajib diisi" });
      }

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, message: "Minimal harus ada 1 barang yang dipinjam" });
      }

      // Validasi setiap item punya asset_id dan jumlah
      for (const item of items) {
        if (!item.asset_id || !item.jumlah || item.jumlah < 1) {
          return res.status(400).json({ success: false, message: "Setiap barang harus memiliki aset dan jumlah yang valid" });
        }
      }

      // Auto-generate kode pinjam
      const kode_pinjam = await Peminjaman.getNextKodePinjam();

      const result = await Peminjaman.create(
        { kode_pinjam, nama_peminjam, alasan_peminjaman, tanggal_peminjaman, yang_menyerahkan },
        items
      );

      res.status(201).json({ success: true, message: "Peminjaman berhasil ditambahkan", data: result });
    } catch (error) {
      console.error("Error create peminjaman:", error);
      // Error stok tidak cukup akan punya pesan yang informatif dari model
      res.status(400).json({ success: false, message: error.message || "Gagal menambahkan peminjaman" });
    }
  },

  // UPDATE pengembalian peminjaman
  updatePeminjaman: async (req, res) => {
    try {
      const id = req.params.id;

      const checkData = await Peminjaman.getById(id);
      if (!checkData) {
        return res.status(404).json({ success: false, message: "Data peminjaman tidak ditemukan" });
      }

      const { tanggal_pengembalian, status, penerima_aset } = req.body;

      await Peminjaman.updateReturn(id, { tanggal_pengembalian, status, penerima_aset });
      res.status(200).json({ success: true, message: "Data peminjaman berhasil diperbarui" });
    } catch (error) {
      console.error("Error update peminjaman:", error);
      res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
  },

  // APPROVE peminjaman
  approvePeminjaman: async (req, res) => {
    try {
      const id = req.params.id;
      const { approved_by } = req.body;

      const checkData = await Peminjaman.getById(id);
      if (!checkData) {
        return res.status(404).json({ success: false, message: "Data peminjaman tidak ditemukan" });
      }

      if (checkData.status !== "Dikembalikan") {
        return res.status(400).json({ success: false, message: "Hanya peminjaman dengan status 'Dikembalikan' yang bisa di-approve" });
      }

      await Peminjaman.approve(id, approved_by || "System");
      res.status(200).json({ success: true, message: "Peminjaman berhasil di-approve" });
    } catch (error) {
      console.error("Error approve peminjaman:", error);
      res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
  },

  // DELETE peminjaman
  deletePeminjaman: async (req, res) => {
    try {
      const id = req.params.id;
      const checkData = await Peminjaman.getById(id);

      if (!checkData) {
        return res.status(404).json({ success: false, message: "Data peminjaman tidak ditemukan" });
      }

      await Peminjaman.delete(id);
      res.status(200).json({ success: true, message: "Data peminjaman berhasil dihapus" });
    } catch (error) {
      console.error("Error delete peminjaman:", error);
      res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
  },

  // SEARCH peminjaman
  searchPeminjaman: async (req, res) => {
    try {
      const keyword = req.query.q;
      if (!keyword) {
        return res.status(400).json({ success: false, message: "Keyword pencarian tidak boleh kosong" });
      }

      const data = await Peminjaman.search(keyword);
      res.status(200).json({ success: true, data });
    } catch (error) {
      console.error("Error search peminjaman:", error);
      res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
  },
};

module.exports = peminjamanController;
