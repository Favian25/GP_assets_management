const db = require("../config/db");

const Aksesoris = {
  // GET semua aksesoris
  getAll: async () => {
    const [rows] = await db.query(
      `SELECT a.*, u.nama_lengkap as created_by_name 
       FROM aksesoris a
       LEFT JOIN users u ON a.user_id = u.id
       ORDER BY a.created_at DESC`
    );
    return rows;
  },

  // GET aksesoris berdasarkan ID
  getById: async (id) => {
    const [rows] = await db.query("SELECT * FROM aksesoris WHERE id = ?", [id]);
    return rows[0];
  },

  // Generate kode aksesoris berikutnya
  getNextKode: async (kodeSingkat) => {
    const prefix = `GKM-${kodeSingkat}-`;
    const [rows] = await db.query(
      "SELECT kode_aksesoris FROM aksesoris WHERE kode_aksesoris LIKE ? ORDER BY id DESC LIMIT 1",
      [`${prefix}%`]
    );
    let nextNum = 1;
    if (rows[0] && rows[0].kode_aksesoris) {
      const match = rows[0].kode_aksesoris.match(new RegExp(`GKM-${kodeSingkat}-(\\d+)`));
      if (match) nextNum = parseInt(match[1]) + 1;
    }
    return `${prefix}${String(nextNum).padStart(3, "0")}`;
  },

  // CREATE aksesoris baru
  create: async (data) => {
    const {
      kode_aksesoris,
      nama_aksesoris,
      kategori,
      merek,
      model,
      jumlah_unit,
      harga_aset,
      tanggal_pembelian,
      kondisi,
      lokasi,
      gambar,
      keterangan,
    } = data;

    const [result] = await db.query(
      `INSERT INTO aksesoris 
        (kode_aksesoris, nama_aksesoris, kategori, merek, model, jumlah_unit, harga_aset, tanggal_pembelian, kondisi, lokasi, gambar, keterangan, jumlah_total, user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        kode_aksesoris,
        nama_aksesoris,
        kategori || null,
        merek || null,
        model || null,
        jumlah_unit || null,
        harga_aset || null,
        tanggal_pembelian || null,
        kondisi || "Siap Digunakan",
        lokasi || null,
        gambar || null,
        keterangan || null,
        jumlah_unit || null,
        data.user_id || null,
      ]
    );

    return { id: result.insertId, ...data };
  },

  // UPDATE aksesoris berdasarkan ID
  update: async (id, data) => {
    const {
      kode_aksesoris,
      nama_aksesoris,
      kategori,
      merek,
      model,
      jumlah_unit,
      harga_aset,
      tanggal_pembelian,
      kondisi,
      lokasi,
      gambar,
      keterangan,
    } = data;

    const [result] = await db.query(
      `UPDATE aksesoris SET
        kode_aksesoris = ?, nama_aksesoris = ?, kategori = ?,
        merek = ?, model = ?, jumlah_unit = ?, harga_aset = ?,
        tanggal_pembelian = ?, kondisi = ?, lokasi = ?, gambar = ?,
        keterangan = ?, jumlah_total = ?
       WHERE id = ?`,
      [
        kode_aksesoris,
        nama_aksesoris,
        kategori || null,
        merek || null,
        model || null,
        jumlah_unit || null,
        harga_aset || null,
        tanggal_pembelian || null,
        kondisi || "Siap Digunakan",
        lokasi || null,
        gambar || null,
        keterangan || null,
        data.jumlah_total || jumlah_unit || null,
        id,
      ]
    );

    return result.affectedRows;
  },

  // UPDATE kondisi aksesoris (patch)
  updateKondisi: async (id, kondisi) => {
    const [result] = await db.query(
      "UPDATE aksesoris SET kondisi = ? WHERE id = ?",
      [kondisi, id]
    );
    return result.affectedRows;
  },

  // DELETE aksesoris berdasarkan ID
  delete: async (id) => {
    const [result] = await db.query("DELETE FROM aksesoris WHERE id = ?", [id]);
    return result.affectedRows;
  },

  // SEARCH aksesoris berdasarkan keyword
  search: async (keyword) => {
    const search = `%${keyword}%`;
    const [rows] = await db.query(
      `SELECT a.*, u.nama_lengkap as created_by_name 
       FROM aksesoris a
       LEFT JOIN users u ON a.user_id = u.id
       WHERE a.kode_aksesoris LIKE ? OR a.nama_aksesoris LIKE ? OR a.kategori LIKE ? OR a.model LIKE ? OR a.merek LIKE ?
       ORDER BY a.created_at DESC`,
      [search, search, search, search, search]
    );
    return rows;
  },
};

module.exports = Aksesoris;
