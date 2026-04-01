const express = require('express');
const {
  getNotifications,
  getNotificationById,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteReadNotifications,
} = require('../controllers/notificationController');
const { verifyToken } = require('../middlewares/auth');

const router = express.Router();

// GET /api/notifications - Lấy tất cả thông báo
router.get('/', verifyToken, getNotifications);

// GET /api/notifications/unread-count - Lấy số thông báo chưa đọc
router.get('/unread-count', verifyToken, getUnreadCount);

// PUT /api/notifications/read-all - Đánh dấu đã đọc tất cả
router.put('/read-all', verifyToken, markAllAsRead);

// DELETE /api/notifications/read - Xóa tất cả thông báo đã đọc
router.delete('/read', verifyToken, deleteReadNotifications);

// GET /api/notifications/:id - Lấy 1 thông báo (sau các route đặc biệt)
router.get('/:id', verifyToken, getNotificationById);

// PUT /api/notifications/:id/read - Đánh dấu đã đọc
router.put('/:id/read', verifyToken, markAsRead);

// DELETE /api/notifications/:id - Xóa thông báo
router.delete('/:id', verifyToken, deleteNotification);

module.exports = router;
