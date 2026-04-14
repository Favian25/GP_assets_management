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

  // CREATE user baru (oleh Super Admin atau Admin)
  createUser: async (req, res) => {
    try {
      const { namaLengkap, email, password, role } = req.body;
      const callerRole = req.user?.role;

      if (!namaLengkap || !email || !password) {
        return res.status(400).json({ success: false, message: 'Nama, email, dan password wajib diisi' });
      }

      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email sudah terdaftar' });
      }

      // Admin hanya bisa buat role supervisor dan user
      const validRoles = callerRole === 'super admin'
        ? ['admin', 'supervisor', 'user']
        : ['supervisor', 'user'];

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

  // UPDATE user (nama, password, role) oleh Super Admin / Admin
  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const { namaLengkap, password, role } = req.body;
      const callerRole = req.user?.role;

      const targetUser = await User.findById(id);
      if (!targetUser) {
        return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
      }

      // Tidak bisa edit super admin
      if (targetUser.role === 'super admin') {
        return res.status(403).json({ success: false, message: 'Tidak bisa mengedit akun Super Admin' });
      }

      // Admin hanya bisa edit supervisor & user
      if (callerRole === 'admin' && !['supervisor', 'user'].includes(targetUser.role)) {
        return res.status(403).json({ success: false, message: 'Admin hanya bisa mengedit role Supervisor dan User' });
      }

      const updateData = {};
      if (namaLengkap) updateData.nama_lengkap = namaLengkap;

      // Handle password update
      if (password && password.trim()) {
        if (password.length < 6) {
          return res.status(400).json({ success: false, message: 'Password minimal 6 karakter' });
        }
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(password, salt);
      }

      // Handle role update
      if (role) {
        const validRoles = callerRole === 'super admin'
          ? ['admin', 'supervisor', 'user']
          : ['supervisor', 'user'];

        if (!validRoles.includes(role)) {
          return res.status(400).json({ success: false, message: `Role tidak valid. Pilih: ${validRoles.join(', ')}` });
        }
        updateData.role = role;
      }

      // Handle foto profil (dari multer)
      if (req.file) {
        updateData.foto_profil = `/uploads/profiles/${req.file.filename}`;
      }

      await User.update(id, updateData);
      res.status(200).json({ success: true, message: 'Data user berhasil diperbarui' });
    } catch (error) {
      console.error('Error update user:', error);
      res.status(500).json({ success: false, message: 'Server Error' });
    }
  },

  // UPDATE role user
  updateUserRole: async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;
      const callerRole = req.user?.role;

      // Admin hanya bisa set supervisor & user
      const validRoles = callerRole === 'super admin'
        ? ['admin', 'supervisor', 'user']
        : ['supervisor', 'user'];

      if (!validRoles.includes(role)) {
        return res.status(400).json({ success: false, message: `Role tidak valid. Pilih: ${validRoles.join(', ')}` });
      }

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
      }

      if (user.role === 'super admin') {
        return res.status(403).json({ success: false, message: 'Tidak bisa mengubah role Super Admin' });
      }

      // Admin tidak bisa ubah role admin lain
      if (callerRole === 'admin' && !['supervisor', 'user'].includes(user.role)) {
        return res.status(403).json({ success: false, message: 'Admin hanya bisa mengubah role Supervisor dan User' });
      }

      await User.updateRole(id, role);
      res.status(200).json({ success: true, message: `Role berhasil diubah menjadi ${role}` });
    } catch (error) {
      console.error('Error update user role:', error);
      res.status(500).json({ success: false, message: 'Server Error' });
    }
  },

  // Self-update profil (nama + foto)
  updateMyProfile: async (req, res) => {
    try {
      const userId = req.user.userId;
      const { namaLengkap, removeFoto } = req.body;

      const updateData = {};
      if (namaLengkap) updateData.nama_lengkap = namaLengkap;
      if (removeFoto === 'true') {
        updateData.foto_profil = null; // explicit null for removing
      } else if (req.file) {
        updateData.foto_profil = `/uploads/profiles/${req.file.filename}`;
      }

      await User.updateProfile(userId, updateData);

      // Fetch updated user data to return
      const updatedUser = await User.findById(userId);

      res.status(200).json({
        success: true,
        message: 'Profil berhasil diperbarui',
        user: {
          id: updatedUser.id,
          namaLengkap: updatedUser.nama_lengkap,
          email: updatedUser.email,
          role: updatedUser.role,
          fotoProfil: updatedUser.foto_profil
        }
      });
    } catch (error) {
      console.error('Error update profile:', error);
      res.status(500).json({ success: false, message: 'Server Error' });
    }
  },

  // DELETE user
  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;
      const callerRole = req.user?.role;

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
      }

      if (user.role === 'super admin') {
        return res.status(403).json({ success: false, message: 'Tidak bisa menghapus akun Super Admin' });
      }

      // Admin hanya bisa hapus supervisor & user
      if (callerRole === 'admin' && !['supervisor', 'user'].includes(user.role)) {
        return res.status(403).json({ success: false, message: 'Admin hanya bisa menghapus Supervisor dan User' });
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
