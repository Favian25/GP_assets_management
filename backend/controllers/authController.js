const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// JWT Secret harus diset di .env
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required. Set it in your .env file.');
}

const authController = {
  register: async (req, res) => {
    try {
      const { namaLengkap, email, password } = req.body;

      // Validasi input
      if (!namaLengkap || !email || !password) {
        return res.status(400).json({ success: false, message: 'Semua field wajib diisi' });
      }

      // Cek email apakah sudah ada
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email sudah terdaftar' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Secara default semua pembuatan lewat frontend ini akan diberikan role 'user'
      await User.create({
        namaLengkap,
        email,
        password: hashedPassword,
        role: 'user'
      });

      res.status(201).json({ success: true, message: 'Registrasi berhasil. Silakan login.' });
    } catch (error) {
      console.error('Error saat register:', error);
      res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email dan password wajib diisi' });
      }

      // Cari user
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(404).json({ success: false, message: 'Akun tidak ditemukan' });
      }

      // Bandingkan password hash
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Password salah' });
      }

      // Generate payload & token
      const payload = {
        userId: user.id,
        role: user.role,
        nama: user.nama_lengkap
      };

      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

      // Hilangkan field password yang akan di-return ke klien
      const userToReturn = {
        id: user.id,
        namaLengkap: user.nama_lengkap,
        email: user.email,
        role: user.role,
        fotoProfil: user.foto_profil || null
      };

      res.status(200).json({
        success: true,
        message: 'Login berhasil',
        token,
        user: userToReturn,
        loginAt: Date.now()
      });
    } catch (error) {
      console.error('Error saat login:', error);
      res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
    }
  },

  resetPassword: async (req, res) => {
    try {
      const { email, newPassword } = req.body;

      if (!email || !newPassword) {
        return res.status(400).json({ success: false, message: 'Email dan password baru wajib diisi' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'Password minimal 6 karakter' });
      }

      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(404).json({ success: false, message: 'Email tidak terdaftar' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      const db = require('../config/db');
      await db.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email]);

      res.status(200).json({ success: true, message: 'Password berhasil direset' });
    } catch (error) {
      console.error('Error saat reset password:', error);
      res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
    }
  },

  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ success: false, message: 'Password lama dan baru wajib diisi' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'Password baru minimal 6 karakter' });
      }

      // req.user comes from auth middleware (JWT decoded payload)
      const user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
      }

      // Get full user data with password field
      const db = require('../config/db');
      const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [req.user.userId]);
      const fullUser = rows[0];

      const isMatch = await bcrypt.compare(currentPassword, fullUser.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Password saat ini salah' });
      }

      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.userId]);

      res.status(200).json({ success: true, message: 'Password berhasil diubah' });
    } catch (error) {
      console.error('Error saat change password:', error);
      res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
    }
  }
};
module.exports = authController;
