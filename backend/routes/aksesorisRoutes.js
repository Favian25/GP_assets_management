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

const { verifyToken } = require("../middlewares/authMiddleware");
const upload = multer({
  storage,
  fileFilter,
});

// Routes
router.get("/search", aksesorisController.search);         // GET  /api/aksesoris/search?q=keyword
router.get("/", aksesorisController.getAll);                // GET  /api/aksesoris
router.get("/:id", aksesorisController.getById);            // GET  /api/aksesoris/:id
router.post("/", verifyToken, upload.single("gambar"), aksesorisController.create);     // POST /api/aksesoris
router.put("/:id", verifyToken, upload.single("gambar"), aksesorisController.update);   // PUT  /api/aksesoris/:id
router.patch("/:id/kondisi", verifyToken, aksesorisController.updateKondisi);           // PATCH /api/aksesoris/:id/kondisi
router.delete("/:id", verifyToken, aksesorisController.delete);                         // DELETE /api/aksesoris/:id

module.exports = router;
