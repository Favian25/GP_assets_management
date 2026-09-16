const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const User = require('../models/userModel');
const { optimizeImage } = require('../utils/imageOptimizer');

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
      const { namaLengkap, email, password, role, pegawaiId, nomorHp, keterangan } = req.body;
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
        role: selectedRole,
        pegawaiId: pegawaiId || null,
        nomorHp: nomorHp || null,
        keterangan: keterangan || null,
      });

      res.status(201).json({ success: true, message: 'User berhasil ditambahkan' });
    } catch (error) {
      console.error('Error create user:', error);
      res.status(500).json({ success: false, message: 'Server Error' });
    }
  },

  // UPDATE user (nama, email, password, role, nomor_hp, keterangan) oleh Super Admin / Admin
  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const { namaLengkap, email, password, role, nomorHp, keterangan } = req.body;
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
      if (callerRole === 'admin' && !['supervisor', 'user', 'guest'].includes(targetUser.role)) {
        return res.status(403).json({ success: false, message: 'Admin hanya bisa mengedit role Supervisor dan User' });
      }

      const updateData = {};
      if (namaLengkap) updateData.nama_lengkap = namaLengkap;

      // Handle email update - check if already exists (but exclude current user)
      if (email && email !== targetUser.email) {
        const existingEmail = await User.findByEmail(email);
        if (existingEmail && existingEmail.id !== parseInt(id)) {
          return res.status(400).json({ success: false, message: 'Email sudah digunakan oleh user lain' });
        }
        updateData.email = email;
      }

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
          ? ['admin', 'supervisor', 'user', 'guest']
          : ['supervisor', 'user', 'guest'];

        if (!validRoles.includes(role)) {
          return res.status(400).json({ success: false, message: `Role tidak valid. Pilih: ${validRoles.join(', ')}` });
        }
        updateData.role = role;
      }

      // Handle nomor_hp dan keterangan (untuk guest users)
      if (nomorHp !== undefined) updateData.nomor_hp = nomorHp || null;
      if (keterangan !== undefined) updateData.keterangan = keterangan || null;

      // Handle foto profil (dari multer)
      let shouldDeleteOldPhoto = false;
      if (req.file) {
        const optimizedFilename = await optimizeImage(
          req.file.path,
          req.file.destination,
          req.file.filename
        );
        updateData.foto_profil = `/uploads/profiles/${optimizedFilename}`;
        shouldDeleteOldPhoto = true;
      }

      await User.update(id, updateData);

      // Clean up old file
      if (shouldDeleteOldPhoto && targetUser.foto_profil) {
        const oldPath = path.join(__dirname, '../public', targetUser.foto_profil);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
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

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
      }

      // Guest user (pegawai_id = null) tidak bisa ubah role
      if (user.pegawai_id === null) {
        return res.status(403).json({ success: false, message: 'Guest user tidak bisa mengubah role' });
      }

      if (user.role === 'super admin') {
        return res.status(403).json({ success: false, message: 'Tidak bisa mengubah role Super Admin' });
      }

      // Admin hanya bisa ubah supervisor & user (bukan admin)
      const validRoles = callerRole === 'super admin'
        ? ['admin', 'supervisor', 'user']
        : ['supervisor', 'user'];

      if (!validRoles.includes(role)) {
        return res.status(400).json({ success: false, message: `Role tidak valid. Pilih: ${validRoles.join(', ')}` });
      }

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
      
      let shouldDeleteOldPhoto = false;
      if (removeFoto === 'true') {
        updateData.foto_profil = null; // explicit null for removing
        shouldDeleteOldPhoto = true;
      } else if (req.file) {
        const optimizedFilename = await optimizeImage(
          req.file.path,
          req.file.destination,
          req.file.filename
        );
        updateData.foto_profil = `/uploads/profiles/${optimizedFilename}`;
        shouldDeleteOldPhoto = true;
      }

      const oldUser = await User.findById(userId);

      await User.updateProfile(userId, updateData);

      // Clean up old file
      if (shouldDeleteOldPhoto && oldUser && oldUser.foto_profil) {
        const oldPath = path.join(__dirname, '../public', oldUser.foto_profil);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

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
      if (callerRole === 'admin' && !['supervisor', 'user', 'guest'].includes(user.role)) {
        return res.status(403).json({ success: false, message: 'Admin hanya bisa menghapus Supervisor dan User' });
      }

      await User.delete(id);

      // Clean up old file
      if (user.foto_profil) {
        const oldPath = path.join(__dirname, '../public', user.foto_profil);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      res.status(200).json({ success: true, message: 'User berhasil dihapus' });
    } catch (error) {
      console.error('Error delete user:', error);
      res.status(500).json({ success: false, message: 'Server Error' });
    }
  },

  // TOGGLE active/inactive user
  toggleUserActive: async (req, res) => {
    try {
      const { id } = req.params;
      const callerRole = req.user?.role;

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
      }

      if (user.role === 'super admin') {
        return res.status(403).json({ success: false, message: 'Tidak bisa menonaktifkan akun Super Admin' });
      }

      if (callerRole === 'admin' && !['supervisor', 'user', 'guest'].includes(user.role)) {
        return res.status(403).json({ success: false, message: 'Admin hanya bisa menonaktifkan Supervisor, User, dan Guest' });
      }

      await User.toggleActive(id);
      const updatedUser = await User.findById(id);
      const newStatus = updatedUser.is_active ? 'diaktifkan' : 'dinonaktifkan';
      res.status(200).json({ success: true, message: `Akun berhasil ${newStatus}`, is_active: updatedUser.is_active });
    } catch (error) {
      console.error('Error toggle user active:', error);
      res.status(500).json({ success: false, message: 'Server Error' });
    }
  },

  // GET users by role
  getUsersByRole: async (req, res) => {
    try {
      const { role } = req.params;
      const data = await User.getByRole(role);
      res.status(200).json({ success: true, data });
    } catch (error) {
      console.error('Error get users by role:', error);
      res.status(500).json({ success: false, message: 'Server Error' });
    }
  },

  // GET active users
  getActiveUsers: async (req, res) => {
    try {
      const data = await User.getActiveUsers();
      res.status(200).json({ success: true, data });
    } catch (error) {
      console.error('Error get active users:', error);
      res.status(500).json({ success: false, message: 'Server Error' });
    }
  },

  // GET users with pagination
  getAllWithPagination: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const role = req.query.role || null;

      const result = await User.getAllWithPagination(page, limit, role);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      console.error('Error get users with pagination:', error);
      res.status(500).json({ success: false, message: 'Server Error' });
    }
  },

  // GET my profile
  getMyProfile: async (req, res) => {
    try {
      const userId = req.user?.userId;
      const data = await User.getMyProfile(userId);
      if (!data) {
        return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
      }
      res.status(200).json({ success: true, data });
    } catch (error) {
      console.error('Error get my profile:', error);
      res.status(500).json({ success: false, message: 'Server Error' });
    }
  }
};

module.exports = userController;
