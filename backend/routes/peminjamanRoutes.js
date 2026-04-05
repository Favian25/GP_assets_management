const express = require("express");
const router = express.Router();
const peminjamanController = require("../controllers/peminjamanController");

// GET kode pinjam berikutnya (harus di atas /:id)
router.get("/next-kode", peminjamanController.getNextKode);

// GET semua peminjaman
router.get("/", peminjamanController.getAllPeminjaman);

// SEARCH peminjaman
router.get("/search", peminjamanController.searchPeminjaman);

// GET peminjaman by ID
router.get("/:id", peminjamanController.getPeminjamanById);

// CREATE peminjaman baru
router.post("/", peminjamanController.createPeminjaman);

// UPDATE pengembalian peminjaman
router.put("/:id", peminjamanController.updatePeminjaman);

// APPROVE peminjaman
router.put("/:id/approve", peminjamanController.approvePeminjaman);

// DELETE peminjaman
router.delete("/:id", peminjamanController.deletePeminjaman);

module.exports = router;
