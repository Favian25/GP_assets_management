const db = require('../config/db');

const AuditLog = {
  create: async ({ userId, userName, action, entityType, entityId, details }) => {
    try {
      const [result] = await db.query(
        'INSERT INTO audit_logs (user_id, user_name, action, entity_type, entity_id, details, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
        [userId || null, userName || null, action, entityType, entityId || null, details || null]
      );
      return result;
    } catch (error) {
      console.error("Error creating audit log:", error);
      // We don't want audit log errors to break the main application flow
      return null;
    }
  },

  getAll: async () => {
    const [rows] = await db.query(
      `SELECT al.*,
        CASE 
          WHEN al.entity_type = 'Aset' THEN (SELECT CONCAT(a.nama_aset, ' (', a.kode_aset, ')') FROM assets a WHERE a.id = al.entity_id)
          WHEN al.entity_type = 'Aksesoris' THEN (SELECT CONCAT(ak.nama_aksesoris, ' (', ak.kode_aksesoris, ')') FROM aksesoris ak WHERE ak.id = al.entity_id)
          WHEN al.entity_type = 'Peminjaman' THEN (SELECT CONCAT(p.kode_pinjam, ' - ', p.nama_peminjam) FROM peminjaman p WHERE p.id = al.entity_id)
          ELSE CONCAT('#', al.entity_id)
        END AS entity_name
       FROM audit_logs al ORDER BY al.created_at DESC`
    );
    return rows;
  },
  
  getWithPaginationAndSearch: async (page = 1, limit = 10, search = "", dateStart = "", dateEnd = "") => {
    const offset = (page - 1) * limit;
    let query = `SELECT al.*,
        CASE 
          WHEN al.entity_type = 'Aset' THEN (SELECT CONCAT(a.nama_aset, ' (', a.kode_aset, ')') FROM assets a WHERE a.id = al.entity_id)
          WHEN al.entity_type = 'Aksesoris' THEN (SELECT CONCAT(ak.nama_aksesoris, ' (', ak.kode_aksesoris, ')') FROM aksesoris ak WHERE ak.id = al.entity_id)
          WHEN al.entity_type = 'Peminjaman' THEN (SELECT CONCAT(p.kode_pinjam, ' - ', p.nama_peminjam) FROM peminjaman p WHERE p.id = al.entity_id)
          ELSE CONCAT('#', al.entity_id)
        END AS entity_name
       FROM audit_logs al`;
    let countQuery = "SELECT COUNT(*) as total FROM audit_logs al";
    const queryParams = [];
    const countParams = [];
    let whereClauses = [];

    if (search) {
      whereClauses.push(`(al.action LIKE ? OR al.entity_type LIKE ? OR al.user_name LIKE ? OR al.details LIKE ?)`);
      const searchStr = `%${search}%`;
      queryParams.push(searchStr, searchStr, searchStr, searchStr);
      countParams.push(searchStr, searchStr, searchStr, searchStr);
    }

    if (dateStart && dateEnd) {
      whereClauses.push(`(DATE(al.created_at) BETWEEN ? AND ?)`);
      queryParams.push(dateStart, dateEnd);
      countParams.push(dateStart, dateEnd);
    }

    if (whereClauses.length > 0) {
      const whereStr = " WHERE " + whereClauses.join(" AND ");
      query += whereStr;
      countQuery += whereStr;
    }

    query += " ORDER BY al.created_at DESC LIMIT ? OFFSET ?";
    queryParams.push(Number(limit), Number(offset));

    const [rows] = await db.query(query, queryParams);
    const [countRows] = await db.query(countQuery, countParams);

    return {
      data: rows,
      total: countRows[0].total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(countRows[0].total / limit)
    };
  }
};

module.exports = AuditLog;
