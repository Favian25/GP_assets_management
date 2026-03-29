const db = require("../config/db");

const Asset = {
  // GET semua aset
  getAll: async () => {
    const [rows] = await db.query(
      "SELECT * FROM assets ORDER BY created_at DESC"
    );
    return rows;
  },

  // GET aset berdasarkan ID
  getById: async (id) => {
    const [rows] = await db.query("SELECT * FROM assets WHERE id = ?", [id]);
    return rows[0];
  },

  // CREATE aset baru
  create: async (data) => {
    const {
      kode_aset,
      nama_aset,
      pengguna,
      kategori,
      merek,
      model,
      no_sn,
      spesifikasi,
      lokasi_aset,
      kondisi,
      unit,
      gambar,
      keterangan,
    } = data;

    const [result] = await db.query(
      `INSERT INTO assets 
        (kode_aset, nama_aset, pengguna, kategori, merek, model, no_sn, spesifikasi, lokasi_aset, kondisi, unit, gambar, keterangan)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        kode_aset,
        nama_aset,
        pengguna || null,
        kategori || null,
        merek || null,
        model || null,
        no_sn || null,
        spesifikasi || null,
        lokasi_aset || null,
        kondisi || "Siap Digunakan",
        unit || null,
        gambar || null,
        keterangan || null,
      ]
    );

    return { id: result.insertId, ...data };
  },

  // UPDATE aset berdasarkan ID
  update: async (id, data) => {
    const {
      kode_aset,
      nama_aset,
      pengguna,
      kategori,
      merek,
      model,
      no_sn,
      spesifikasi,
      lokasi_aset,
      kondisi,
      unit,
      gambar,
      keterangan,
    } = data;

    const [result] = await db.query(
      `UPDATE assets SET
        kode_aset = ?, nama_aset = ?, pengguna = ?, kategori = ?,
        merek = ?, model = ?, no_sn = ?, spesifikasi = ?,
        lokasi_aset = ?, kondisi = ?, unit = ?, gambar = ?, keterangan = ?
       WHERE id = ?`,
      [
        kode_aset,
        nama_aset,
        pengguna || null,
        kategori || null,
        merek || null,
        model || null,
        no_sn || null,
        spesifikasi || null,
        lokasi_aset || null,
        kondisi || "Siap Digunakan",
        unit || null,
        gambar || null,
        keterangan || null,
        id,
      ]
    );

    return result.affectedRows;
  },

  // DELETE aset berdasarkan ID
  delete: async (id) => {
    const [result] = await db.query("DELETE FROM assets WHERE id = ?", [id]);
    return result.affectedRows;
  },

  // SEARCH aset berdasarkan keyword
  search: async (keyword) => {
    const search = `%${keyword}%`;
    const [rows] = await db.query(
      `SELECT * FROM assets 
       WHERE kode_aset LIKE ? OR nama_aset LIKE ? OR kategori LIKE ? OR model LIKE ? OR merek LIKE ?
       ORDER BY created_at DESC`,
      [search, search, search, search, search]
    );
    return rows;
  },
};

module.exports = Asset;
