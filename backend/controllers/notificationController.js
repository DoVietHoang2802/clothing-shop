const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');

// SSE clients cho notification
const notificationClients = new Map();

// SSE endpoint cho notifications real-time
const notificationSSEHandler = async (req, res) => {
  const userId = req.user.id;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.flushHeaders();

  notificationClients.set(userId, res);

  // Heartbeat (15s thay vì 25s - tránh server kill connection)
  const heartbeatInterval = setInterval(() => {
    try {
      res.write(': heartbeat\n\n');
    } catch (e) {
      clearInterval(heartbeatInterval);
      notificationClients.delete(userId);
    }
  }, 15000);

  res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);

  req.on('close', () => {
    clearInterval(heartbeatInterval);
    notificationClients.delete(userId);
  });
};

// Broadcast notification tới user
const broadcastToUser = async (userId, notification) => {
  const res = notificationClients.get(userId.toString());
  if (res) {
    try {
      res.write(`data: ${JSON.stringify({ type: 'new_notification', notification })}\n\n`);
    } catch (e) {
      notificationClients.delete(userId.toString());
    }
  }
};

// Tạo thông báo (dùng trong các controller khác)
const createNotification = async ({ userId, type, title, message, link = null, data = null }) => {
  try {
    const notification = await Notification.create({
      user: userId,
      type,
      title,
      message,
      link,
      data,
    });

    // Broadcast real-time
    broadcastToUser(userId, notification);

    return notification;
  } catch (err) {
    console.error('Error creating notification:', err);
    return null;
  }
};

// @desc    Lấy tất cả thông báo của user
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 20, unreadOnly = false } = req.query;

  let query = { user: userId };

  // Filter thông báo hết hạn
  query.$or = [
    { expiresAt: null },
    { expiresAt: { $gt: new Date() } },
  ];

  if (unreadOnly === 'true') {
    query.isRead = false;
  }

  const notifications = await Notification.find(query)
    .sort({ createdAt: -1, isRead: 1 }) // Chưa đọc lên trước
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Notification.countDocuments(query);
  const unreadCount = await Notification.countDocuments({
    user: userId,
    isRead: false,
    $or: [
      { expiresAt: null },
      { expiresAt: { $gt: new Date() } },
    ],
  });

  res.status(200).json({
    success: true,
    message: 'Lấy thông báo thành công',
    data: notifications,
    unreadCount,
    pagination: {
      currentPage: page,
      pageSize: limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

// @desc    Lấy số thông báo chưa đọc
// @route   GET /api/notifications/unread-count
// @access  Private
const getUnreadCount = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const count = await Notification.countDocuments({
    user: userId,
    isRead: false,
    $or: [
      { expiresAt: null },
      { expiresAt: { $gt: new Date() } },
    ],
  });

  res.status(200).json({
    success: true,
    message: 'Lấy số thông báo chưa đọc thành công',
    data: { count },
  });
});

// @desc    Đánh dấu đã đọc 1 thông báo
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const notification = await Notification.findOne({ _id: id, user: userId });

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Thông báo không tìm thấy',
      data: null,
    });
  }

  notification.isRead = true;
  await notification.save();

  res.status(200).json({
    success: true,
    message: 'Đã đánh dấu đã đọc',
    data: notification,
  });
});

// @desc    Đánh dấu đã đọc tất cả
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  await Notification.updateMany(
    {
      user: userId,
      isRead: false,
      $or: [
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } },
      ],
    },
    { isRead: true }
  );

  res.status(200).json({
    success: true,
    message: 'Đã đánh dấu tất cả đã đọc',
    data: null,
  });
});

// @desc    Xóa thông báo
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const notification = await Notification.findOneAndDelete({ _id: id, user: userId });

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Thông báo không tìm thấy',
      data: null,
    });
  }

  res.status(200).json({
    success: true,
    message: 'Xóa thông báo thành công',
    data: null,
  });
});

// @desc    Xóa tất cả thông báo đã đọc
// @route   DELETE /api/notifications/read
// @access  Private
const deleteReadNotifications = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const result = await Notification.deleteMany({
    user: userId,
    isRead: true,
  });

  res.status(200).json({
    success: true,
    message: `Đã xóa ${result.deletedCount} thông báo đã đọc`,
    data: { deletedCount: result.deletedCount },
  });
});

module.exports = {
  notificationSSEHandler,
  createNotification,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteReadNotifications,
};
