const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Gunakan secret dari env, fallback ke string fallback buat development jika lupa diset
const JWT_SECRET = process.env.JWT_SECRET || 'galeria_production_super_secret_key';

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
      const salt = await bcrypt.genSalt(10);
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

      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

      // Hilangkan field password yang akan di-return ke klien
      const userToReturn = {
        id: user.id,
        namaLengkap: user.nama_lengkap,
        email: user.email,
        role: user.role
      };

      res.status(200).json({
        success: true,
        message: 'Login berhasil',
        token,
        user: userToReturn
      });
    } catch (error) {
      console.error('Error saat login:', error);
      res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
    }
  }
};

module.exports = authController;
