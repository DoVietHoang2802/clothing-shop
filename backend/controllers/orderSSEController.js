/**
 * Order SSE Controller - Real-time order status updates
 * Fallback cho production khi Socket.io không hoạt động (Vercel serverless)
 */

const Order = require('../models/Order');

// SSE clients map - lưu theo userId với thông tin role
// Format: Map<userId, { res, role }>
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

  // Lưu connection vào Map với role
  sseClients.set(userId, { res, role: userRole });

  // Gửi heartbeat để giữ kết nối (15s thay vì 25s - tránh Render kill)
  const heartbeatInterval = setInterval(() => {
    try {
      res.write(': heartbeat\n\n');
    } catch (e) {
      clearInterval(heartbeatInterval);
      sseClients.delete(userId);
    }
  }, 15000);

  // Gửi event khởi tạo
  res.write(`data: ${JSON.stringify({ type: 'connected', userId })}\n\n`);

  // Cleanup khi client disconnect
  req.on('close', () => {
    clearInterval(heartbeatInterval);
    sseClients.delete(userId);
  });
};

// Labels cho status
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

// Gửi event tới một client
const sendToClient = (userId, eventData) => {
  const client = sseClients.get(userId);
  if (client) {
    try {
      client.res.write(`data: ${JSON.stringify(eventData)}\n\n`);
    } catch (e) {
      sseClients.delete(userId);
    }
  }
};

// Gửi event tới tất cả admin đang kết nối
const sendToAllAdmins = (eventData) => {
  for (const [userId, client] of sseClients.entries()) {
    if (client.role === 'ADMIN' || client.role === 'STAFF') {
      try {
        client.res.write(`data: ${JSON.stringify(eventData)}\n\n`);
      } catch (e) {
        sseClients.delete(userId);
      }
    }
  }
};

// Hàm broadcast đơn hàng mới cho tất cả admin
const broadcastNewOrder = async (order) => {
  try {
    const orderIdShort = order._id.toString().slice(-6).toUpperCase();
    const eventData = {
      type: 'NEW_ORDER',
      orderId: order._id,
      order: order,
      message: `📦 Đơn hàng mới #${orderIdShort} từ ${order.user?.name || 'Khách hàng'}`,
    };

    // Gửi tới tất cả admin
    sendToAllAdmins(eventData);
  } catch (err) {
    console.error('Error broadcasting new order:', err);
  }
};

// Hàm broadcast cập nhật đơn hàng - gửi cho user VÀ admin
// Nhận order đã populate sẵn để tránh query lại DB
const broadcastOrderUpdate = (order, oldStatus, newStatus) => {
  try {
    const eventData = {
      type: 'ORDER_STATUS_CHANGED',
      orderId: order._id,
      oldStatus,
      newStatus,
      statusLabel: statusLabels[newStatus] || newStatus,
      order: order,
      message: `Đơn hàng #${order._id.toString().slice(-6).toUpperCase()} đã được cập nhật: ${statusLabels[newStatus] || newStatus}`,
    };

    // Gửi cho chủ đơn hàng (user)
    sendToClient(order.user._id.toString(), eventData);

    // Gửi cho tất cả admin đang kết nối
    sendToAllAdmins(eventData);
  } catch (err) {
    console.error('Error broadcasting order update:', err);
  }
};

module.exports = {
  orderSSEHandler,
  broadcastOrderUpdate,
  broadcastNewOrder,
};
