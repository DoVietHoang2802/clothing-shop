/**
 * VNPay Controller
 * Xử lý thanh toán qua VNPay
 */

const Order = require('../models/Order');
const { createPaymentUrl, verifyCallback, getResponseMessage } = require('../utils/vnpayUtils');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Tạo link thanh toán VNPay
// @route   POST /api/payment/vnpay/create
// @access  Private/USER
const createVNPayPayment = asyncHandler(async (req, res, next) => {
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

  // Kiểm tra phương thức thanh toán
  if (order.paymentMethod !== 'VNPAY') {
    return res.status(400).json({
      success: false,
      message: 'Đơn hàng không sử dụng phương thức thanh toán VNPay',
      data: null,
    });
  }

  // Lấy IP của client
  const ipAddr = req.headers['x-forwarded-for'] ||
                 req.connection.remoteAddress ||
                 req.socket.remoteAddress ||
                 '127.0.0.1';

  try {
    // Tạo URL thanh toán
    const paymentUrl = createPaymentUrl({
      amount: order.finalPrice,
      orderId: order._id.toString(),
      orderDescription: `Thanh toan don hang #${order._id.toString().substring(0, 8)} - Clothing Shop`,
      ipAddr: ipAddr,
    });

    res.status(200).json({
      success: true,
      message: 'Tạo link thanh toán thành công',
      data: {
        paymentUrl,
        orderId: order._id,
        amount: order.finalPrice,
      },
    });
  } catch (error) {
    console.error('VNPay Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo link thanh toán',
      data: null,
    });
  }
});

// @desc    VNPay Return - Client redirect sau khi thanh toán
// @route   GET /api/payment/vnpay/return
// @access  Public
const vnpayReturn = asyncHandler(async (req, res, next) => {
  const vnp_Params = req.query;

  // Verify callback
  const isValid = verifyCallback(vnp_Params);

  if (!isValid) {
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-result?success=false&message=Invalid+signature`);
  }

  const responseCode = vnp_Params.vnp_ResponseCode;
  const orderId = vnp_Params.vnp_OrderInfo;
  const transactionNo = vnp_Params.vnp_TransactionNo;
  const amount = vnp_Params.vnp_Amount / 100;

  // Cập nhật trạng thái đơn hàng
  if (responseCode === '00') {
    // Thành công
    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: 'PAID',
      status: 'CONFIRMED', // Tự động xác nhận đơn hàng
    });

    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-result?success=true&orderId=${orderId}&amount=${amount}`);
  } else {
    // Thất bại
    const message = getResponseMessage(responseCode);
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-result?success=false&message=${encodeURIComponent(message)}&orderId=${orderId}`);
  }
});

// @desc    VNPay IPN - Server callback (notify)
// @route   POST /api/payment/vnpay/ipn
// @access  Public (VNPay server)
const vnpayIPN = asyncHandler(async (req, res, next) => {
  const vnp_Params = req.body;

  // Verify callback
  const isValid = verifyCallback(vnp_Params);

  if (!isValid) {
    return res.status(400).json({
      RspCode: '97',
      Message: 'Invalid signature',
    });
  }

  const responseCode = vnp_Params.vnp_ResponseCode;
  const orderId = vnp_Params.vnp_OrderInfo;
  const transactionNo = vnp_Params.vnp_TransactionNo;

  // Tìm đơn hàng
  const order = await Order.findById(orderId);

  if (!order) {
    return res.status(400).json({
      RspCode: '01',
      Message: 'Order not found',
    });
  }

  // Kiểm tra trạng thái đơn hàng
  if (order.paymentStatus === 'PAID') {
    return res.status(200).json({
      RspCode: '00',
      Message: 'Already confirmed',
    });
  }

  // Cập nhật trạng thái
  if (responseCode === '00') {
    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: 'PAID',
      status: 'CONFIRMED',
    });

    return res.status(200).json({
      RspCode: '00',
      Message: 'Success',
    });
  } else {
    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: 'FAILED',
    });

    return res.status(200).json({
      RspCode: responseCode,
      Message: getResponseMessage(responseCode),
    });
  }
});

// @desc    Check payment status
// @route   GET /api/payment/vnpay/status/:orderId
// @access  Private/USER
const checkPaymentStatus = asyncHandler(async (req, res, next) => {
  const { orderId } = req.params;
  const userId = req.user.id;

  const order = await Order.findById(orderId);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Đơn hàng không tìm thấy',
      data: null,
    });
  }

  // Kiểm tra quyền
  if (order.user.toString() !== userId && req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Bạn không có quyền xem đơn hàng này',
      data: null,
    });
  }

  res.status(200).json({
    success: true,
    message: 'Lấy trạng thái thanh toán thành công',
    data: {
      orderId: order._id,
      paymentStatus: order.paymentStatus,
      status: order.status,
      finalPrice: order.finalPrice,
    },
  });
});

module.exports = {
  createVNPayPayment,
  vnpayReturn,
  vnpayIPN,
  checkPaymentStatus,
};
