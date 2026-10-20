const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const assetController = require("../controllers/assetController");

// Konfigurasi Multer untuk upload gambar
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "public", "uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `asset-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/heic", "image/heif", "image/webp"];
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".heic", ".heif", ".webp"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Hanya file JPG, JPEG, PNG, HEIC, dan WebP yang diperbolehkan"), false);
  }
};

const { verifyToken, requireRole } = require("../middlewares/authMiddleware");
const upload = multer({
  storage,
  fileFilter,
});

// Routes
router.get("/search", verifyToken, assetController.search);    // GET  /api/assets/search?q=keyword
router.get("/", verifyToken, assetController.getAll);           // GET  /api/assets
router.get("/:id", verifyToken, assetController.getById);       // GET  /api/assets/:id
router.post("/import", verifyToken, requireRole("admin", "super admin"), assetController.importExcel); // POST /api/assets/import
router.post("/", verifyToken, requireRole("admin", "super admin"), upload.single("gambar"), assetController.create);    // POST /api/assets
router.put("/:id", verifyToken, requireRole("admin", "super admin"), upload.single("gambar"), assetController.update);  // PUT  /api/assets/:id
router.patch("/:id/kondisi", verifyToken, requireRole("admin", "super admin"), assetController.updateKondisi);      // PATCH /api/assets/:id/kondisi
router.delete("/:id", verifyToken, requireRole("admin", "super admin"), assetController.delete);     // DELETE /api/assets/:id

module.exports = router;
