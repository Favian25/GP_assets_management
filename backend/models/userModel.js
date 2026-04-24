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
    const [rows] = await db.query('SELECT id, nama_lengkap, email, role, foto_profil, created_at, updated_at FROM users WHERE id = ?', [id]);
    return rows[0];
  },

  getAll: async () => {
    const [rows] = await db.query('SELECT id, nama_lengkap, email, role, foto_profil, created_at, updated_at FROM users ORDER BY created_at DESC');
    return rows;
  },

  updateRole: async (id, role) => {
    const [result] = await db.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
    return result.affectedRows;
  },

  delete: async (id) => {
    const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows;
  },

  // Find by ID with password (for auth checks)
  findByIdFull: async (id) => {
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
  },

  // Update user by admin/super admin (nama, password, role, foto_profil)
  update: async (id, data) => {
    const fields = [];
    const values = [];

    if (data.nama_lengkap) { fields.push('nama_lengkap = ?'); values.push(data.nama_lengkap); }
    if (data.password) { fields.push('password = ?'); values.push(data.password); }
    if (data.role) { fields.push('role = ?'); values.push(data.role); }
    if (data.foto_profil !== undefined) { fields.push('foto_profil = ?'); values.push(data.foto_profil); }

    if (fields.length === 0) return 0;

    values.push(id);
    const [result] = await db.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
    return result.affectedRows;
  },

  // Self-update profile (nama + foto only)
  updateProfile: async (id, data) => {
    const fields = [];
    const values = [];

    if (data.nama_lengkap) { fields.push('nama_lengkap = ?'); values.push(data.nama_lengkap); }
    if (data.foto_profil !== undefined) { fields.push('foto_profil = ?'); values.push(data.foto_profil); }

    if (fields.length === 0) return 0;

    values.push(id);
    const [result] = await db.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
    return result.affectedRows;
  }
};

module.exports = User;
