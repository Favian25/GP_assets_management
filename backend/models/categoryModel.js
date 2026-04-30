const db = require("../config/db");

const Category = {
  getAll: async () => {
    const [rows] = await db.query(`
      SELECT c.*, 
             CASE 
               WHEN c.tipe = 'aset' THEN (SELECT COUNT(*) FROM assets a WHERE a.kategori = c.nama)
               WHEN c.tipe = 'aksesoris' THEN (SELECT COUNT(*) FROM aksesoris ak WHERE ak.kategori = c.nama)
               ELSE 0
             END AS qty
      FROM categories c 
      ORDER BY c.nama ASC
    `);
    return rows;
  },

  getByTipe: async (tipe) => {
    const [rows] = await db.query(`
      SELECT c.*, 
             CASE 
               WHEN c.tipe = 'aset' THEN (SELECT COUNT(*) FROM assets a WHERE a.kategori = c.nama)
               WHEN c.tipe = 'aksesoris' THEN (SELECT COUNT(*) FROM aksesoris ak WHERE ak.kategori = c.nama)
               ELSE 0
             END AS qty
      FROM categories c 
      WHERE c.tipe = ? 
      ORDER BY c.nama ASC
    `, [tipe]);
    return rows;
  },

  findById: async (id) => {
    const [rows] = await db.query("SELECT * FROM categories WHERE id = ?", [id]);
    return rows[0];
  },

  findByNama: async (nama, tipe = "aset") => {
    const [rows] = await db.query("SELECT * FROM categories WHERE nama = ? AND tipe = ?", [nama, tipe]);
    return rows[0];
  },

  create: async (nama, kodeSingkat, tipe = "aset") => {
    const [result] = await db.query(
      "INSERT INTO categories (nama, kode_singkat, tipe) VALUES (?, ?, ?)",
      [nama, kodeSingkat.toUpperCase(), tipe]
    );
    return { id: result.insertId, nama, kode_singkat: kodeSingkat.toUpperCase(), tipe };
  },

  delete: async (id) => {
    const [result] = await db.query("DELETE FROM categories WHERE id = ?", [id]);
    return result.affectedRows;
  },

  update: async (id, oldNama, nama, kodeSingkat, tipe) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      
      // Update the category itself
      await connection.query(
        "UPDATE categories SET nama = ?, kode_singkat = ? WHERE id = ?",
        [nama, kodeSingkat.toUpperCase(), id]
      );
      
      // Cascade update to referencing tables if name changed
      if (oldNama !== nama) {
        if (tipe === 'aset') {
          await connection.query("UPDATE assets SET kategori = ? WHERE kategori = ?", [nama, oldNama]);
        } else if (tipe === 'aksesoris') {
          await connection.query("UPDATE aksesoris SET kategori = ? WHERE kategori = ?", [nama, oldNama]);
        }
      }
      
      await connection.commit();
      return true;
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  },
};

module.exports = Category;
