/**
 * Mock Payment Controller - Giả lập thanh toán VNPay
 * Không cần tài khoản VNPay thật!
 */

const Order = require('../models/Order');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Tạo link thanh toán Mock (giả lập)
// @route   POST /api/payment/vnpay/create
// @access  Private/USER
const createMockPayment = asyncHandler(async (req, res, next) => {
  const { orderId } = req.body;
  const userId = req.user.id;

  if (!orderId) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng cung cấp mã đơn hàng',
      data: null,
    });
  }

  // Tìm đơn hàng
  const order = await Order.findById(orderId);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Đơn hàng không tìm thấy',
      data: null,
    });
  }

  // Kiểm tra quyền sở hữu
  if (order.user.toString() !== userId) {
    return res.status(403).json({
      success: false,
      message: 'Bạn không có quyền thanh toán đơn hàng này',
      data: null,
    });
  }

  // Kiểm tra đơn hàng đã thanh toán chưa
  if (order.paymentStatus === 'PAID') {
    return res.status(400).json({
      success: false,
      message: 'Đơn hàng đã được thanh toán',
      data: null,
    });
  }

  // Tạo mock payment URL (chỉ là một trang giả lập)
  const mockPaymentUrl = `/mock-payment?orderId=${order._id}&amount=${order.finalPrice}`;

  res.status(200).json({
    success: true,
    message: 'Tạo link thanh toán thành công',
    data: {
      paymentUrl: mockPaymentUrl,
      orderId: order._id,
      amount: order.finalPrice,
    },
  });
});

// @desc    Xác nhận thanh toán mock (sau khi user "thanh toán")
// @route   POST /api/payment/mock/confirm
// @access  Private/USER
const confirmMockPayment = asyncHandler(async (req, res, next) => {
  const { orderId } = req.body;
  const userId = req.user.id;

  if (!orderId) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng cung cấp mã đơn hàng',
      data: null,
    });
  }

  const order = await Order.findById(orderId);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Đơn hàng không tìm thấy',
      data: null,
    });
  }

  if (order.user.toString() !== userId) {
    return res.status(403).json({
      success: false,
      message: 'Bạn không có quyền thanh toán đơn hàng này',
      data: null,
    });
  }

  if (order.paymentStatus === 'PAID') {
    return res.status(400).json({
      success: false,
      message: 'Đơn hàng đã được thanh toán',
      data: null,
    });
  }

  // Cập nhật trạng thái thanh toán
  order.paymentStatus = 'PAID';
  order.status = 'CONFIRMED'; // Tự động xác nhận đơn hàng
  await order.save();

  res.status(200).json({
    success: true,
    message: 'Thanh toán thành công!',
    data: {
      orderId: order._id,
      paymentStatus: 'PAID',
      status: 'CONFIRMED',
    },
  });
});

module.exports = {
  createMockPayment,
  confirmMockPayment,
};
