const db = require("../config/db");

const Peminjaman = {
  // Generate kode pinjam berikutnya (GP-PJM-1, GP-PJM-2, ...)
  getNextKodePinjam: async () => {
    const [rows] = await db.query(
      "SELECT kode_pinjam FROM peminjaman ORDER BY id DESC LIMIT 1"
    );
    let nextNum = 1;
    if (rows[0] && rows[0].kode_pinjam) {
      const match = rows[0].kode_pinjam.match(/GPRO-PJM-(\d+)/);
      if (match) nextNum = parseInt(match[1]) + 1;
    }
    return `GPRO-PJM-${nextNum}`;
  },

  // GET semua data peminjaman beserta items
  getAll: async () => {
    const [headers] = await db.query(
      `SELECT p.*, u.nama_lengkap as created_by_name,
        (SELECT COUNT(*) FROM peminjaman_items pi WHERE pi.peminjaman_id = p.id) AS total_items,
        (SELECT GROUP_CONCAT(COALESCE(a.nama_aset, ak.nama_aksesoris) SEPARATOR ', ') 
         FROM peminjaman_items pi 
         LEFT JOIN assets a ON pi.asset_id = a.id 
         LEFT JOIN aksesoris ak ON pi.aksesoris_id = ak.id
         WHERE pi.peminjaman_id = p.id) AS daftar_aset
       FROM peminjaman p
       LEFT JOIN users u ON p.user_id = u.id
       ORDER BY p.created_at DESC`
    );
    return headers;
  },

  // GET data berdasarkan ID (header + items)
  getById: async (id) => {
    const [headers] = await db.query(
      `SELECT p.*, u.nama_lengkap as created_by_name 
       FROM peminjaman p 
       LEFT JOIN users u ON p.user_id = u.id 
       WHERE p.id = ?`, 
      [id]
    );
    if (!headers[0]) return null;

    const [items] = await db.query(
      `SELECT pi.*, 
              COALESCE(a.nama_aset, ak.nama_aksesoris) AS nama_aset, 
              COALESCE(a.kode_aset, ak.kode_aksesoris) AS kode_aset, 
              COALESCE(a.jumlah, ak.jumlah_unit) AS stok_tersedia
       FROM peminjaman_items pi
       LEFT JOIN assets a ON pi.asset_id = a.id
       LEFT JOIN aksesoris ak ON pi.aksesoris_id = ak.id
       WHERE pi.peminjaman_id = ?`,
      [id]
    );

    return { ...headers[0], items };
  },

  // CREATE peminjaman baru (header + items) dengan transaction
  create: async (headerData, items) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const {
        kode_pinjam, nama_peminjam, alasan_peminjaman,
        tanggal_peminjaman, yang_menyerahkan, bukti_peminjaman
      } = headerData;

      // Insert header
      const [headerResult] = await connection.query(
        `INSERT INTO peminjaman 
          (kode_pinjam, nama_peminjam, alasan_peminjaman, tanggal_peminjaman, yang_menyerahkan, status, bukti_peminjaman, user_id)
         VALUES (?, ?, ?, ?, ?, 'Menunggu Persetujuan', ?, ?)`,
        [kode_pinjam, nama_peminjam, alasan_peminjaman || null, tanggal_peminjaman, yang_menyerahkan || null, bukti_peminjaman || null, headerData.user_id || null]
      );

      const peminjamanId = headerResult.insertId;

      // Insert items & kurangi stok
      for (const item of items) {
        if (item.asset_id) {
          // Aset Utama
          const [stokRows] = await connection.query(
            "SELECT jumlah, nama_aset FROM assets WHERE id = ? FOR UPDATE",
            [item.asset_id]
          );

          if (!stokRows[0]) throw new Error(`Aset dengan ID ${item.asset_id} tidak ditemukan`);

          const stokSekarang = stokRows[0].jumlah || 0;
          if (stokSekarang < item.jumlah) {
            throw new Error(`Stok "${stokRows[0].nama_aset}" tidak mencukupi. Tersedia: ${stokSekarang}, Diminta: ${item.jumlah}`);
          }

          await connection.query(
            "INSERT INTO peminjaman_items (peminjaman_id, asset_id, jumlah) VALUES (?, ?, ?)",
            [peminjamanId, item.asset_id, item.jumlah]
          );

          await connection.query(
            "UPDATE assets SET jumlah = jumlah - ? WHERE id = ?",
            [item.jumlah, item.asset_id]
          );
        } else if (item.aksesoris_id) {
          // Aksesoris
          const [stokRows] = await connection.query(
            "SELECT jumlah_unit, nama_aksesoris FROM aksesoris WHERE id = ? FOR UPDATE",
            [item.aksesoris_id]
          );

          if (!stokRows[0]) throw new Error(`Aksesoris dengan ID ${item.aksesoris_id} tidak ditemukan`);

          const stokSekarang = stokRows[0].jumlah_unit || 0;
          if (stokSekarang < item.jumlah) {
            throw new Error(`Stok "${stokRows[0].nama_aksesoris}" tidak mencukupi. Tersedia: ${stokSekarang}, Diminta: ${item.jumlah}`);
          }

          await connection.query(
            "INSERT INTO peminjaman_items (peminjaman_id, aksesoris_id, jumlah) VALUES (?, ?, ?)",
            [peminjamanId, item.aksesoris_id, item.jumlah]
          );

          await connection.query(
            "UPDATE aksesoris SET jumlah_unit = jumlah_unit - ? WHERE id = ?",
            [item.jumlah, item.aksesoris_id]
          );
        }
      }

      await connection.commit();
      return { id: peminjamanId, kode_pinjam };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  // UPDATE pengembalian (hanya field tertentu)
  updateReturn: async (id, data) => {
    const { tanggal_pengembalian, status, penerima_aset, bukti_pengembalian } = data;

    let updateFields = [];
    let updateValues = [];

    if (tanggal_pengembalian !== undefined) {
      updateFields.push("tanggal_pengembalian = ?");
      updateValues.push(tanggal_pengembalian || null);
    }
    
    if (status !== undefined) {
      updateFields.push("status = ?");
      updateValues.push(status || "Dikembalikan");
    }

    if (penerima_aset !== undefined) {
      updateFields.push("penerima_aset = ?");
      updateValues.push(penerima_aset || null);
    }

    if (bukti_pengembalian !== undefined) {
      updateFields.push("bukti_pengembalian = ?");
      updateValues.push(bukti_pengembalian);
    }

    if (updateFields.length === 0) return 0;
    
    updateValues.push(id);

    const [result] = await db.query(
      `UPDATE peminjaman SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    return result.affectedRows;
  },

  // APPROVE peminjaman (Menunggu Persetujuan → Sedang Dipinjam, ATAU Menunggu Verifikasi → Peminjaman Selesai)
  approve: async (id, approvedBy) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Cek status saat ini
      const [headers] = await connection.query("SELECT status FROM peminjaman WHERE id = ?", [id]);
      if (!headers[0]) throw new Error("Data tidak ditemukan");
      
      const currentStatus = headers[0].status;

      if (currentStatus === 'Menunggu Persetujuan') {
        // Approval 1: Izinkan pinjam → simpan di approved_by
        await connection.query(
          "UPDATE peminjaman SET status = 'Sedang Dipinjam', approved_by = ? WHERE id = ?",
          [approvedBy, id]
        );
        // Tidak mengembalikan stok karena memang sedang dipinjam
      } else if (currentStatus === 'Menunggu Verifikasi') {
        // Approval 2: Barang kembali → simpan di return_approved_by
        await connection.query(
          "UPDATE peminjaman SET status = 'Peminjaman Selesai', return_approved_by = ? WHERE id = ?",
          [approvedBy, id]
        );

        // Ambil items dan kembalikan stok
        const [items] = await connection.query(
          "SELECT asset_id, aksesoris_id, jumlah FROM peminjaman_items WHERE peminjaman_id = ?",
          [id]
        );

        for (const item of items) {
          if (item.asset_id) {
            await connection.query(
              "UPDATE assets SET jumlah = jumlah + ? WHERE id = ?",
              [item.jumlah, item.asset_id]
            );
          } else if (item.aksesoris_id) {
            await connection.query(
              "UPDATE aksesoris SET jumlah_unit = jumlah_unit + ? WHERE id = ?",
              [item.jumlah, item.aksesoris_id]
            );
          }
        }
      } else {
        throw new Error("Status saat ini tidak membutuhkan persetujuan.");
      }

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  // DELETE peminjaman + kembalikan stok jika masih Pending
  delete: async (id) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Cek status
      const [headers] = await connection.query("SELECT status FROM peminjaman WHERE id = ?", [id]);
      if (!headers[0]) throw new Error("Data tidak ditemukan");

      // Jika belum selesai, berarti stok masih ditahan, maka kembalikan stok
      if (headers[0].status !== "Peminjaman Selesai") {
        const [items] = await connection.query(
          "SELECT asset_id, aksesoris_id, jumlah FROM peminjaman_items WHERE peminjaman_id = ?",
          [id]
        );
        for (const item of items) {
          if (item.asset_id) {
            await connection.query(
              "UPDATE assets SET jumlah = jumlah + ? WHERE id = ?",
              [item.jumlah, item.asset_id]
            );
          } else if (item.aksesoris_id) {
            await connection.query(
              "UPDATE aksesoris SET jumlah_unit = jumlah_unit + ? WHERE id = ?",
              [item.jumlah, item.aksesoris_id]
            );
          }
        }
      }

      // Delete header (items auto-cascade)
      await connection.query("DELETE FROM peminjaman WHERE id = ?", [id]);

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  // SEARCH peminjaman
  search: async (keyword) => {
    const search = `%${keyword}%`;
    const [rows] = await db.query(
      `SELECT p.*,
        (SELECT COUNT(*) FROM peminjaman_items pi WHERE pi.peminjaman_id = p.id) AS total_items,
        (SELECT GROUP_CONCAT(COALESCE(a.nama_aset, ak.nama_aksesoris) SEPARATOR ', ') 
         FROM peminjaman_items pi 
         LEFT JOIN assets a ON pi.asset_id = a.id 
         LEFT JOIN aksesoris ak ON pi.aksesoris_id = ak.id
         WHERE pi.peminjaman_id = p.id) AS daftar_aset
       FROM peminjaman p
       WHERE p.kode_pinjam LIKE ? 
          OR p.nama_peminjam LIKE ? 
          OR p.status LIKE ?
          OR p.penerima_aset LIKE ?
          OR EXISTS (
            SELECT 1 FROM peminjaman_items pi 
            LEFT JOIN assets a ON pi.asset_id = a.id 
            LEFT JOIN aksesoris ak ON pi.aksesoris_id = ak.id
            WHERE pi.peminjaman_id = p.id AND (a.nama_aset LIKE ? OR ak.nama_aksesoris LIKE ?)
          )
       ORDER BY p.created_at DESC`,
      [search, search, search, search, search, search]
    );
    return rows;
  },
};

module.exports = Peminjaman;
