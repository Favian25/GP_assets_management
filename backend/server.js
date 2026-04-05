const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const assetRoutes = require("./routes/assetRoutes");
const peminjamanRoutes = require("./routes/peminjamanRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
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

// Error handling middleware (untuk multer errors)
app.use((err, req, res, next) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      message: "Ukuran file maksimal 2MB",
    });
  }
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
