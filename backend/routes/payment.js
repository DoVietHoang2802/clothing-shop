const express = require('express');
const {
  createVNPayPayment,
  vnpayReturn,
  vnpayIPN,
  checkPaymentStatus,
} = require('../controllers/paymentController');
const { verifyToken, authorizeRoles } = require('../middlewares/auth');

const router = express.Router();

// POST /api/payment/vnpay/create - Tạo link thanh toán VNPay
router.post('/vnpay/create', verifyToken, authorizeRoles('USER'), createVNPayPayment);

// GET /api/payment/vnpay/return - Redirect từ VNPay về client
router.get('/vnpay/return', vnpayReturn);

// POST /api/payment/vnpay/ipn - IPN từ VNPay (server-to-server)
router.post('/vnpay/ipn', vnpayIPN);

// GET /api/payment/vnpay/status/:orderId - Kiểm tra trạng thái thanh toán
router.get('/vnpay/status/:orderId', verifyToken, authorizeRoles('USER', 'ADMIN'), checkPaymentStatus);

module.exports = router;
