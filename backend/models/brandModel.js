const db = require("../config/db");

const Brand = {
  getAll: async () => {
    const [rows] = await db.query(`
      SELECT b.*, 
             CASE 
               WHEN b.tipe = 'aset' THEN (SELECT COUNT(*) FROM assets a WHERE a.merek = b.nama)
               WHEN b.tipe = 'aksesoris' THEN (SELECT COUNT(*) FROM aksesoris ak WHERE ak.merek = b.nama)
               ELSE 0
             END AS qty
      FROM brands b 
      ORDER BY b.nama ASC
    `);
    return rows;
  },

  getByTipe: async (tipe) => {
    const [rows] = await db.query(`
      SELECT b.*, 
             CASE 
               WHEN b.tipe = 'aset' THEN (SELECT COUNT(*) FROM assets a WHERE a.merek = b.nama)
               WHEN b.tipe = 'aksesoris' THEN (SELECT COUNT(*) FROM aksesoris ak WHERE ak.merek = b.nama)
               ELSE 0
             END AS qty
      FROM brands b 
      WHERE b.tipe = ? 
      ORDER BY b.nama ASC
    `, [tipe]);
    return rows;
  },

  findById: async (id) => {
    const [rows] = await db.query("SELECT * FROM brands WHERE id = ?", [id]);
    return rows[0];
  },

  findByNama: async (nama, tipe = "aset") => {
    const [rows] = await db.query("SELECT * FROM brands WHERE nama = ? AND tipe = ?", [nama, tipe]);
    return rows[0];
  },

  create: async (nama, tipe = "aset") => {
    const [result] = await db.query(
      "INSERT INTO brands (nama, tipe) VALUES (?, ?)",
      [nama, tipe]
    );
    return { id: result.insertId, nama, tipe };
  },

  delete: async (id) => {
    const [result] = await db.query("DELETE FROM brands WHERE id = ?", [id]);
    return result.affectedRows;
  },

  update: async (id, oldNama, nama, tipe) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      
      await connection.query("UPDATE brands SET nama = ? WHERE id = ?", [nama, id]);
      
      if (oldNama !== nama) {
        if (tipe === 'aset') {
          await connection.query("UPDATE assets SET merek = ? WHERE merek = ?", [nama, oldNama]);
        } else if (tipe === 'aksesoris') {
          await connection.query("UPDATE aksesoris SET merek = ? WHERE merek = ?", [nama, oldNama]);
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

module.exports = Brand;
