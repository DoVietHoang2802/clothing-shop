const express = require('express');
const {
  createMockPayment,
  confirmMockPayment,
} = require('../controllers/mockPaymentController');
const { verifyToken, authorizeRoles } = require('../middlewares/auth');

const router = express.Router();

// POST /api/payment/vnpay/create - Tạo link thanh toán Mock (giả lập VNPay)
router.post('/vnpay/create', verifyToken, authorizeRoles('USER'), createMockPayment);

// POST /api/payment/mock/confirm - Xác nhận thanh toán mock
router.post('/mock/confirm', verifyToken, authorizeRoles('USER'), confirmMockPayment);

module.exports = router;
