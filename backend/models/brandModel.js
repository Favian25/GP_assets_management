const db = require("../config/db");

const Brand = {
  getAll: async () => {
    const [rows] = await db.query("SELECT * FROM brands ORDER BY nama ASC");
    return rows;
  },

  findByNama: async (nama) => {
    const [rows] = await db.query("SELECT * FROM brands WHERE nama = ?", [nama]);
    return rows[0];
  },

  create: async (nama) => {
    const [result] = await db.query(
      "INSERT INTO brands (nama) VALUES (?)",
      [nama]
    );
    return { id: result.insertId, nama };
  },

  delete: async (id) => {
    const [result] = await db.query("DELETE FROM brands WHERE id = ?", [id]);
    return result.affectedRows;
  },
};

module.exports = Brand;
