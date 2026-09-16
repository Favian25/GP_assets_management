const Pegawai = require('../models/pegawaiModel');
const User = require('../models/userModel');
const db = require('../config/db');

const pegawaiController = {
  // GET semua pegawai
  getAll: async (req, res) => {
    try {
      const data = await Pegawai.getAll();
      res.status(200).json({ success: true, data });
    } catch (error) {
      console.error('Error get pegawai:', error);
      res.status(500).json({ success: false, message: 'Server Error' });
    }
  },

  // GET by ID
  getById: async (req, res) => {
    try {
      const data = await Pegawai.getById(req.params.id);
      if (!data) return res.status(404).json({ success: false, message: 'Pegawai tidak ditemukan' });
      res.status(200).json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server Error' });
    }
  },

  // CREATE pegawai baru
  create: async (req, res) => {
    try {
      const { nama_lengkap, tempat_lahir, tanggal_lahir, alamat, email, nomor_hp } = req.body;
      if (!nama_lengkap) {
        return res.status(400).json({ success: false, message: 'Nama lengkap wajib diisi' });
      }
      const result = await Pegawai.create({ nama_lengkap, tempat_lahir, tanggal_lahir, alamat, email, nomor_hp });
      res.status(201).json({ success: true, message: 'Pegawai berhasil ditambahkan', id: result.insertId });
    } catch (error) {
      console.error('Error create pegawai:', error);
      res.status(500).json({ success: false, message: 'Server Error' });
    }
  },

  // UPDATE pegawai
  update: async (req, res) => {
    try {
      const affected = await Pegawai.update(req.params.id, req.body);
      if (!affected) return res.status(404).json({ success: false, message: 'Pegawai tidak ditemukan' });
      res.status(200).json({ success: true, message: 'Data pegawai berhasil diperbarui' });
    } catch (error) {
      console.error('Error update pegawai:', error);
      res.status(500).json({ success: false, message: error.message || 'Server Error' });
    }
  },

  // DELETE pegawai
  delete: async (req, res) => {
    try {
      const pegawaiId = req.params.id;

      // Check if pegawai is linked to any user account
      const [linkedUsers] = await db.query(
        'SELECT id, nama_lengkap, email, role FROM users WHERE pegawai_id = ?',
        [pegawaiId]
      );

      if (linkedUsers.length > 0) {
        const userInfo = linkedUsers[0];
        return res.status(409).json({
          success: false,
          message: `Pegawai masih terhubung ke user ${userInfo.role}`,
          details: `Pegawai ini sedang digunakan oleh user: ${userInfo.nama_lengkap} (${userInfo.email}) dengan role ${userInfo.role}. Hapus user terlebih dahulu sebelum menghapus pegawai ini.`,
          linkedUser: userInfo
        });
      }

      const affected = await Pegawai.delete(pegawaiId);
      if (!affected) return res.status(404).json({ success: false, message: 'Pegawai tidak ditemukan' });
      res.status(200).json({ success: true, message: 'Pegawai berhasil dihapus' });
    } catch (error) {
      console.error('Error delete pegawai:', error);
      res.status(500).json({ success: false, message: 'Server Error' });
    }
  },

  // GET pegawai by role
  getByRole: async (req, res) => {
    try {
      const { role } = req.params;
      const data = await Pegawai.getByRole(role);
      res.status(200).json({ success: true, data });
    } catch (error) {
      console.error('Error get pegawai by role:', error);
      res.status(500).json({ success: false, message: 'Server Error' });
    }
  },

  // GET approvers (supervisor, admin, super admin)
  getApprovers: async (req, res) => {
    try {
      const data = await Pegawai.getApprovers();
      res.status(200).json({ success: true, data });
    } catch (error) {
      console.error('Error get approvers:', error);
      res.status(500).json({ success: false, message: 'Server Error' });
    }
  },

  // GET active pegawai
  getActive: async (req, res) => {
    try {
      const data = await Pegawai.getActive();
      res.status(200).json({ success: true, data });
    } catch (error) {
      console.error('Error get active pegawai:', error);
      res.status(500).json({ success: false, message: 'Server Error' });
    }
  },

  // GET all pegawai with user status
  getAllWithUserStatus: async (req, res) => {
    try {
      const data = await Pegawai.getAllWithUserStatus();
      res.status(200).json({ success: true, data });
    } catch (error) {
      console.error('Error get pegawai with user status:', error);
      res.status(500).json({ success: false, message: 'Server Error' });
    }
  }
};

module.exports = pegawaiController;
