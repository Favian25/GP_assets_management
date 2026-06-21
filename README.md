# 📦 Sistem Pencatatan Aset — Galeria Production

Sistem manajemen aset berbasis web untuk **Galeria Production**. Dibangun dengan arsitektur fullstack modern menggunakan **Next.js** (frontend) dan **Express.js** (backend REST API), dengan database **MySQL**.

Aplikasi ini digunakan untuk mencatat, mengelola, dan memantau seluruh aset & aksesoris perusahaan, termasuk fitur peminjaman aset dengan multi-approval workflow.

---

## ✨ Fitur Utama

- **Dashboard** — Ringkasan statistik aset, aksesoris, dan peminjaman
- **Manajemen Aset** — CRUD aset dengan kode otomatis, upload gambar, dan filter
- **Manajemen Aksesoris** — Pencatatan aksesoris terpisah dari aset utama
- **Peminjaman Aset** — Workflow peminjaman dengan approval bertingkat (request → approve → return → verify)
- **Kategori & Merek** — Master data kategori dan merek untuk aset & aksesoris
- **Kelola User** — Manajemen pengguna dengan role-based access control
- **Notifikasi** — Sistem notifikasi real-time untuk approval dan update
- **Audit Log** — Tracking seluruh aktivitas pengguna
- **Laporan** — Export data ke PDF dan Excel
- **Profil** — Upload foto profil dan ubah password
- **Autentikasi** — Login dengan JWT token (8 jam expiry)

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|-------|----------|
| Frontend | Next.js 16, React 19, Tailwind CSS v4 |
| Backend | Express.js, Node.js |
| Database | MySQL 8.x |
| Auth | JWT (jsonwebtoken), bcryptjs |
| File Upload | Multer, Sharp (image optimization) |
| PDF | Puppeteer (server-side rendering) |
| HTTP Client | Axios |
| Icons | Lucide React |
| Export | jsPDF, jsPDF-AutoTable, SheetJS (xlsx) |

---

## 📋 Prasyarat

- **Node.js** v18 atau lebih baru
- **MySQL** 8.x
- **npm** (disertakan bersama Node.js)

---

## 🚀 Instalasi & Setup

### 1. Clone Repository

```bash
git clone https://github.com/Favian25/GP_assets_management.git
cd GP_assets_management
```

### 2. Setup Database

Import file SQL ke MySQL untuk membuat database dan tabel:

```bash
mysql -u root -p < gp_asset_management.sql
```

Atau import melalui phpMyAdmin.

> **Catatan:** File SQL sudah berisi 1 user super admin default:
> - Email: `superadmin@galeria.com`
> - Password: `superadmin`

### 3. Setup Backend

```bash
cd backend
npm install
```

Buat file `.env` di folder `backend/`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=gp_asset_management

PORT=5000
JWT_SECRET=your_jwt_secret_here
FRONTEND_URL=http://localhost:3000
```

> **Penting:** Ganti `JWT_SECRET` dengan string random yang kuat untuk production.

Jalankan server:

```bash
npm run dev
```

Backend berjalan di `http://localhost:5000`

### 4. Setup Frontend

```bash
cd frontend
npm install
```

Buat file `.env` di folder `frontend/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Jalankan development server:

```bash
npm run dev
```

Frontend berjalan di `http://localhost:3000`

---

## 🗄️ Database Schema

| Tabel | Deskripsi |
|-------|-----------|
| `users` | Data pengguna (email, password hash, role, foto profil) |
| `assets` | Data aset utama (kode, nama, SN, spesifikasi, harga, kondisi) |
| `aksesoris` | Data aksesoris (kode, nama, kategori, jumlah) |
| `peminjaman` | Header transaksi peminjaman |
| `peminjaman_items` | Detail item per peminjaman (aset & aksesoris) |
| `categories` | Master kategori (aset & aksesoris) |
| `brands` | Master merek |
| `notifications` | Notifikasi sistem |
| `audit_logs` | Log audit aktivitas pengguna |

---

## 👥 Role & Hak Akses

| Role | Hak Akses |
|------|-----------|
| **Super Admin** | Akses penuh ke seluruh fitur termasuk kelola user dan role |
| **Admin** | Kelola aset, aksesoris, approve peminjaman |
| **Supervisor** | Melihat data, approve/reject peminjaman |
| **User** | Melihat data dan mengajukan peminjaman |

---

## 📡 API Endpoints

| Prefix | Deskripsi |
|--------|-----------|
| `/api/auth` | Register, Login, Reset Password, Change Password |
| `/api/assets` | CRUD Aset |
| `/api/aksesoris` | CRUD Aksesoris |
| `/api/peminjaman` | CRUD Peminjaman, Approval, Return |
| `/api/users` | Kelola User, Profil |
| `/api/categories` | Master Kategori |
| `/api/brands` | Master Merek |
| `/api/notifications` | Notifikasi |
| `/api/audit` | Audit Log |

---

## 📁 Struktur Project

```
sistem_pencatatan_asset/
├── backend/
│   ├── config/          # Konfigurasi database
│   ├── controllers/     # Logic handler per modul
│   ├── middlewares/      # Auth & role middleware
│   ├── models/           # Database query layer
│   ├── routes/           # Route definitions
│   ├── utils/            # Helper (image optimizer, PDF generator)
│   ├── public/uploads/   # File upload storage
│   ├── server.js         # Entry point
│   └── package.json
│
├── frontend/
│   └── src/app/
│       ├── page.js           # Dashboard
│       ├── aset/             # Halaman aset (daftar, kategori, peminjaman)
│       ├── aksesoris/        # Halaman aksesoris
│       ├── auth/             # Halaman login
│       ├── kelola-user/      # Manajemen user
│       ├── profil/           # Profil user
│       ├── reports/          # Laporan
│       ├── notifikasi/       # Notifikasi
│       ├── components/       # Shared components (Navbar, dll)
│       └── lib/              # Services & utilities
│
└── gp_asset_management.sql   # Database schema + seed data
```

---

## 📄 Lisensi

Project internal **Galeria Production** — Hak cipta dilindungi.
