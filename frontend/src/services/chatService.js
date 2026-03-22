import api from './api';

const chatService = {
  // Gửi tin nhắn text
  sendMessage: (receiverId, content) => {
    return api.post('/chat/send', { receiverId, content });
  },

  // Gửi tin nhắn với ảnh
  sendImageMessage: (receiverId, imageBase64, content = '') => {
    return api.post('/chat/send', {
      receiverId,
      content,
      image: imageBase64,
      messageType: 'image'
    });
  },

  // Lấy tin nhắn với một người
  getMessages: (userId, limit = 50, before = null) => {
    return api.get(`/chat/${userId}`, { params: { limit, before } });
  },

  // Lấy danh sách cuộc trò chuyện
  getConversations: () => {
    return api.get('/chat/conversations/all');
  },

  // Lấy danh sách admin/staff để chat
  getChatUsers: () => {
    return api.get('/chat/users/list');
  },

  // Đánh dấu tin nhắn đã đọc
  markAsRead: (userId) => {
    return api.put(`/chat/read/${userId}`);
  },

  // Lấy số tin nhắn chưa đọc
  getUnreadCount: () => {
    return api.get('/chat/unread/count');
  },
};

export default chatService;
