const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Tạo đơn hàng mới
// @route   POST /api/orders
// @access  Private/USER
const createOrder = asyncHandler(async (req, res, next) => {
  const { items, couponCode, shippingAddress, paymentMethod } = req.body;
  const userId = req.user.id;

  if (!items || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Giỏ hàng không được trống',
      data: null,
    });
  }

  // Validate shipping address cho COD (không bắt buộc với VNPAY)
  if (paymentMethod === 'COD') {
    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.address) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp địa chỉ giao hàng đầy đủ',
        data: null,
      });
    }
  } else {
    // VNPAY - vẫn cần shippingAddress để giao hàng
    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.address) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp địa chỉ giao hàng đầy đủ',
        data: null,
      });
    }
  }

  let totalPrice = 0;
  const orderItems = [];
  const productsToUpdate = [];

  // Validate tất cả trước
  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Sản phẩm không tìm thấy: ${item.productId}`,
        data: null,
      });
    }

    if (product.stock < item.quantity) {
      return res.status(400).json({
        success: false,
        message: `Không đủ hàng cho sản phẩm: ${product.name} (Hiện có: ${product.stock}, Yêu cầu: ${item.quantity})`,
        data: null,
      });
    }

    const price = product.price;
    totalPrice += price * item.quantity;

    orderItems.push({
      product: product._id,
      name: product.name,
      quantity: item.quantity,
      price: price,
      size: item.size || null,
      color: item.color || null,
    });

    productsToUpdate.push({
      productId: product._id,
      quantity: item.quantity,
    });
  }

  // Xử lý coupon nếu có
  let couponData = null;
  let discountAmount = 0;
  let finalPrice = totalPrice;

  if (couponCode) {
    console.log('🔍 Looking for coupon:', couponCode.toUpperCase());

    // First try to find without date check
    let coupon = await Coupon.findOne({
      code: couponCode.toUpperCase(),
    });

    console.log('📋 Coupon found:', coupon);

    if (!coupon) {
      return res.status(400).json({
        success: false,
        message: 'Mã coupon không tồn tại',
        data: null,
      });
    }

    console.log('📋 Coupon details:', {
      code: coupon.code,
      isActive: coupon.isActive,
      expiresAt: coupon.expiresAt,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      usageLimit: coupon.usageLimit,
      usageCount: coupon.usageCount,
    });

    // Check if active
    if (!coupon.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Mã coupon đã bị vô hiệu hóa',
        data: null,
      });
    }

    // Check expiry
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Mã coupon đã hết hạn',
        data: null,
      });
    }

    // Check min order value
    if (coupon.minOrderValue && totalPrice < coupon.minOrderValue) {
      return res.status(400).json({
        success: false,
        message: `Đơn hàng phải tối thiểu ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(coupon.minOrderValue)}`,
        data: null,
      });
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        message: 'Mã coupon đã được sử dụng hết',
        data: null,
      });
    }

    // Calculate discount
    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = Math.floor((totalPrice * coupon.discountValue) / 100);
      if (coupon.maxDiscount) {
        discountAmount = Math.min(discountAmount, coupon.maxDiscount);
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    finalPrice = Math.max(0, totalPrice - discountAmount);

    couponData = {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
    };

    // Update coupon usage
    await Coupon.findByIdAndUpdate(coupon._id, {
      $inc: { usageCount: 1 },
    });
  }

  // Create order
  let order;
  const paymentMethodVal = paymentMethod || 'COD';
  const paymentStatusVal = paymentMethodVal === 'VNPAY' ? 'PENDING' : 'PENDING';

  try {
    order = await Order.create({
      user: userId,
      items: orderItems,
      totalPrice,
      coupon: couponData,
      discountAmount,
      finalPrice,
      shippingAddress: shippingAddress || null,
      paymentMethod: paymentMethodVal,
      paymentStatus: paymentStatusVal,
    });
  } catch (err) {
    console.error('Order creation failed:', err);
    return res.status(500).json({
      success: false,
      message: 'Tạo đơn hàng thất bại',
      data: null,
    });
  }

  // Giảm stock chỉ sau khi order create thành công
  for (const product of productsToUpdate) {
    await Product.findByIdAndUpdate(
      product.productId,
      { $inc: { stock: -product.quantity } },
      { new: true }
    );
  }

  await order.populate('user', 'name email');
  await order.populate('items.product', 'name price');

  res.status(201).json({
    success: true,
    message: 'Tạo đơn hàng thành công',
    data: order,
  });
});

// @desc    Lấy đơn hàng của người dùng hiện tại
// @route   GET /api/orders/my
// @access  Private/USER
const getMyOrders = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;

  try {
    const orders = await Order.find({ user: userId })
      .populate('user', 'name email')
      .populate('items.product', 'name price image')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Lấy danh sách đơn hàng thành công',
      data: orders || [],
    });
  } catch (error) {
    console.error('getMyOrders error:', error);
    res.status(200).json({
      success: true,
      message: 'Lấy danh sách đơn hàng thành công',
      data: [],
    });
  }
});

// @desc    Lấy chi tiết một đơn hàng
// @route   GET /api/orders/:id
// @access  Private/USER,ADMIN
const getOrderById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  // Validate ObjectId
  if (!require('mongoose').Types.ObjectId.isValid(id)) {
    return res.status(404).json({
      success: false,
      message: 'Đơn hàng không tìm thấy',
      data: null,
    });
  }

  const order = await Order.findById(id)
    .populate('user', 'name email')
    .populate('items.product', 'name price image');

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Đơn hàng không tìm thấy',
      data: null,
    });
  }

  // Check authorization: user can only view their own orders, admin can view all
  if (userRole !== 'ADMIN' && order.user._id.toString() !== userId) {
    return res.status(403).json({
      success: false,
      message: 'Bạn không có quyền xem đơn hàng này',
      data: null,
    });
  }

  res.status(200).json({
    success: true,
    message: 'Lấy chi tiết đơn hàng thành công',
    data: order,
  });
});

// @desc    Lấy tất cả đơn hàng
// @route   GET /api/orders
// @access  Private/ADMIN
const getAllOrders = asyncHandler(async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('items.product', 'name price image')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Lấy danh sách đơn hàng thành công',
      data: orders || [],
    });
  } catch (error) {
    console.error('getAllOrders error:', error);
    res.status(200).json({
      success: true,
      message: 'Lấy danh sách đơn hàng thành công',
      data: [],
    });
  }
});

// @desc    Cập nhật trạng thái đơn hàng
// @route   PUT /api/orders/:id/status
// @access  Private/ADMIN,STAFF
const updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng cung cấp trạng thái',
      data: null,
    });
  }

  const validStatuses = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERING', 'ARRIVED', 'PAID_TO_SHIPPER', 'COMPLETED', 'CANCELLED'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Trạng thái không hợp lệ',
      data: null,
    });
  }

  let order = await Order.findById(id);
  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Đơn hàng không tìm thấy',
      data: null,
    });
  }

  const oldStatus = order.status;

  // Handle stock rollback when cancelling order
  if (status === 'CANCELLED' && oldStatus !== 'CANCELLED') {
    // Trả lại stock khi hủy đơn
    console.log(`🔄 Hoàn lại stock cho đơn hàng ${id}`);
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: item.quantity } }, // Increase stock back
        { new: true }
      );
      console.log(`✅ Hoàn lại ${item.quantity} sản phẩm`);
    }
  }

  // Handle stock adjustment if order is being un-cancelled
  if (oldStatus === 'CANCELLED' && status !== 'CANCELLED') {
    // Giảm stock lại khi không hủy nữa
    console.log(`📉 Giảm stock lại cho đơn hàng ${id}`);
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity } }, // Decrease stock
        { new: true }
      );
      console.log(`📉 Giảm ${item.quantity} sản phẩm`);
    }
  }

  order.status = status;
  order = await order.save();

  await order.populate('user', 'name email');
  await order.populate('items.product', 'name price image');

  res.status(200).json({
    success: true,
    message: 'Cập nhật trạng thái đơn hàng thành công',
    data: order,
  });
});

// @desc    Hủy đơn hàng của người dùng
// @route   PUT /api/orders/:id/cancel
// @access  Private/USER
const cancelOrder = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  let order = await Order.findById(id);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Đơn hàng không tìm thấy',
      data: null,
    });
  }

  // Check authorization - user can only cancel their own orders
  if (order.user.toString() !== userId) {
    return res.status(403).json({
      success: false,
      message: 'Bạn không có quyền hủy đơn hàng này',
      data: null,
    });
  }

  // Can only cancel PENDING orders (NOT COMPLETED, NOT PAID_TO_SHIPPER)
  const cancellableStatuses = ['PENDING', 'CONFIRMED'];
  if (!cancellableStatuses.includes(order.status)) {
    return res.status(400).json({
      success: false,
      message: `Không thể hủy đơn hàng đã hoàn thành hoặc đang giao hàng. Trạng thái hiện tại: ${order.status}`,
      data: null,
    });
  }

  // Return stock for all items
  console.log(`🔄 Hủy đơn hàng ${id} - Hoàn lại stock`);
  for (const item of order.items) {
    await Product.findByIdAndUpdate(
      item.product,
      { $inc: { stock: item.quantity } },
      { new: true }
    );
    console.log(`✅ Hoàn lại ${item.quantity} sản phẩm`);
  }

  // HOÀN COUPON: Giảm usageCount để coupon có thể được sử dụng lại
  if (order.coupon && order.coupon.code) {
    await Coupon.findOneAndUpdate(
      { code: order.coupon.code },
      { $inc: { usageCount: -1 } }
    );
    console.log(`✅ Hoàn lại coupon: ${order.coupon.code}`);
  }

  // Update status
  order.status = 'CANCELLED';
  order = await order.save();

  await order.populate('user', 'name email');
  await order.populate('items.product', 'name price image');

  res.status(200).json({
    success: true,
    message: 'Hủy đơn hàng thành công',
    data: order,
  });
});

// @desc    Xóa đơn hàng (user xóa đơn hàng của mình)
// @route   DELETE /api/orders/:id
// @access  Private/USER
const deleteOrder = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  const order = await Order.findById(id);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Đơn hàng không tìm thấy',
      data: null,
    });
  }

  // Check authorization
  if (order.user.toString() !== userId) {
    return res.status(403).json({
      success: false,
      message: 'Bạn không có quyền xóa đơn hàng này',
      data: null,
    });
  }

  // Allow user to delete their own orders (any status except PENDING, CONFIRMED, SHIPPED, DELIVERING, ARRIVED)
  // Cannot delete orders that are in progress
  const deletableStatuses = ['CANCELLED', 'COMPLETED', 'PAID_TO_SHIPPER'];
  if (!deletableStatuses.includes(order.status)) {
    return res.status(400).json({
      success: false,
      message: `Không thể xóa đơn hàng đang xử lý hoặc đang giao. Trạng thái hiện tại: ${order.status}`,
      data: null,
    });
  }

  await Order.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: 'Xóa đơn hàng thành công',
    data: null,
  });
});

// @desc    Xóa đơn hàng (admin xóa)
// @route   DELETE /api/orders/admin/:id
// @access  Private/ADMIN
const deleteOrderAdmin = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const order = await Order.findById(id);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Đơn hàng không tìm thấy',
      data: null,
    });
  }

  await Order.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: 'Xóa đơn hàng thành công',
    data: null,
  });
});

// @desc    User xác nhận đã thanh toán cho shipper (COD)
// @route   PUT /api/orders/:id/paid-to-shipper
// @access  Private/USER
const confirmPaidToShipper = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  const order = await Order.findById(id);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Đơn hàng không tìm thấy',
      data: null,
    });
  }

  // Check authorization - user can only update their own orders
  if (order.user.toString() !== userId) {
    return res.status(403).json({
      success: false,
      message: 'Bạn không có quyền cập nhật đơn hàng này',
      data: null,
    });
  }

  // Validate status - only ARRIVED orders can be marked as PAID_TO_SHIPPER
  if (order.status !== 'ARRIVED') {
    return res.status(400).json({
      success: false,
      message: 'Chỉ có thể xác nhận thanh toán khi đơn hàng đã đến nơi',
      data: null,
    });
  }

  // Validate payment method - only COD
  if (order.paymentMethod !== 'COD') {
    return res.status(400).json({
      success: false,
      message: 'Chức năng này chỉ áp dụng cho đơn hàng COD',
      data: null,
    });
  }

  // Update status
  order.status = 'PAID_TO_SHIPPER';
  order.paymentStatus = 'PAID';
  order = await order.save();

  await order.populate('user', 'name email');
  await order.populate('items.product', 'name price image');

  res.status(200).json({
    success: true,
    message: 'Bạn đã xác nhận thanh toán cho shipper',
    data: order,
  });
});

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  confirmPaidToShipper,
  cancelOrder,
  deleteOrder,
  deleteOrderAdmin,
};
