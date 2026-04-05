const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'galeria_production_super_secret_key';

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Akses ditolak. Token tidak ditemukan.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Menyimpan info payload token (userId, role, dll) ke request
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
