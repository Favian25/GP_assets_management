const db = require('../config/db');

const Notification = {
  create: async ({ type, message, referenceId, targetRoles }) => {
    const [result] = await db.query(
      'INSERT INTO notifications (type, message, reference_id, target_roles, is_read, created_at) VALUES (?, ?, ?, ?, 0, NOW())',
      [type, message, referenceId || null, targetRoles]
    );
    return result;
  },

  getByRole: async (role) => {
    const [rows] = await db.query(
      `SELECT * FROM notifications 
       WHERE FIND_IN_SET(?, target_roles) > 0 
       ORDER BY created_at DESC 
       LIMIT 20`,
      [role]
    );
    return rows;
  },

  getUnreadCountByRole: async (role) => {
    const [rows] = await db.query(
      `SELECT COUNT(*) as count FROM notifications 
       WHERE FIND_IN_SET(?, target_roles) > 0 AND is_read = 0`,
      [role]
    );
    return rows[0].count;
  },

  markAsRead: async (id) => {
    await db.query('UPDATE notifications SET is_read = 1 WHERE id = ?', [id]);
  },

  markAllAsReadByRole: async (role) => {
    await db.query(
      `UPDATE notifications SET is_read = 1 
       WHERE FIND_IN_SET(?, target_roles) > 0 AND is_read = 0`,
      [role]
    );
  },
};

module.exports = Notification;
