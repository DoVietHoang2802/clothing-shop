const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: [
      'ORDER_STATUS',      // Cập nhật trạng thái đơn hàng
      'ORDER_CANCELLED',   // Đơn hàng bị hủy
      'PROMOTION',         // Khuyến mãi
      'REVIEW_REQUEST',    // Yêu cầu đánh giá
      'SYSTEM',            // Thông báo hệ thống
      'CHAT',              // Tin nhắn mới
    ],
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  link: {
    type: String,
    default: null, // Link đến trang liên quan (VD: /my-orders)
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: null, // Lưu data bổ sung (VD: orderId, productId)
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    default: null, // Thông báo hết hạn sau thời gian này
  },
});

// Index để query nhanh hơn
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
