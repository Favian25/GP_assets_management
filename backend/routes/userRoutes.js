const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const userController = require('../controllers/userController');
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');

// Pastikan folder uploads/profiles ada
const profileUploadDir = path.join(__dirname, '..', 'public', 'uploads', 'profiles');
if (!fs.existsSync(profileUploadDir)) {
  fs.mkdirSync(profileUploadDir, { recursive: true });
}

// Multer config untuk foto profil
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, profileUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `profile-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Hanya file JPG, JPEG, dan PNG yang diperbolehkan'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
});

// Routes
router.get('/', verifyToken, requireRole('super admin', 'admin'), userController.getAllUsers);
router.post('/', verifyToken, requireRole('super admin', 'admin'), userController.createUser);
router.put('/profile/me', verifyToken, upload.single('fotoProfil'), userController.updateMyProfile);
router.put('/:id', verifyToken, requireRole('super admin', 'admin'), upload.single('fotoProfil'), userController.updateUser);
router.put('/:id/role', verifyToken, requireRole('super admin', 'admin'), userController.updateUserRole);
router.delete('/:id', verifyToken, requireRole('super admin', 'admin'), userController.deleteUser);

module.exports = router;
