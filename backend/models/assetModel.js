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

  // Generate kode aset berikutnya
  getNextKodeAset: async (kodeSingkat) => {
    const prefix = `GPRO-${kodeSingkat}-`;
    const [rows] = await db.query(
      "SELECT kode_aset FROM assets WHERE kode_aset LIKE ? ORDER BY id DESC LIMIT 1",
      [`${prefix}%`]
    );
    let nextNum = 1;
    if (rows[0] && rows[0].kode_aset) {
      const match = rows[0].kode_aset.match(new RegExp(`GPRO-${kodeSingkat}-(\\d+)`));
      if (match) nextNum = parseInt(match[1]) + 1;
    }
    return `${prefix}${String(nextNum).padStart(3, "0")}`;
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
      jumlah,
      harga_aset,
      tanggal_pembelian,
    } = data;

    const [result] = await db.query(
      `INSERT INTO assets 
        (kode_aset, nama_aset, pengguna, kategori, merek, model, no_sn, spesifikasi, lokasi_aset, kondisi, unit, gambar, keterangan, jumlah, harga_aset, jumlah_total, tanggal_pembelian)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        jumlah || null,
        harga_aset || null,
        jumlah || null,
        tanggal_pembelian || null,
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
      jumlah,
      harga_aset,
      tanggal_pembelian,
    } = data;

    const [result] = await db.query(
      `UPDATE assets SET
        kode_aset = ?, nama_aset = ?, pengguna = ?, kategori = ?,
        merek = ?, model = ?, no_sn = ?, spesifikasi = ?,
        lokasi_aset = ?, kondisi = ?, unit = ?, gambar = ?, keterangan = ?,
        jumlah = ?, jumlah_total = ?, harga_aset = ?, tanggal_pembelian = ?
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
        jumlah || null,
        data.jumlah_total || jumlah || null,
        harga_aset || null,
        tanggal_pembelian || null,
        id,
      ]
    );

    return result.affectedRows;
  },

  // UPDATE kondisi aset (patch)
  updateKondisi: async (id, kondisi) => {
    const [result] = await db.query(
      "UPDATE assets SET kondisi = ? WHERE id = ?",
      [kondisi, id]
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
