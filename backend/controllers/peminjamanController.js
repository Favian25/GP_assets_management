const Peminjaman = require("../models/peminjamanModel");
const Notification = require("../models/notificationModel");
const db = require("../config/db");
const path = require("path");
const fs = require("fs");
const { optimizeImage } = require("../utils/imageOptimizer");
const AuditLog = require("../models/auditModel");
const peminjamanController = {
  // GET semua data
  getAllPeminjaman: async (req, res) => {
    try {
      const data = await Peminjaman.getAll();
      res.status(200).json({ success: true, data });
    } catch (error) {
      console.error("Error get all peminjaman:", error);
      res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
  },

  // GET data by ID
  getPeminjamanById: async (req, res) => {
    try {
      const data = await Peminjaman.getById(req.params.id);
      if (!data) {
        return res.status(404).json({ success: false, message: "Data peminjaman tidak ditemukan" });
      }
      res.status(200).json({ success: true, data });
    } catch (error) {
      console.error("Error get peminjaman by id:", error);
      res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
  },

  // GET kode pinjam berikutnya
  getNextKode: async (req, res) => {
    try {
      const kode = await Peminjaman.getNextKodePinjam();
      res.status(200).json({ success: true, kode });
    } catch (error) {
      console.error("Error get next kode:", error);
      res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
  },

  // CREATE peminjaman baru
  createPeminjaman: async (req, res) => {
    try {
      const { nama_peminjam, alasan_peminjaman, keperluan_list, tanggal_peminjaman, yang_menyerahkan, items } = req.body;
      console.log("DEBUG: req.body fields:", Object.keys(req.body));
      console.log("DEBUG: nama_peminjam:", nama_peminjam);
      console.log("DEBUG: tanggal_peminjaman:", tanggal_peminjaman);
      console.log("DEBUG: alasan_peminjaman:", alasan_peminjaman);
      console.log("DEBUG: items:", items);
      const callerRole = req.user?.role;
      const isUserRole = ['user', 'guest'].includes(callerRole);

      if (!nama_peminjam) {
        return res.status(400).json({ success: false, message: "Nama peminjam wajib diisi!" });
      }
      if (!tanggal_peminjaman) {
        return res.status(400).json({ success: false, message: "Tanggal peminjaman wajib diisi!" });
      }
      if (!alasan_peminjaman || alasan_peminjaman.trim() === "") {
        return res.status(400).json({ success: false, message: "Alasan/keperluan peminjaman wajib diisi!" });
      }

      // yang_menyerahkan akan diisi saat approval, tidak perlu saat create

      let itemsArray = items;
      if (typeof items === "string") {
        try {
          itemsArray = JSON.parse(items);
        } catch (e) {
          itemsArray = [];
        }
      }

      if (!itemsArray || !Array.isArray(itemsArray) || itemsArray.length === 0) {
        return res.status(400).json({ success: false, message: "Minimal harus ada 1 barang yang dipinjam" });
      }

      // Validasi setiap item punya asset_id atau aksesoris_id dan jumlah
      for (const item of itemsArray) {
        if ((!item.asset_id && !item.aksesoris_id) || !item.jumlah || item.jumlah < 1) {
          return res.status(400).json({ success: false, message: "Setiap barang harus memiliki aset/aksesoris dan jumlah yang valid" });
        }
      }

      // Handle file uploads utk bukti_peminjaman & Optimize with Sharp
      let buktiPeminjamanUrls = null;
      if (req.files && req.files.length > 0) {
        const optimizedFiles = await Promise.all(
          req.files.map(async (f, idx) => {
            const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
            const newFilename = await optimizeImage(
              f.path,
              path.join(__dirname, "..", "public", "uploads"),
              `bukti_pinjam-${uniqueSuffix}-${idx}`
            );
            return `/uploads/${newFilename}`;
          })
        );
        buktiPeminjamanUrls = JSON.stringify(optimizedFiles);
      }

      // Auto-generate kode pinjam
      const kode_pinjam = await Peminjaman.getNextKodePinjam();

      // Parse keperluan_list jika string
      let keperluanListParsed = keperluan_list;
      if (typeof keperluan_list === 'string') {
        try { keperluanListParsed = JSON.parse(keperluan_list); } catch { keperluanListParsed = null; }
      }

      // req.user.userId from verifyToken middleware
      const result = await Peminjaman.create(
        { 
          kode_pinjam, 
          nama_peminjam, 
          alasan_peminjaman,
          keperluan_list: keperluanListParsed,
          tanggal_peminjaman, 
          yang_menyerahkan, 
          bukti_peminjaman: buktiPeminjamanUrls,
          user_id: req.user?.userId 
        },
        itemsArray
      );

      // Notifikasi: peminjaman baru
      await Notification.create({
        type: 'peminjaman_baru',
        message: `${nama_peminjam} membuat peminjaman baru (${kode_pinjam})`,
        referenceId: result.insertId,
        targetRoles: 'super admin,admin,supervisor',
      });

      // Cek stok rendah (≤ 3) untuk setiap item
      for (const item of itemsArray) {
        if (item.asset_id) {
          const [assetRows] = await db.query('SELECT nama_aset, jumlah FROM assets WHERE id = ?', [item.asset_id]);
          if (assetRows[0] && assetRows[0].jumlah <= 3) {
            await Notification.create({
              type: 'stok_rendah_aset',
              message: `Stok ${assetRows[0].nama_aset} tersisa ${assetRows[0].jumlah} unit`,
              referenceId: item.asset_id,
              targetRoles: 'super admin,admin',
            });
          }
        } else if (item.aksesoris_id) {
          const [aksRows] = await db.query('SELECT nama_aksesoris, jumlah_unit FROM aksesoris WHERE id = ?', [item.aksesoris_id]);
          if (aksRows[0] && aksRows[0].jumlah_unit <= 3) {
            await Notification.create({
              type: 'stok_rendah_aks',
              message: `Stok ${aksRows[0].nama_aksesoris} tersisa ${aksRows[0].jumlah_unit} unit`,
              referenceId: item.aksesoris_id,
              targetRoles: 'super admin,admin',
            });
          }
        }
      }

      await AuditLog.create({
        userId: req.user?.userId,
        userName: req.user?.nama,
        action: 'CREATE',
        entityType: 'Peminjaman',
        entityId: result.insertId,
        details: `Membuat peminjaman baru (${kode_pinjam}) untuk ${nama_peminjam}`
      });

      res.status(201).json({ success: true, message: "Peminjaman berhasil ditambahkan", data: result });
    } catch (error) {
      console.error("Error create peminjaman:", error);
      // Error stok tidak cukup akan punya pesan yang informatif dari model
      res.status(400).json({ success: false, message: error.message || "Gagal menambahkan peminjaman" });
    }
  },

  // UPDATE pengembalian peminjaman
  updatePeminjaman: async (req, res) => {
    try {
      const id = req.params.id;

      const checkData = await Peminjaman.getById(id);
      if (!checkData) {
        return res.status(404).json({ success: false, message: "Data peminjaman tidak ditemukan" });
      }

      // PERMISSION CHECK: Only owner or admin/super admin
      const isOwner = checkData.user_id === req.user?.userId;
      const isAdmin = ["super admin", "admin"].includes(req.user?.role);
      
      if (!isOwner && !isAdmin) {
        return res.status(403).json({ 
          success: false, 
          message: "Akses ditolak. Anda hanya dapat mengubah pengembalian untuk data yang Anda buat sendiri." 
        });
      }

      const { tanggal_pengembalian, status, penerima_aset } = req.body;
      
      let buktiPengembalianUrls = undefined;
      if (req.files && req.files.length > 0) {
        const optimizedFiles = await Promise.all(
          req.files.map(async (f, idx) => {
            const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
            const newFilename = await optimizeImage(
              f.path,
              path.join(__dirname, "..", "public", "uploads"),
              `bukti_kembali-${uniqueSuffix}-${idx}`
            );
            return `/uploads/${newFilename}`;
          })
        );
        buktiPengembalianUrls = JSON.stringify(optimizedFiles);
      }

      await Peminjaman.updateReturn(id, { tanggal_pengembalian, status, penerima_aset, bukti_pengembalian: buktiPengembalianUrls });

      // Notifikasi: pengembalian
      if (status === 'Menunggu Verifikasi') {
        await Notification.create({
          type: 'dikembalikan',
          message: `Peminjaman ${checkData.kode_pinjam} menunggu verifikasi pengembalian dari ${checkData.nama_peminjam}`,
          referenceId: id,
          targetRoles: 'super admin,admin,supervisor',
        });
      }

      await AuditLog.create({
        userId: req.user?.userId,
        userName: req.user?.nama,
        action: 'UPDATE',
        entityType: 'Peminjaman',
        entityId: id,
        details: `Memperbarui peminjaman: ${checkData.kode_pinjam}`
      });

      res.status(200).json({ success: true, message: "Data peminjaman berhasil diperbarui" });
    } catch (error) {
      console.error("Error update peminjaman:", error);
      res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
  },

  // APPROVE peminjaman
  approvePeminjaman: async (req, res) => {
    try {
      const id = req.params.id;
      const { approved_by, yang_menyerahkan, penerima_aset } = req.body;

      const checkData = await Peminjaman.getById(id);
      if (!checkData) {
        return res.status(404).json({ success: false, message: "Data peminjaman tidak ditemukan" });
      }

      if (checkData.status !== "Menunggu Persetujuan" && checkData.status !== "Menunggu Verifikasi") {
        return res.status(400).json({ success: false, message: "Status saat ini tidak membutuhkan persetujuan" });
      }

      // Untuk Menunggu Persetujuan, yang_menyerahkan harus diisi
      if (checkData.status === "Menunggu Persetujuan" && !yang_menyerahkan?.trim()) {
        return res.status(400).json({ success: false, message: "Yang Menyerahkan harus diisi" });
      }

      // Untuk Menunggu Verifikasi, penerima_aset harus diisi
      if (checkData.status === "Menunggu Verifikasi" && !penerima_aset?.trim()) {
        return res.status(400).json({ success: false, message: "Penerima Aset harus diisi" });
      }

      await Peminjaman.approve(id, approved_by || "System", yang_menyerahkan || null, penerima_aset || null);

      // Notifikasi: approved
      const actionText = checkData.status === "Menunggu Persetujuan" ? "disetujui untuk dipinjam" : "diverifikasi pengembaliannya";
      await Notification.create({
        type: 'approved',
        message: `Peminjaman ${checkData.kode_pinjam} telah ${actionText} oleh ${approved_by || 'System'} [Peminjam: ${checkData.nama_peminjam}] [By: ${checkData.created_by_name}]`,
        referenceId: id,
        targetRoles: 'super admin,admin,supervisor,user',
      });

      await AuditLog.create({
        userId: req.user?.userId,
        userName: req.user?.nama,
        action: 'UPDATE',
        entityType: 'Peminjaman',
        entityId: id,
        details: `Melakukan approve/verifikasi peminjaman: ${checkData.kode_pinjam}`
      });

      res.status(200).json({ success: true, message: "Peminjaman berhasil di-approve" });
    } catch (error) {
      console.error("Error approve peminjaman:", error);
      res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
  },

  // DELETE peminjaman
  deletePeminjaman: async (req, res) => {
    try {
      const id = req.params.id;
      const checkData = await Peminjaman.getById(id);

      if (!checkData) {
        return res.status(404).json({ success: false, message: "Data peminjaman tidak ditemukan" });
      }

      // PERMISSION CHECK: Only owner or admin/super admin
      const isOwner = checkData.user_id === req.user?.userId;
      const isAdmin = ["super admin", "admin"].includes(req.user?.role);
      
      if (!isOwner && !isAdmin) {
        return res.status(403).json({ 
          success: false, 
          message: "Akses ditolak. Anda hanya dapat menghapus data yang Anda buat sendiri." 
        });
      }

      await Peminjaman.delete(id);
      await AuditLog.create({
        userId: req.user?.userId,
        userName: req.user?.nama,
        action: 'DELETE',
        entityType: 'Peminjaman',
        entityId: id,
        details: `Menghapus peminjaman: ${checkData.kode_pinjam}`
      });

      res.status(200).json({ success: true, message: "Data peminjaman berhasil dihapus" });
    } catch (error) {
      console.error("Error delete peminjaman:", error);
      res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
  },

  // SEARCH peminjaman
  searchPeminjaman: async (req, res) => {
    try {
      const keyword = req.query.q;
      if (!keyword) {
        return res.status(400).json({ success: false, message: "Keyword pencarian tidak boleh kosong" });
      }

      const data = await Peminjaman.search(keyword);
      res.status(200).json({ success: true, data });
    } catch (error) {
      console.error("Error search peminjaman:", error);
      res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
  },

  // GENERATE PDF (Frontend-side Print)
  generatePDF: async (req, res) => {
    try {
      const { generateLoanPDF } = require('../utils/pdfGenerator');
      const data = await Peminjaman.getById(req.params.id);

      if (!data) {
        return res.status(404).json({ success: false, message: "Data tidak ditemukan" });
      }

      const htmlContent = await generateLoanPDF(data);

      res.setHeader('Content-Type', 'text/html');
      res.send(htmlContent);
    } catch (error) {
      console.error("Error generate HTML for PDF:", error);
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: "Gagal memproses dokumen cetak" });
      }
    }
  },

  // SWAP item saat Sedang Dipinjam
  swapItem: async (req, res) => {
    try {
      const { id } = req.params;
      const { old_item_id, old_item_type, new_item_id, new_item_type, jumlah } = req.body;
      if (!old_item_id || !old_item_type || !new_item_id || !new_item_type || !jumlah) {
        return res.status(400).json({ success: false, message: 'Data tidak lengkap' });
      }
      await Peminjaman.swapItem(id, old_item_id, old_item_type, new_item_id, new_item_type, jumlah);

      await AuditLog.create({
        userId: req.user?.userId,
        userName: req.user?.nama,
        action: 'UPDATE',
        entityType: 'Peminjaman',
        entityId: id,
        details: `Menukar barang pada peminjaman ID ${id}`
      });

      res.status(200).json({ success: true, message: 'Barang berhasil ditukar' });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  // ADD item saat Sedang Dipinjam
  addItemWhileBorrowed: async (req, res) => {
    try {
      const { id } = req.params;
      const { item_id, item_type, jumlah } = req.body;
      if (!item_id || !item_type || !jumlah) {
        return res.status(400).json({ success: false, message: 'Data tidak lengkap' });
      }
      await Peminjaman.addItemWhileBorrowed(id, item_id, item_type, jumlah);

      await AuditLog.create({
        userId: req.user?.userId,
        userName: req.user?.nama,
        action: 'UPDATE',
        entityType: 'Peminjaman',
        entityId: id,
        details: `Menambah barang pada peminjaman ID ${id}`
      });

      res.status(200).json({ success: true, message: 'Barang berhasil ditambahkan' });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  // GET riwayat peminjaman per user
  getMyHistory: async (req, res) => {
    try {
      const userId = req.user?.userId;
      const data = await Peminjaman.getByUserId(userId);
      res.status(200).json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server Error' });
    }
  },

  // GET peminjaman by status
  getPeminjamanByStatus: async (req, res) => {
    try {
      const { status } = req.params;
      const data = await Peminjaman.getByStatus(status);
      res.status(200).json({ success: true, data });
    } catch (error) {
      console.error("Error get peminjaman by status:", error);
      res.status(500).json({ success: false, message: 'Server Error' });
    }
  },

  // GET peminjaman by nama peminjam (for borrowing history)
  getPeminjamanByNamaPeminjam: async (req, res) => {
    try {
      const { nama_peminjam } = req.params;
      const data = await Peminjaman.getByNamaPeminjam(nama_peminjam);
      res.status(200).json({ success: true, data });
    } catch (error) {
      console.error("Error get peminjaman by nama peminjam:", error);
      res.status(500).json({ success: false, message: 'Server Error' });
    }
  },

  // GET items with pricing
  getItemsWithPricing: async (req, res) => {
    try {
      const { id } = req.params;
      const data = await Peminjaman.getItemsWithPricing(id);
      res.status(200).json({ success: true, data });
    } catch (error) {
      console.error("Error get items with pricing:", error);
      res.status(500).json({ success: false, message: 'Server Error' });
    }
  },
};

module.exports = peminjamanController;
