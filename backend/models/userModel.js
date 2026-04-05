const db = require('../config/db');

const User = {
  findByEmail: async (email) => {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  },

  create: async (userData) => {
    const { namaLengkap, email, password, role = 'user' } = userData;
    const [result] = await db.query(
      'INSERT INTO users (nama_lengkap, email, password, role) VALUES (?, ?, ?, ?)',
      [namaLengkap, email, password, role]
    );
    return result;
  },
  
  findById: async (id) => {
    const [rows] = await db.query('SELECT id, nama_lengkap, email, role, created_at, updated_at FROM users WHERE id = ?', [id]);
    return rows[0];
  },

  getAll: async () => {
    const [rows] = await db.query('SELECT id, nama_lengkap, email, role, created_at, updated_at FROM users ORDER BY created_at DESC');
    return rows;
  },

  updateRole: async (id, role) => {
    const [result] = await db.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
    return result.affectedRows;
  },

  delete: async (id) => {
    const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows;
  }
};

module.exports = User;
