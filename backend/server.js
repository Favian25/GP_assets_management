const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const assetRoutes = require("./routes/assetRoutes");
const peminjamanRoutes = require("./routes/peminjamanRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const brandRoutes = require("./routes/brandRoutes");
const aksesorisRoutes = require("./routes/aksesorisRoutes");
const pegawaiRoutes = require("./routes/pegawaiRoutes");

const os = require("os");

// Fungsi untuk mendapatkan IP lokal secara dinamis
const getLocalIp = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "localhost";
};

const localIp = getLocalIp();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: "*", // Allow all origins for development
    credentials: false,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (untuk akses gambar yang di-upload)
app.use(express.static(path.join(__dirname, "public")));

const auditRoutes = require("./routes/auditRoutes");

// ... (other route imports)

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/peminjaman", peminjamanRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/aksesoris", aksesorisRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/pegawai", pegawaiRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "GP Asset Management API",
    version: "1.0.0",
    endpoints: {
      assets: "/api/assets",
    },
  });
});

// Error handling middleware (untuk multer errors dan lainnya)
app.use((err, req, res, next) => {
  if (err.message) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
  next(err);
});

// Inisialisasi tabel aksesoris_units jika belum ada
const db = require("./config/db");
async function initAksesorisUnitsTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS \`aksesoris_units\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT,
        \`aksesoris_id\` int(11) NOT NULL,
        \`kode_unit\` varchar(60) NOT NULL,
        \`nama_unit\` varchar(255) DEFAULT NULL,
        \`no_sn\` varchar(100) DEFAULT NULL,
        \`kondisi\` enum('Siap Digunakan','Rusak','Rusak Berat','Maintenance','Dijual') DEFAULT 'Siap Digunakan',
        \`status_pinjam\` enum('Tersedia','Dipinjam') DEFAULT 'Tersedia',
        \`lokasi_unit\` varchar(255) DEFAULT NULL,
        \`keterangan\` text DEFAULT NULL,
        \`created_at\` timestamp NULL DEFAULT current_timestamp(),
        \`updated_at\` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`kode_unit\` (\`kode_unit\`),
        KEY \`aksesoris_id\` (\`aksesoris_id\`),
        KEY \`idx_kondisi\` (\`kondisi\`),
        KEY \`idx_status_pinjam\` (\`status_pinjam\`),
        CONSTRAINT \`fk_aksesoris_units_aksesoris\` FOREIGN KEY (\`aksesoris_id\`) REFERENCES \`aksesoris\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    const [aksRows] = await db.query(`
      SELECT a.* FROM aksesoris a
      LEFT JOIN aksesoris_units au ON a.id = au.aksesoris_id
      WHERE au.id IS NULL
    `);

    if (aksRows.length > 0) {
      for (const aks of aksRows) {
        const qty = parseInt(aks.jumlah_total || aks.jumlah_unit, 10) || 1;
        for (let i = 1; i <= qty; i++) {
          const numStr = String(i).padStart(2, "0");
          const kodeUnit = `${aks.kode_aksesoris}-${numStr}`;
          const namaUnit = qty > 1 ? `${aks.nama_aksesoris} (Unit ${i})` : aks.nama_aksesoris;
          await db.query(`
            INSERT INTO aksesoris_units (aksesoris_id, kode_unit, nama_unit, kondisi, status_pinjam, lokasi_unit, keterangan)
            VALUES (?, ?, ?, ?, 'Tersedia', ?, ?)
          `, [
            aks.id,
            kodeUnit,
            namaUnit,
            aks.kondisi || "Siap Digunakan",
            aks.lokasi || null,
            aks.keterangan || null,
          ]);
        }
      }
      console.log(`[Database Init] Berhasil melakukan backfill unit fisik untuk ${aksRows.length} aksesoris.`);
    }
  } catch (err) {
    console.error("[Database Init Error] aksesoris_units:", err.message);
  }
}

// Start server
app.listen(PORT, "0.0.0.0", async () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
  await initAksesorisUnitsTable();
});

