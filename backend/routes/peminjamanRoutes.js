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

// ===== PRIORITY ROUTES (specific patterns BEFORE dynamic :id) =====

// GET kode pinjam berikutnya
router.get("/next-kode", peminjamanController.getNextKode);

// SEARCH peminjaman
router.get("/search", peminjamanController.searchPeminjaman);

// GET my history (user's own borrowing history)
router.get("/my-history", verifyToken, peminjamanController.getMyHistory);

// GET by status
router.get("/status/:status", peminjamanController.getPeminjamanByStatus);

// GET by nama peminjam (for borrowing history page)
router.get("/nama/:nama_peminjam", peminjamanController.getPeminjamanByNamaPeminjam);

// ===== DYNAMIC ROUTES WITH :id =====

// GET items with pricing
router.get("/:id/items-pricing", peminjamanController.getItemsWithPricing);

// SWAP item saat Sedang Dipinjam
router.put("/:id/swap-item", verifyToken, requireRole("admin", "supervisor"), peminjamanController.swapItem);

// ADD item saat Sedang Dipinjam
router.put("/:id/add-item", verifyToken, requireRole("admin", "supervisor"), peminjamanController.addItemWhileBorrowed);

// APPROVE peminjaman (must be before PUT /:id)
router.put("/:id/approve", verifyToken, requireRole("admin", "supervisor"), peminjamanController.approvePeminjaman);

// DOWNLOAD PDF (must be before GET /:id)
router.get("/:id/pdf", peminjamanController.generatePDF);

// GET peminjaman by ID
router.get("/:id", peminjamanController.getPeminjamanById);

// ===== STATIC ROUTES (no :id) =====

// GET semua peminjaman
router.get("/", peminjamanController.getAllPeminjaman);

// CREATE peminjaman baru
router.post("/", verifyToken, upload.array("bukti", 5), peminjamanController.createPeminjaman);

// UPDATE pengembalian peminjaman
router.put("/:id", verifyToken, upload.array("bukti", 5), peminjamanController.updatePeminjaman);

// DELETE peminjaman
router.delete("/:id", verifyToken, peminjamanController.deletePeminjaman);

module.exports = router;
