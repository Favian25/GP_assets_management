const bcrypt = require('bcryptjs');
const User = require('../models/userModel');

const userController = {
  // GET semua user
  getAllUsers: async (req, res) => {
    try {
      const data = await User.getAll();
      res.status(200).json({ success: true, data });
    } catch (error) {
      console.error('Error get all users:', error);
      res.status(500).json({ success: false, message: 'Server Error' });
    }
  },

  // CREATE user baru (oleh Super Admin)
  createUser: async (req, res) => {
    try {
      const { namaLengkap, email, password, role } = req.body;

      if (!namaLengkap || !email || !password) {
        return res.status(400).json({ success: false, message: 'Nama, email, dan password wajib diisi' });
      }

      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email sudah terdaftar' });
      }

      const validRoles = ['admin', 'supervisor', 'user'];
      const selectedRole = validRoles.includes(role) ? role : 'user';

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      await User.create({
        namaLengkap,
        email,
        password: hashedPassword,
        role: selectedRole
      });

      res.status(201).json({ success: true, message: 'User berhasil ditambahkan' });
    } catch (error) {
      console.error('Error create user:', error);
      res.status(500).json({ success: false, message: 'Server Error' });
    }
  },

  // UPDATE role user
  updateUserRole: async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;

      const validRoles = ['admin', 'supervisor', 'user'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ success: false, message: 'Role tidak valid. Pilih: admin, supervisor, atau user' });
      }

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
      }

      if (user.role === 'super admin') {
        return res.status(403).json({ success: false, message: 'Tidak bisa mengubah role Super Admin' });
      }

      await User.updateRole(id, role);
      res.status(200).json({ success: true, message: `Role berhasil diubah menjadi ${role}` });
    } catch (error) {
      console.error('Error update user role:', error);
      res.status(500).json({ success: false, message: 'Server Error' });
    }
  },

  // DELETE user
  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
      }

      if (user.role === 'super admin') {
        return res.status(403).json({ success: false, message: 'Tidak bisa menghapus akun Super Admin' });
      }

      await User.delete(id);
      res.status(200).json({ success: true, message: 'User berhasil dihapus' });
    } catch (error) {
      console.error('Error delete user:', error);
      res.status(500).json({ success: false, message: 'Server Error' });
    }
  },
};

module.exports = userController;
