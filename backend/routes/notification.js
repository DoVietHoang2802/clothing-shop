const express = require('express');
const {
  notificationSSEHandler,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteReadNotifications,
} = require('../controllers/notificationController');
const { verifyToken } = require('../middlewares/auth');

const router = express.Router();

// GET /api/notifications/sse - SSE endpoint cho notifications (PRIVATE - trước /:id)
router.get('/sse', verifyToken, notificationSSEHandler);

// GET /api/notifications - Lấy tất cả thông báo
router.get('/', verifyToken, getNotifications);

// GET /api/notifications/unread-count - Lấy số thông báo chưa đọc
router.get('/unread-count', verifyToken, getUnreadCount);

// PUT /api/notifications/read-all - Đánh dấu đã đọc tất cả
router.put('/read-all', verifyToken, markAllAsRead);

// DELETE /api/notifications/read - Xóa tất cả thông báo đã đọc
router.delete('/read', verifyToken, deleteReadNotifications);

// GET /api/notifications/:id - Lấy 1 thông báo (sau các route đặc biệt)
router.get('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const notification = await require('../models/Notification').findOne({ _id: id, user: userId });

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Thông báo không tìm thấy',
      data: null,
    });
  }

  res.status(200).json({
    success: true,
    message: 'Lấy thông báo thành công',
    data: notification,
  });
});

// PUT /api/notifications/:id/read - Đánh dấu đã đọc
router.put('/:id/read', verifyToken, markAsRead);

// DELETE /api/notifications/:id - Xóa thông báo
router.delete('/:id', verifyToken, deleteNotification);

module.exports = router;
