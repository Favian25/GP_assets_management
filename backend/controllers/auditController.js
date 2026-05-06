const AuditLog = require('../models/auditModel');

const auditController = {
  getAll: async (req, res) => {
    try {
      const page = req.query.page || 1;
      const limit = req.query.limit || 50;
      const search = req.query.q || "";
      const dateStart = req.query.dateStart || "";
      const dateEnd = req.query.dateEnd || "";

      // If they want to export all without pagination
      if (req.query.all === 'true') {
        const data = await AuditLog.getAll();
        return res.status(200).json({ success: true, data });
      }

      const result = await AuditLog.getWithPaginationAndSearch(page, limit, search, dateStart, dateEnd);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      console.error("Error get audit logs:", error);
      res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
  }
};

module.exports = auditController;
