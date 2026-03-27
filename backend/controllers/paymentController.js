/**
 * Payment Controller - MoMo UAT Payment Integration
 * Test without merchant account registration
 */

const crypto = require('crypto');
const axios = require('axios');
const momoConfig = require('../config/momo');
const Order = require('../models/Order');
const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');

// Tạo signature HMAC SHA256
const createSignature = (rawSignature) => {
  return crypto
    .createHmac('sha256', momoConfig.secretKey)
    .update(rawSignature)
    .digest('hex');
};

// Build raw signature string theo đúng format MoMo yêu cầu
const buildRawSignature = (data) => {
  return `accessKey=${momoConfig.accessKey}&amount=${data.amount}&extraData=${data.extraData}&ipnUrl=${data.ipnUrl}&orderId=${data.orderId}&orderInfo=${data.orderInfo}&partnerCode=${momoConfig.partnerCode}&redirectUrl=${data.redirectUrl}&requestId=${data.requestId}&requestType=${data.requestType}`;
};

// @desc    Tạo payment MoMo
// @route   POST /api/momo/create
// @access  Private
const createPayment = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  const userId = req.user.id;

  // Lấy thông tin order
  const order = await Order.findById(orderId).populate('user', 'name email');

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy đơn hàng',
      data: null,
    });
  }

  // Kiểm tra order thuộc về user
  if (order.user._id.toString() !== userId) {
    return res.status(403).json({
      success: false,
      message: 'Bạn không có quyền thanh toán đơn hàng này',
      data: null,
    });
  }

  // Kiểm tra order đã thanh toán chưa
  if (order.paymentStatus === 'PAID') {
    return res.status(400).json({
      success: false,
      message: 'Đơn hàng đã được thanh toán',
      data: null,
    });
  }

  // Tạo requestId và orderId cho MoMo (format: MOMO + timestamp)
  const requestId = `MOMO${Date.now()}`;
  const momoOrderId = requestId; // MoMo orderId = requestId

  // Amount phải là string theo yêu cầu MoMo
  const amount = order.finalPrice.toString();

  // Order info chứa orderId để lấy lại khi callback
  const orderInfo = `thanh toan don hang ${order._id}`;

  // Build data cho signature
  const signatureData = {
    amount,
    extraData: '',
    ipnUrl: momoConfig.ipnUrl,
    orderId: momoOrderId,
    orderInfo,
    redirectUrl: momoConfig.redirectUrl,
    requestId,
    requestType: 'captureWallet',
  };

  // Tạo signature
  const rawSignature = buildRawSignature(signatureData);
  const signature = createSignature(rawSignature);

  // Build request body gửi lên MoMo
  const requestBody = {
    partnerCode: momoConfig.partnerCode,
    partnerName: 'Clothing Shop',
    storeId: 'ClothingShop',
    requestId,
    amount,
    orderId: momoOrderId,
    orderInfo,
    redirectUrl: momoConfig.redirectUrl,
    ipnUrl: momoConfig.ipnUrl,
    lang: 'vi',
    requestType: 'captureWallet',
    extraData: '',
    autoCapture: true,
    signature,
  };

  try {
    // Gọi API MoMo
    const response = await axios.post(
      `${momoConfig.endpoint}/v2/gateway/api/create`,
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    // Lưu momoOrderId vào order để track
    order.momoOrderId = momoOrderId;
    order.momoRequestId = requestId;
    await order.save();

    // Trả về payUrl để frontend redirect
    if (response.data.payUrl) {
      return res.status(200).json({
        success: true,
        message: 'Tạo payment thành công',
        data: {
          payUrl: response.data.payUrl,
          orderId: order._id,
          momoOrderId,
        },
      });
    }

    // Lỗi từ MoMo
    return res.status(400).json({
      success: false,
      message: response.data.message || 'Tạo payment thất bại',
      data: null,
    });
  } catch (error) {
    console.error('MoMo API Error:', error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: 'Lỗi kết nối MoMo',
      data: error.response?.data || null,
    });
  }
});

// @desc    IPN - Server-to-server callback từ MoMo
// @route   POST /api/momo/ipn
// @access  Public (MoMo sẽ gọi)
const ipnCallback = asyncHandler(async (req, res) => {
  const {
    partnerCode,
    orderId,
    requestId,
    amount,
    resultCode,
    transId,
    message,
    signature,
    orderInfo,
  } = req.body;

  console.log('=== MoMo IPN Callback ===');
  console.log('OrderId:', orderId);
  console.log('ResultCode:', resultCode);
  console.log('Amount:', amount);

  // Xử lý thanh toán thành công
  if (resultCode == 0) {
    // Trích xuất orderId từ orderInfo: "thanh toan don hang 123abc"
    const orderIdMatch = orderInfo.match(/thanh toan don hang (.+)/i);
    if (orderIdMatch) {
      const dbOrderId = orderIdMatch[1];

      try {
        const order = await Order.findById(dbOrderId);
        if (order && order.paymentStatus !== 'PAID') {
          // Trừ stock khi thanh toán thành công (stock chưa bị trừ khi tạo MoMo order)
          for (const item of order.items) {
            await Product.findByIdAndUpdate(
              item.product,
              { $inc: { stock: -item.quantity } },
              { new: true }
            );
          }

          order.paymentStatus = 'PAID';
          order.paymentMethod = 'MOMO';
          order.momoTransId = transId;
          order.momoMessage = message;
          order.paidAt = new Date();
          await order.save();

          console.log('✅ Payment success, stock reduced, order updated:', dbOrderId);
        }
      } catch (err) {
        console.error('Error updating order:', err);
      }
    }
  } else {
    console.log('❌ Payment failed, resultCode:', resultCode, 'message:', message);
    // KHÔNG xóa đơn ở đây - chỉ xóa ở returnCallback (khi user thực sự hủy)
  }

  // Luôn trả 200 để MoMo không gọi lại
  res.status(200).json({ status: 'SUCCESS' });
});

// @desc    Return URL - User redirect sau khi thanh toán
// @route   GET /api/momo/return
// @access  Public
const returnCallback = asyncHandler(async (req, res) => {
  const { resultCode, orderInfo, transId, amount, message } = req.query;

  console.log('=== MoMo Return Callback ===');
  console.log('ResultCode:', resultCode);

  // Trích xuất orderId từ orderInfo: "thanh toan don hang 123abc"
  const orderIdMatch = orderInfo ? orderInfo.match(/thanh toan don hang (.+)/i) : null;

  if (resultCode == 0) {
    // Thanh toán thành công - redirect về frontend
    return res.redirect(`${momoConfig.redirectUrl}?status=success&orderId=${orderId}`);
  } else {
    // Thanh toán thất bại/hủy - hủy đơn hàng
    if (orderIdMatch) {
      const dbOrderId = orderIdMatch[1];
      try {
        const order = await Order.findById(dbOrderId);
        if (order && order.paymentStatus !== 'PAID') {
          // Hoàn stock
          for (const item of order.items) {
            await Product.findByIdAndUpdate(
              item.product,
              { $inc: { stock: item.quantity } },
              { new: true }
            );
          }
          // Xóa đơn hàng
          await Order.findByIdAndDelete(dbOrderId);
          console.log('✅ Order cancelled due to payment failure, stock restored:', dbOrderId);
        }
      } catch (err) {
        console.error('Error cancelling order:', err);
      }
    }
    // Redirect về trang thất bại
    const errorMessage = encodeURIComponent(message || 'Thanh toán bị hủy');
    return res.redirect(`${momoConfig.redirectUrl}?status=failed&code=${resultCode}&message=${errorMessage}`);
  }
});

// @desc    Query transaction status
// @route   GET /api/momo/query/:orderId
// @access  Private
const queryTransaction = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId);
  if (!order || !order.momoOrderId) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy giao dịch MoMo',
      data: null,
    });
  }

  const requestId = `QUERY${Date.now()}`;

  const signatureData = {
    orderId: order.momoOrderId,
    requestId,
  };

  const rawSignature = `accessKey=${momoConfig.accessKey}&orderId=${signatureData.orderId}&requestId=${signatureData.requestId}`;
  const signature = createSignature(rawSignature);

  try {
    const response = await axios.post(
      `${momoConfig.endpoint}/v2/gateway/api/query`,
      {
        partnerCode: momoConfig.partnerCode,
        requestId,
        orderId: order.momoOrderId,
        signature,
        lang: 'vi',
      },
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    return res.status(200).json({
      success: true,
      message: 'Query thành công',
      data: response.data,
    });
  } catch (error) {
    console.error('MoMo Query Error:', error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: 'Lỗi query giao dịch',
      data: null,
    });
  }
});

module.exports = {
  createPayment,
  ipnCallback,
  returnCallback,
  queryTransaction,
};
