const db = require('../config/db');

const User = {
  findByEmail: async (email) => {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  },

  create: async (userData) => {
    const { namaLengkap, email, password, role = 'user', pegawaiId = null, nomorHp = null, keterangan = null } = userData;
    const [result] = await db.query(
      'INSERT INTO users (pegawai_id, nama_lengkap, email, password, role, nomor_hp, keterangan) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [pegawaiId, namaLengkap, email, password, role, nomorHp, keterangan]
    );
    return result;
  },
  
  findById: async (id) => {
    const [rows] = await db.query(
      `SELECT u.id, u.pegawai_id, u.nama_lengkap, u.email, u.role, u.foto_profil, u.is_active,
              u.nomor_hp as user_nomor_hp, u.keterangan,
              u.created_at, u.updated_at,
              p.nomor_hp as pegawai_nomor_hp, p.tempat_lahir, p.tanggal_lahir, p.alamat
       FROM users u
       LEFT JOIN tbl_pegawai p ON u.pegawai_id = p.id
       WHERE u.id = ?`,
      [id]
    );
    return rows[0];
  },

  getAll: async () => {
    const [rows] = await db.query(
      `SELECT u.id, u.pegawai_id, u.nama_lengkap, u.email, u.role, u.foto_profil, u.is_active,
              u.nomor_hp as user_nomor_hp, u.keterangan,
              u.created_at, u.updated_at,
              p.nomor_hp as pegawai_nomor_hp
       FROM users u
       LEFT JOIN tbl_pegawai p ON u.pegawai_id = p.id
       ORDER BY u.created_at DESC`
    );
    return rows;
  },

  updateRole: async (id, role) => {
    const [result] = await db.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
    return result.affectedRows;
  },

  // Toggle active/inactive
  toggleActive: async (id) => {
    const [result] = await db.query(
      'UPDATE users SET is_active = NOT is_active WHERE id = ?',
      [id]
    );
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

  // Update user by admin/super admin (nama, password, role, foto_profil, nomor_hp, keterangan)
  update: async (id, data) => {
    const fields = [];
    const values = [];

    if (data.nama_lengkap) { fields.push('nama_lengkap = ?'); values.push(data.nama_lengkap); }
    if (data.password) { fields.push('password = ?'); values.push(data.password); }
    if (data.role) { fields.push('role = ?'); values.push(data.role); }
    if (data.foto_profil !== undefined) { fields.push('foto_profil = ?'); values.push(data.foto_profil); }
    if (data.pegawai_id !== undefined) { fields.push('pegawai_id = ?'); values.push(data.pegawai_id); }
    if (data.nomor_hp !== undefined) { fields.push('nomor_hp = ?'); values.push(data.nomor_hp); }
    if (data.keterangan !== undefined) { fields.push('keterangan = ?'); values.push(data.keterangan); }

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
  },

  // Get users by role
  getByRole: async (role) => {
    const [rows] = await db.query(
      `SELECT u.id, u.pegawai_id, u.nama_lengkap, u.email, u.role, u.foto_profil, u.is_active,
              u.nomor_hp as user_nomor_hp, u.keterangan,
              u.created_at, u.updated_at,
              p.nomor_hp as pegawai_nomor_hp, p.tempat_lahir, p.tanggal_lahir, p.alamat
       FROM users u
       LEFT JOIN tbl_pegawai p ON u.pegawai_id = p.id
       WHERE u.role = ? AND u.is_active = 1
       ORDER BY u.nama_lengkap ASC`,
      [role]
    );
    return rows;
  },

  // Get all active users
  getActiveUsers: async () => {
    const [rows] = await db.query(
      `SELECT u.id, u.pegawai_id, u.nama_lengkap, u.email, u.role, u.foto_profil, u.is_active,
              u.nomor_hp as user_nomor_hp, u.keterangan,
              u.created_at, u.updated_at,
              p.nomor_hp as pegawai_nomor_hp, p.tempat_lahir, p.tanggal_lahir, p.alamat
       FROM users u
       LEFT JOIN tbl_pegawai p ON u.pegawai_id = p.id
       WHERE u.is_active = 1
       ORDER BY u.nama_lengkap ASC`
    );
    return rows;
  },

  // Get users with pagination
  getAllWithPagination: async (page = 1, limit = 10, role = null) => {
    const offset = (page - 1) * limit;

    let query = `SELECT u.id, u.pegawai_id, u.nama_lengkap, u.email, u.role, u.foto_profil, u.is_active,
                        u.nomor_hp as user_nomor_hp, u.keterangan,
                        u.created_at, u.updated_at,
                        p.nomor_hp as pegawai_nomor_hp
                 FROM users u
                 LEFT JOIN tbl_pegawai p ON u.pegawai_id = p.id`;

    const params = [];

    if (role) {
      query += ' WHERE u.role = ?';
      params.push(role);
    }

    query += ' ORDER BY u.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await db.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM users u';
    const countParams = [];

    if (role) {
      countQuery += ' WHERE u.role = ?';
      countParams.push(role);
    }

    const [countResult] = await db.query(countQuery, countParams);
    const total = countResult[0].total;

    return {
      data: rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  },

  // Get current user profile with pegawai data
  getMyProfile: async (id) => {
    const [rows] = await db.query(
      `SELECT u.id, u.pegawai_id, u.nama_lengkap, u.email, u.role, u.foto_profil, u.is_active,
              u.nomor_hp as user_nomor_hp, u.keterangan,
              u.created_at, u.updated_at,
              p.id as pegawai_id_from_pegawai, p.nama_lengkap as pegawai_nama, p.tempat_lahir,
              p.tanggal_lahir, p.alamat, p.nomor_hp as pegawai_nomor_hp, p.email as pegawai_email
       FROM users u
       LEFT JOIN tbl_pegawai p ON u.pegawai_id = p.id
       WHERE u.id = ?`,
      [id]
    );
    return rows[0];
  }
};

module.exports = User;
