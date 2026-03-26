import api from './api';

const notificationService = {
  // Lấy tất cả thông báo
  getNotifications: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.unreadOnly) queryParams.append('unreadOnly', params.unreadOnly);

    const url = `/notifications${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return api.get(url);
  },

  // Lấy số thông báo chưa đọc
  getUnreadCount: () => {
    return api.get('/notifications/unread-count');
  },

  // Đánh dấu đã đọc 1 thông báo
  markAsRead: (id) => {
    return api.put(`/notifications/${id}/read`);
  },

  // Đánh dấu đã đọc tất cả
  markAllAsRead: () => {
    return api.put('/notifications/read-all');
  },

  // Xóa thông báo
  deleteNotification: (id) => {
    return api.delete(`/notifications/${id}`);
  },

  // Xóa tất cả thông báo đã đọc
  deleteReadNotifications: () => {
    return api.delete('/notifications/read');
  },
};

export default notificationService;
