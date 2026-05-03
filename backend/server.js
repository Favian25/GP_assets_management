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
    origin: ["http://localhost:3000", `http://${localIp}:3000`],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (untuk akses gambar yang di-upload)
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/peminjaman", peminjamanRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/aksesoris", aksesorisRoutes);

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

// Start server
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
