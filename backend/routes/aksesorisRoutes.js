const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const aksesorisController = require("../controllers/aksesorisController");

// Konfigurasi Multer untuk upload gambar
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "public", "uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `aksesoris-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Hanya file JPG, JPEG, dan PNG yang diperbolehkan"), false);
  }
};

const { verifyToken, requireRole } = require("../middlewares/authMiddleware");
const upload = multer({
  storage,
  fileFilter,
});

// Routes
router.get("/search", verifyToken, aksesorisController.search);         // GET  /api/aksesoris/search?q=keyword
router.get("/", verifyToken, aksesorisController.getAll);                // GET  /api/aksesoris
router.get("/:id", verifyToken, aksesorisController.getById);            // GET  /api/aksesoris/:id
router.post("/", verifyToken, requireRole("admin", "super admin"), upload.single("gambar"), aksesorisController.create);     // POST /api/aksesoris
router.put("/:id", verifyToken, requireRole("admin", "super admin"), upload.single("gambar"), aksesorisController.update);   // PUT  /api/aksesoris/:id
router.patch("/:id/kondisi", verifyToken, requireRole("admin", "super admin"), aksesorisController.updateKondisi);           // PATCH /api/aksesoris/:id/kondisi
router.delete("/:id", verifyToken, requireRole("admin", "super admin"), aksesorisController.delete);                         // DELETE /api/aksesoris/:id

module.exports = router;
