/**
 * MoMo Payment Routes
 */

const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth');
const {
  createPayment,
  ipnCallback,
  returnCallback,
  queryTransaction,
} = require('../controllers/paymentController');

// @route   POST /api/momo/create
// @desc    Tạo payment MoMo
// @access  Private
router.post('/create', verifyToken, createPayment);

// @route   POST /api/momo/ipn
// @desc    IPN callback từ MoMo (server-to-server)
// @access  Public
router.post('/ipn', ipnCallback);

// @route   GET /api/momo/return
// @desc    Redirect URL sau khi thanh toán
// @access  Public
router.get('/return', returnCallback);

// @route   GET /api/momo/query/:orderId
// @desc    Query trạng thái giao dịch
// @access  Private
router.get('/query/:orderId', verifyToken, queryTransaction);

module.exports = router;
