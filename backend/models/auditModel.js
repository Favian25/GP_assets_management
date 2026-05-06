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
      `SELECT * FROM audit_logs ORDER BY created_at DESC`
    );
    return rows;
  },
  
  getWithPaginationAndSearch: async (page = 1, limit = 10, search = "", dateStart = "", dateEnd = "") => {
    const offset = (page - 1) * limit;
    let query = "SELECT * FROM audit_logs";
    let countQuery = "SELECT COUNT(*) as total FROM audit_logs";
    const queryParams = [];
    const countParams = [];
    let whereClauses = [];

    if (search) {
      whereClauses.push(`(action LIKE ? OR entity_type LIKE ? OR user_name LIKE ? OR details LIKE ?)`);
      const searchStr = `%${search}%`;
      queryParams.push(searchStr, searchStr, searchStr, searchStr);
      countParams.push(searchStr, searchStr, searchStr, searchStr);
    }

    if (dateStart && dateEnd) {
      whereClauses.push(`(DATE(created_at) BETWEEN ? AND ?)`);
      queryParams.push(dateStart, dateEnd);
      countParams.push(dateStart, dateEnd);
    }

    if (whereClauses.length > 0) {
      const whereStr = " WHERE " + whereClauses.join(" AND ");
      query += whereStr;
      countQuery += whereStr;
    }

    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
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
