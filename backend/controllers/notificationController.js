const Notification = require('../models/notificationModel');

const notificationController = {
  // GET notifikasi berdasarkan role user (dari JWT)
  getNotifications: async (req, res) => {
    try {
      const role = req.user.role;
      const userName = req.user.nama;
      const data = await Notification.getByRole(role, userName);
      const unreadCount = await Notification.getUnreadCountByRole(role, userName);
      res.status(200).json({ success: true, data, unreadCount });
    } catch (error) {
      console.error('Error get notifications:', error);
      res.status(500).json({ success: false, message: 'Server Error' });
    }
  },

  // Mark satu notifikasi as read
  markAsRead: async (req, res) => {
    try {
      await Notification.markAsRead(req.params.id);
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error mark as read:', error);
      res.status(500).json({ success: false, message: 'Server Error' });
    }
  },

  // Mark semua notifikasi as read berdasarkan role
  markAllAsRead: async (req, res) => {
    try {
      const role = req.user.role;
      await Notification.markAllAsReadByRole(role);
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error mark all as read:', error);
      res.status(500).json({ success: false, message: 'Server Error' });
    }
  },
};

module.exports = notificationController;
