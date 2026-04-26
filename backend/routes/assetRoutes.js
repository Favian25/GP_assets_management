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
router.get("/search", assetController.search);    // GET  /api/assets/search?q=keyword
router.get("/", assetController.getAll);           // GET  /api/assets
router.get("/:id", assetController.getById);       // GET  /api/assets/:id
router.post("/", verifyToken, upload.single("gambar"), assetController.create);    // POST /api/assets
router.put("/:id", verifyToken, upload.single("gambar"), assetController.update);  // PUT  /api/assets/:id
router.patch("/:id/kondisi", verifyToken, assetController.updateKondisi);      // PATCH /api/assets/:id/kondisi
router.delete("/:id", verifyToken, assetController.delete);     // DELETE /api/assets/:id

module.exports = router;
