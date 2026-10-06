const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required. Set it in your .env file.');
}

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Akses ditolak. Token tidak ditemukan.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Menyimpan info payload token (userId, role, dll) ke request

    // Cek apakah akun masih aktif di database (real-time check)
    const [rows] = await db.query('SELECT is_active FROM users WHERE id = ?', [decoded.userId]);
    if (!rows.length || rows[0].is_active === 0 || rows[0].is_active === false) {
      return res.status(403).json({
        success: false,
        code: 'ACCOUNT_DEACTIVATED',
        message: 'Akun Anda telah dinonaktifkan. Anda akan otomatis logout.'
      });
    }

    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Token tidak valid atau sudah kedaluwarsa' });
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Akses ditolak. Role Anda tidak memiliki izin untuk ini.' });
    }
    next();
  };
};

module.exports = { verifyToken, requireRole };
