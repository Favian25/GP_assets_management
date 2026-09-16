const express = require('express');
const router = express.Router();
const pegawaiController = require('../controllers/pegawaiController');
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');

// ===== PRIORITY ROUTES (specific patterns BEFORE :id) =====

// GET approvers (supervisor, admin, super admin - for yang_menyerahkan dropdown)
router.get('/approvers', verifyToken, pegawaiController.getApprovers);

// GET active pegawai (for nama_peminjam dropdown)
router.get('/active', verifyToken, pegawaiController.getActive);

// GET pegawai by role
router.get('/role/:role', verifyToken, pegawaiController.getByRole);

// GET all pegawai with user status
router.get('/with-user-status', verifyToken, pegawaiController.getAllWithUserStatus);

// ===== DYNAMIC ROUTE WITH :id =====

// GET semua pegawai (accessible by all authenticated users - for dropdowns)
router.get('/', verifyToken, pegawaiController.getAll);

// GET by ID
router.get('/:id', verifyToken, pegawaiController.getById);
// CRUD hanya superadmin & admin
router.post('/', verifyToken, requireRole('super admin', 'admin'), pegawaiController.create);
router.put('/:id', verifyToken, requireRole('super admin', 'admin'), pegawaiController.update);
router.delete('/:id', verifyToken, requireRole('super admin', 'admin'), pegawaiController.delete);

module.exports = router;
