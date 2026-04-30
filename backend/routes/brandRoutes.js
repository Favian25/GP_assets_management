const express = require("express");
const router = express.Router();
const brandController = require("../controllers/brandController");
const { verifyToken, requireRole } = require("../middlewares/authMiddleware");

// Hanya admin dan super admin yang bisa manage merek
router.use(verifyToken, requireRole("admin", "super admin"));

router.get("/", brandController.getAll);
router.post("/", brandController.create);
router.put("/:id", brandController.update);
router.delete("/:id", brandController.delete);

module.exports = router;
