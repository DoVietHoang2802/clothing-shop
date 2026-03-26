/**
 * Order SSE Controller - Real-time order status updates
 * Fallback cho production khi Socket.io không hoạt động (Vercel serverless)
 */

const Order = require('../models/Order');

// SSE clients map - lưu theo userId
const sseClients = new Map();

// SSE Endpoint - Real-time order updates
// @route   GET /api/orders/sse
// @access  Private
const orderSSEHandler = async (req, res, next) => {
  const userId = req.user.id;
  const userRole = req.user.role;

  // Set headers cho SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.flushHeaders();

  // Lưu connection vào Map
  sseClients.set(userId, res);

  // Gửi heartbeat để giữ kết nối
  const heartbeatInterval = setInterval(() => {
    try {
      res.write(': heartbeat\n\n');
    } catch (e) {
      clearInterval(heartbeatInterval);
      sseClients.delete(userId);
    }
  }, 25000);

  // Gửi event khởi tạo
  res.write(`data: ${JSON.stringify({ type: 'connected', userId })}\n\n`);

  // Cleanup khi client disconnect
  req.on('close', () => {
    clearInterval(heartbeatInterval);
    sseClients.delete(userId);
  });
};

// Hàm broadcast cập nhật đơn hàng tới user
const broadcastOrderUpdate = async (orderId, oldStatus, newStatus) => {
  try {
    // Lấy thông tin đơn hàng đầy đủ
    const order = await Order.findById(orderId)
      .populate('user', 'name email')
      .populate('items.product', 'name price image');

    if (!order) return;

    const userId = order.user._id.toString();
    const res = sseClients.get(userId);

    const statusLabels = {
      PENDING: 'Chờ xác nhận',
      CONFIRMED: 'Đã xác nhận',
      SHIPPED: 'Đã giao ĐVVC',
      DELIVERING: 'Đang giao',
      ARRIVED: 'Đã đến nơi',
      PAID_TO_SHIPPER: 'Đã thanh toán',
      COMPLETED: 'Hoàn thành',
      CANCELLED: 'Đã hủy',
    };

    if (res) {
      const eventData = {
        type: 'ORDER_STATUS_CHANGED',
        orderId: order._id,
        oldStatus,
        newStatus,
        statusLabel: statusLabels[newStatus],
        order: order,
        message: `Đơn hàng #${order._id.toString().slice(-6).toUpperCase()} đã được cập nhật: ${statusLabels[newStatus]}`,
      };

      try {
        res.write(`data: ${JSON.stringify(eventData)}\n\n`);
      } catch (e) {
        sseClients.delete(userId);
      }
    }
  } catch (err) {
    console.error('Error broadcasting order update:', err);
  }
};

module.exports = {
  orderSSEHandler,
  broadcastOrderUpdate,
};
