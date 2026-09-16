const db = require('../config/db');

// Helper function to format date for MySQL (YYYY-MM-DD)
const formatDate = (dateInput) => {
  if (!dateInput) return null;
  if (typeof dateInput === 'string') {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return dateInput; // Return as-is if invalid
    return date.toISOString().split('T')[0]; // Get YYYY-MM-DD part
  }
  return dateInput;
};

const Pegawai = {
  getAll: async () => {
    const [rows] = await db.query(
      'SELECT * FROM tbl_pegawai ORDER BY nama_lengkap ASC'
    );
    return rows;
  },

  getById: async (id) => {
    const [rows] = await db.query('SELECT * FROM tbl_pegawai WHERE id = ?', [id]);
    return rows[0];
  },

  create: async (data) => {
    const { nama_lengkap, tempat_lahir, tanggal_lahir, alamat, email, nomor_hp } = data;
    const [result] = await db.query(
      'INSERT INTO tbl_pegawai (nama_lengkap, tempat_lahir, tanggal_lahir, alamat, email, nomor_hp) VALUES (?, ?, ?, ?, ?, ?)',
      [nama_lengkap, tempat_lahir || null, formatDate(tanggal_lahir) || null, alamat || null, email || null, nomor_hp || null]
    );
    return result;
  },

  update: async (id, data) => {
    const fields = [];
    const values = [];
    if (data.nama_lengkap) { fields.push('nama_lengkap = ?'); values.push(data.nama_lengkap); }
    if (data.tempat_lahir !== undefined) { fields.push('tempat_lahir = ?'); values.push(data.tempat_lahir || null); }
    if (data.tanggal_lahir !== undefined) { fields.push('tanggal_lahir = ?'); values.push(formatDate(data.tanggal_lahir) || null); }
    if (data.alamat !== undefined) { fields.push('alamat = ?'); values.push(data.alamat || null); }
    if (data.email !== undefined) { fields.push('email = ?'); values.push(data.email || null); }
    if (data.nomor_hp !== undefined) { fields.push('nomor_hp = ?'); values.push(data.nomor_hp || null); }
    if (fields.length === 0) return 0;
    values.push(id);
    const [result] = await db.query(`UPDATE tbl_pegawai SET ${fields.join(', ')} WHERE id = ?`, values);
    return result.affectedRows;
  },

  delete: async (id) => {
    const [result] = await db.query('DELETE FROM tbl_pegawai WHERE id = ?', [id]);
    return result.affectedRows;
  },

  // Get pegawai by email
  getByEmail: async (email) => {
    const [rows] = await db.query('SELECT * FROM tbl_pegawai WHERE email = ?', [email]);
    return rows[0];
  },

  // Get pegawai with specific role (join with users table)
  getByRole: async (role) => {
    const [rows] = await db.query(
      `SELECT DISTINCT p.id, p.nama_lengkap, p.email, p.nomor_hp, p.tempat_lahir,
              p.tanggal_lahir, p.alamat, u.role
       FROM tbl_pegawai p
       LEFT JOIN users u ON p.id = u.pegawai_id
       WHERE u.role = ? AND u.is_active = 1
       ORDER BY p.nama_lengkap ASC`,
      [role]
    );
    return rows;
  },

  // Get approvers (pegawai with supervisor, admin, or super admin role)
  getApprovers: async () => {
    const [rows] = await db.query(
      `SELECT DISTINCT p.id, p.nama_lengkap, p.email, p.nomor_hp, u.role
       FROM tbl_pegawai p
       INNER JOIN users u ON p.id = u.pegawai_id
       WHERE u.role IN ('supervisor', 'admin', 'super admin') AND u.is_active = 1
       ORDER BY p.nama_lengkap ASC`
    );
    return rows;
  },

  // Get active pegawai (pegawai linked to active users)
  getActive: async () => {
    const [rows] = await db.query(
      `SELECT DISTINCT p.id, p.nama_lengkap, p.email, p.nomor_hp, p.tempat_lahir,
              p.tanggal_lahir, p.alamat, u.role
       FROM tbl_pegawai p
       INNER JOIN users u ON p.id = u.pegawai_id
       WHERE u.is_active = 1
       ORDER BY p.nama_lengkap ASC`
    );
    return rows;
  },

  // Get all pegawai (including those without user accounts)
  getAllWithUserStatus: async () => {
    const [rows] = await db.query(
      `SELECT p.id, p.nama_lengkap, p.email, p.nomor_hp, p.tempat_lahir,
              p.tanggal_lahir, p.alamat, p.created_at, p.updated_at,
              u.id as user_id, u.role, u.is_active
       FROM tbl_pegawai p
       LEFT JOIN users u ON p.id = u.pegawai_id
       ORDER BY p.nama_lengkap ASC`
    );
    return rows;
  }
};

module.exports = Pegawai;
