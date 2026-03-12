const express = require('express');
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
} = require('../controllers/orderController');
const { verifyToken, authorizeRoles } = require('../middlewares/auth');

const router = express.Router();

// POST /api/orders - Tạo đơn hàng (USER)
router.post('/', verifyToken, authorizeRoles('USER', 'STAFF', 'ADMIN'), createOrder);

// GET /api/orders/my - Lấy đơn hàng của tôi (USER)
router.get('/my', verifyToken, authorizeRoles('USER', 'STAFF', 'ADMIN'), getMyOrders);

// PUT /api/orders/:id/cancel - Hủy đơn hàng của user (phải trước GET /:id)
router.put('/:id/cancel', verifyToken, authorizeRoles('USER', 'STAFF', 'ADMIN'), cancelOrder);

// GET /api/orders/:id - Lấy chi tiết một đơn hàng
router.get('/:id', verifyToken, authorizeRoles('USER', 'STAFF', 'ADMIN'), getOrderById);

// GET /api/orders - Lấy tất cả đơn hàng (ADMIN)
router.get('/', verifyToken, authorizeRoles('ADMIN'), getAllOrders);

// PUT /api/orders/:id/status - Cập nhật trạng thái đơn hàng (ADMIN, STAFF)
router.put('/:id/status', verifyToken, authorizeRoles('ADMIN', 'STAFF'), updateOrderStatus);

module.exports = router;
