const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const { verifyToken, requireRole } = require("../middlewares/authMiddleware");

// Hanya admin dan super admin yang bisa manage kategori
router.use(verifyToken, requireRole("admin", "super admin"));

router.get("/", categoryController.getAll);
router.post("/", categoryController.create);
router.put("/:id", categoryController.update);
router.delete("/:id", categoryController.delete);

module.exports = router;
