const db = require("../config/db");

const Category = {
  getAll: async () => {
    const [rows] = await db.query("SELECT * FROM categories ORDER BY nama ASC");
    return rows;
  },

  findByNama: async (nama) => {
    const [rows] = await db.query("SELECT * FROM categories WHERE nama = ?", [nama]);
    return rows[0];
  },

  create: async (nama, kodeSingkat) => {
    const [result] = await db.query(
      "INSERT INTO categories (nama, kode_singkat) VALUES (?, ?)",
      [nama, kodeSingkat.toUpperCase()]
    );
    return { id: result.insertId, nama, kode_singkat: kodeSingkat.toUpperCase() };
  },

  delete: async (id) => {
    const [result] = await db.query("DELETE FROM categories WHERE id = ?", [id]);
    return result.affectedRows;
  },
};

module.exports = Category;
