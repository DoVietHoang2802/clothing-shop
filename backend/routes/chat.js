const express = require('express');
const {
  sendMessage,
  getMessages,
  getConversations,
  getChatUsers,
  markAsRead,
  getUnreadCount,
  deleteMessage,
  deleteConversation,
  sseHandler,
} = require('../controllers/chatController');
const { verifyToken } = require('../middlewares/auth');

const router = express.Router();

// SSE - Real-time chat (verifyToken đã hỗ trợ query param)
router.get('/sse', verifyToken, sseHandler);

// All other routes require authentication
router.use(verifyToken);

// Gửi tin nhắn
router.post('/send', sendMessage);

// Lấy danh sách cuộc trò chuyện (PHẢI ĐỂ TRƯỚC /:userId)
router.get('/conversations/all', getConversations);

// Lấy danh sách admin/staff để chat
router.get('/users/list', getChatUsers);

// Lấy tin nhắn với một người
router.get('/:userId', getMessages);

// Đánh dấu đã đọc
router.put('/read/:userId', markAsRead);

// Lấy số tin nhắn chưa đọc
router.get('/unread/count', getUnreadCount);

// Xóa tin nhắn
router.delete('/message/:id', deleteMessage);

// Xóa toàn bộ cuộc trò chuyện (PHẢI ĐỂ TRƯỚC /:userId)
router.delete('/conversation/:userId', deleteConversation);

module.exports = router;
