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
      `SELECT p.*, 
        (SELECT COUNT(*) FROM peminjaman_items pi WHERE pi.peminjaman_id = p.id) AS total_items,
        (SELECT GROUP_CONCAT(a.nama_aset SEPARATOR ', ') 
         FROM peminjaman_items pi 
         JOIN assets a ON pi.asset_id = a.id 
         WHERE pi.peminjaman_id = p.id) AS daftar_aset
       FROM peminjaman p
       ORDER BY p.created_at DESC`
    );
    return headers;
  },

  // GET data berdasarkan ID (header + items)
  getById: async (id) => {
    const [headers] = await db.query("SELECT * FROM peminjaman WHERE id = ?", [id]);
    if (!headers[0]) return null;

    const [items] = await db.query(
      `SELECT pi.*, a.nama_aset, a.kode_aset, a.jumlah AS stok_tersedia
       FROM peminjaman_items pi
       JOIN assets a ON pi.asset_id = a.id
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
        tanggal_peminjaman, yang_menyerahkan
      } = headerData;

      // Insert header
      const [headerResult] = await connection.query(
        `INSERT INTO peminjaman 
          (kode_pinjam, nama_peminjam, alasan_peminjaman, tanggal_peminjaman, yang_menyerahkan, status)
         VALUES (?, ?, ?, ?, ?, 'Pending')`,
        [kode_pinjam, nama_peminjam, alasan_peminjaman || null, tanggal_peminjaman, yang_menyerahkan || null]
      );

      const peminjamanId = headerResult.insertId;

      // Insert items & kurangi stok
      for (const item of items) {
        // Cek stok
        const [stokRows] = await connection.query(
          "SELECT jumlah FROM assets WHERE id = ? FOR UPDATE",
          [item.asset_id]
        );

        if (!stokRows[0]) {
          throw new Error(`Aset dengan ID ${item.asset_id} tidak ditemukan`);
        }

        const stokSekarang = stokRows[0].jumlah || 0;
        if (stokSekarang < item.jumlah) {
          // Ambil nama aset untuk pesan error yang informatif
          const [asetInfo] = await connection.query("SELECT nama_aset FROM assets WHERE id = ?", [item.asset_id]);
          const namaAset = asetInfo[0]?.nama_aset || `ID ${item.asset_id}`;
          throw new Error(`Stok "${namaAset}" tidak mencukupi. Tersedia: ${stokSekarang}, Diminta: ${item.jumlah}`);
        }

        // Insert item
        await connection.query(
          "INSERT INTO peminjaman_items (peminjaman_id, asset_id, jumlah) VALUES (?, ?, ?)",
          [peminjamanId, item.asset_id, item.jumlah]
        );

        // Kurangi stok aset
        await connection.query(
          "UPDATE assets SET jumlah = jumlah - ? WHERE id = ?",
          [item.jumlah, item.asset_id]
        );
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
    const { tanggal_pengembalian, status, penerima_aset } = data;

    const [result] = await db.query(
      `UPDATE peminjaman SET 
        tanggal_pengembalian = ?, status = ?, penerima_aset = ?
       WHERE id = ?`,
      [tanggal_pengembalian || null, status || "Dikembalikan", penerima_aset || null, id]
    );

    return result.affectedRows;
  },

  // APPROVE peminjaman (Dikembalikan → Approved) + kembalikan stok
  approve: async (id, approvedBy) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Update status
      await connection.query(
        "UPDATE peminjaman SET status = 'Approved', approved_by = ? WHERE id = ? AND status = 'Dikembalikan'",
        [approvedBy, id]
      );

      // Ambil items dan kembalikan stok
      const [items] = await connection.query(
        "SELECT asset_id, jumlah FROM peminjaman_items WHERE peminjaman_id = ?",
        [id]
      );

      for (const item of items) {
        await connection.query(
          "UPDATE assets SET jumlah = jumlah + ? WHERE id = ?",
          [item.jumlah, item.asset_id]
        );
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

      // Jika masih Pending, kembalikan stok
      if (headers[0].status === "Pending") {
        const [items] = await connection.query(
          "SELECT asset_id, jumlah FROM peminjaman_items WHERE peminjaman_id = ?",
          [id]
        );
        for (const item of items) {
          await connection.query(
            "UPDATE assets SET jumlah = jumlah + ? WHERE id = ?",
            [item.jumlah, item.asset_id]
          );
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
        (SELECT GROUP_CONCAT(a.nama_aset SEPARATOR ', ') 
         FROM peminjaman_items pi 
         JOIN assets a ON pi.asset_id = a.id 
         WHERE pi.peminjaman_id = p.id) AS daftar_aset
       FROM peminjaman p
       WHERE p.kode_pinjam LIKE ? 
          OR p.nama_peminjam LIKE ? 
          OR p.status LIKE ?
          OR p.penerima_aset LIKE ?
          OR EXISTS (
            SELECT 1 FROM peminjaman_items pi 
            JOIN assets a ON pi.asset_id = a.id 
            WHERE pi.peminjaman_id = p.id AND a.nama_aset LIKE ?
          )
       ORDER BY p.created_at DESC`,
      [search, search, search, search, search]
    );
    return rows;
  },
};

module.exports = Peminjaman;
