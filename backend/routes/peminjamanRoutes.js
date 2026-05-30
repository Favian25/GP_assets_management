const express = require("express");
const router = express.Router();
const peminjamanController = require("../controllers/peminjamanController");

const multer = require("multer");
const path = require("path");

// Konfigurasi Multer untuk upload gambar bukti
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "public", "uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `bukti-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Format file tidak didukung. Hanya JPG, JPEG, dan PNG."));
  }
};

const upload = multer({
  storage,
  fileFilter,
});

const { verifyToken, requireRole } = require("../middlewares/authMiddleware");

// GET kode pinjam berikutnya (harus di atas /:id)
router.get("/next-kode", peminjamanController.getNextKode);

// GET semua peminjaman
router.get("/", peminjamanController.getAllPeminjaman);

// SEARCH peminjaman
router.get("/search", peminjamanController.searchPeminjaman);

// GET peminjaman by ID
router.get("/:id", peminjamanController.getPeminjamanById);

// CREATE peminjaman baru (tambah verifyToken & upload array)
router.post("/", verifyToken, upload.array("bukti", 5), peminjamanController.createPeminjaman);

// UPDATE pengembalian peminjaman (tambah verifyToken & upload array)
router.put("/:id", verifyToken, upload.array("bukti", 5), peminjamanController.updatePeminjaman);

// APPROVE peminjaman (verifyToken & check role)
router.put("/:id/approve", verifyToken, requireRole("super admin", "admin", "supervisor"), peminjamanController.approvePeminjaman);

// DELETE peminjaman
router.delete("/:id", verifyToken, peminjamanController.deletePeminjaman);

// DOWNLOAD PDF
router.get("/:id/pdf", peminjamanController.generatePDF);

module.exports = router;
