const express = require('express');
const {
  sendMessage,
  getMessages,
  getConversations,
  getChatUsers,
  markAsRead,
  getUnreadCount,
} = require('../controllers/chatController');
const { verifyToken } = require('../middlewares/auth');

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Gửi tin nhắn
router.post('/send', sendMessage);

// Lấy tin nhắn với một người
router.get('/:userId', getMessages);

// Lấy danh sách cuộc trò chuyện
router.get('/conversations/all', getConversations);

// Lấy danh sách admin/staff để chat
router.get('/users/list', getChatUsers);

// Đánh dấu đã đọc
router.put('/read/:userId', markAsRead);

// Lấy số tin nhắn chưa đọc
router.get('/unread/count', getUnreadCount);

module.exports = router;
