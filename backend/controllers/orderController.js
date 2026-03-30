const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { broadcastOrderUpdate } = require('./orderSSEController');
const { createNotification } = require('./notificationController');

// Helper: Gửi notification cho tất cả admin
const notifyAdmins = async ({ title, message, type, link, data }) => {
  try {
    const admins = await User.find({ role: 'ADMIN' }).select('_id');
    for (const admin of admins) {
      await createNotification({
        userId: admin._id,
        type: type || 'SYSTEM',
        title,
        message,
        link: link || '/admin/dashboard',
        data: data || null,
      });
    }
  } catch (err) {
    console.error('Error notifying admins:', err);
  }
};

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

  // Validate shipping address
  if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.address) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng cung cấp địa chỉ giao hàng đầy đủ',
      data: null,
    });
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
    const coupon = await Coupon.findOne({
      code: couponCode.toUpperCase(),
    });

    if (!coupon) {
      return res.status(400).json({
        success: false,
        message: 'Mã coupon không tồn tại',
        data: null,
      });
    }

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
      paymentStatus: 'PENDING',
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Tạo đơn hàng thất bại',
      data: null,
    });
  }

  // Giảm stock chỉ khi tạo đơn COD (MoMo sẽ trừ stock khi thanh toán thành công)
  if (paymentMethodVal === 'COD') {
    for (const product of productsToUpdate) {
      await Product.findByIdAndUpdate(
        product.productId,
        { $inc: { stock: -product.quantity } },
        { new: true }
      );
    }
  }

  await order.populate('user', 'name email');
  await order.populate('items.product', 'name price image');

  const orderIdShort = order._id.toString().slice(-6).toUpperCase();

  // Broadcast Socket.io cho tất cả admins (nếu có)
  const io = req.app.get('io');
  if (io) {
    io.emit('new_order', {
      type: 'NEW_ORDER',
      orderId: order._id,
      order: order,
      message: `📦 Đơn hàng mới #${orderIdShort} từ ${order.user?.name || 'Khách hàng'}`,
    });
  }

  // SSE broadcast tới tất cả admin đang kết nối
  const { broadcastNewOrder } = require('./orderSSEController');
  broadcastNewOrder(order);

  // Notification cho admin
  await notifyAdmins({
    title: '📦 Đơn hàng mới',
    message: `Đơn hàng #${orderIdShort} từ ${order.user?.name || 'Khách hàng'} - ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.finalPrice || order.totalPrice)}`,
    type: 'ORDER_STATUS',
    link: '/admin/orders',
    data: { orderId: order._id.toString() },
  });

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
    // Chỉ hiện đơn hàng đã thanh toán hoặc COD
    // Ẩn đơn MoMo đang chờ thanh toán (sẽ bị xóa khi hủy)
    const orders = await Order.find({
      user: userId,
      $or: [
        { paymentStatus: 'PAID' },
        { paymentMethod: 'COD' },
        { paymentStatus: { $ne: 'PENDING' } }
      ]
    })
      .populate('user', 'name email')
      .populate('items.product', 'name price image')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Lấy danh sách đơn hàng thành công',
      data: orders || [],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách đơn hàng',
      data: null,
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
    // Chỉ hiện: COD (mọi status) HOẶC MoMo đã thanh toán
    // ẨN: MoMo đang chờ thanh toán (sẽ bị xóa khi hủy/thất bại)
    const orders = await Order.find({
      $or: [
        { paymentMethod: 'COD' },
        { paymentMethod: 'MOMO', paymentStatus: 'PAID' }
      ]
    })
      .populate('user', 'name email')
      .populate('items.product', 'name price image')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Lấy danh sách đơn hàng thành công',
      data: orders || [],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách đơn hàng',
      data: null,
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
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: item.quantity } },
        { new: true }
      );
    }
  }

  // Handle stock adjustment if order is being un-cancelled
  if (oldStatus === 'CANCELLED' && status !== 'CANCELLED') {
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity } },
        { new: true }
      );
    }
  }

  // Increment soldCount when order is completed
  if (status === 'COMPLETED' && oldStatus !== 'COMPLETED') {
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { soldCount: item.quantity } },
        { new: true }
      );
    }
  }

  order.status = status;
  order = await order.save();

  await order.populate('user', 'name email');
  await order.populate('items.product', 'name price image');

  // Gửi thông báo real-time qua SSE
  broadcastOrderUpdate(order, oldStatus, status);

  // Tạo notification cho user
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

  const orderIdShort = order._id.toString().slice(-6).toUpperCase();

  // Tạo notification lưu vào database
  await createNotification({
    userId: order.user._id,
    type: status === 'CANCELLED' ? 'ORDER_CANCELLED' : 'ORDER_STATUS',
    title: status === 'CANCELLED' ? 'Đơn hàng đã bị hủy' : 'Cập nhật đơn hàng',
    message: `Đơn hàng #${orderIdShort} đã được cập nhật: ${statusLabels[status]}`,
    link: `/my-orders`,
    data: { orderId: order._id.toString(), oldStatus, newStatus: status },
  });

  // Gửi thông báo real-time qua Socket.io (chỉ khi hoạt động - local dev)
  const io = req.app.get('io');
  if (io) {
    const userId = order.user._id.toString();

    // Gửi cho user
    io.to(`user_${userId}`).emit('order_updated', {
      type: 'ORDER_STATUS_CHANGED',
      orderId: order._id,
      oldStatus,
      newStatus: status,
      statusLabel: statusLabels[status],
      order: order,
      message: `Đơn hàng #${orderIdShort} đã được cập nhật: ${statusLabels[status]}`,
    });

    // Gửi cho tất cả admin/staff
    io.emit('admin_order_updated', {
      type: 'ORDER_STATUS_CHANGED',
      orderId: order._id,
      oldStatus,
      newStatus: status,
      statusLabel: statusLabels[status],
      order: order,
    });
  }

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
  for (const item of order.items) {
    await Product.findByIdAndUpdate(
      item.product,
      { $inc: { stock: item.quantity } },
      { new: true }
    );
  }

  // HOÀN COUPON: Giảm usageCount để coupon có thể được sử dụng lại
  if (order.coupon && order.coupon.code) {
    await Coupon.findOneAndUpdate(
      { code: order.coupon.code },
      { $inc: { usageCount: -1 } }
    );
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

// @desc    User xác nhận đã nhận hàng (MOMO)
// @route   PUT /api/orders/:id/received
// @access  Private/USER
const confirmReceivedOrder = asyncHandler(async (req, res, next) => {
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

  if (order.user.toString() !== userId) {
    return res.status(403).json({
      success: false,
      message: 'Bạn không có quyền cập nhật đơn hàng này',
      data: null,
    });
  }

  if (order.paymentMethod !== 'MOMO') {
    return res.status(400).json({
      success: false,
      message: 'Chức năng này chỉ áp dụng cho đơn hàng MoMo',
      data: null,
    });
  }

  if (order.status !== 'ARRIVED') {
    return res.status(400).json({
      success: false,
      message: 'Chỉ có thể xác nhận đã nhận hàng khi đơn hàng ở trạng thái ARRIVED. Trạng thái hiện tại: ' + order.status,
      data: null,
    });
  }

  const oldStatus = order.status;

  // Chuyển thẳng sang hoàn tất cho đơn MoMo
  order.status = 'COMPLETED';
  order.paymentStatus = 'PAID';
  order = await order.save();

  // Tăng soldCount khi hoàn tất
  for (const item of order.items) {
    await Product.findByIdAndUpdate(
      item.product,
      { $inc: { soldCount: item.quantity } },
      { new: true }
    );
  }

  await order.populate('user', 'name email');
  await order.populate('items.product', 'name price image');

  broadcastOrderUpdate(order, oldStatus, 'COMPLETED');

  const orderIdShort = order._id.toString().slice(-6).toUpperCase();

  await createNotification({
    userId: order.user._id,
    type: 'ORDER_STATUS',
    title: '🎉 Đơn hàng đã hoàn tất',
    message: `Đơn hàng #${orderIdShort} đã hoàn tất. Cảm ơn bạn đã mua sắm!`,
    link: `/my-orders`,
    data: { orderId: order._id.toString(), oldStatus, newStatus: 'COMPLETED' },
  });

  await notifyAdmins({
    title: '✅ Khách đã nhận hàng (MoMo)',
    message: `Đơn hàng #${orderIdShort} đã được khách xác nhận nhận hàng và hoàn tất`,
    type: 'ORDER_STATUS',
    link: '/admin/orders',
    data: { orderId: order._id.toString(), oldStatus, newStatus: 'COMPLETED' },
  });

  res.status(200).json({
    success: true,
    message: 'Đã xác nhận nhận hàng và hoàn tất đơn hàng',
    data: order,
  });
});

// @desc    User xác nhận đã thanh toán cho shipper (COD)
// @route   PUT /api/orders/:id/paid-to-shipper
// @access  Private/USER
const confirmPaidToShipper = asyncHandler(async (req, res, next) => {
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
      message: 'Chỉ có thể xác nhận thanh toán khi đơn hàng đã đến nơi. Trạng thái hiện tại: ' + order.status,
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

  const oldStatus = order.status;

  // Update status
  order.status = 'PAID_TO_SHIPPER';
  order.paymentStatus = 'PAID';
  order = await order.save();

  await order.populate('user', 'name email');
  await order.populate('items.product', 'name price image');

  // Broadcast SSE cho user và admin
  broadcastOrderUpdate(order, oldStatus, 'PAID_TO_SHIPPER');

  // Tạo notification cho user
  const orderIdShort = order._id.toString().slice(-6).toUpperCase();
  await createNotification({
    userId: order.user._id,
    type: 'ORDER_STATUS',
    title: '💵 Đã xác nhận thanh toán cho shipper',
    message: `Đơn hàng #${orderIdShort} - Bạn đã xác nhận thanh toán. Chờ admin xác nhận hoàn tất.`,
    link: `/my-orders`,
    data: { orderId: order._id.toString(), oldStatus, newStatus: 'PAID_TO_SHIPPER' },
  });

  // Notification cho admin - có người thanh toán cho shipper
  await notifyAdmins({
    title: '💵 Khách xác nhận thanh toán cho shipper',
    message: `Đơn hàng #${orderIdShort} từ ${order.user?.name || 'Khách hàng'} - Cần xác nhận hoàn tất đơn hàng`,
    type: 'ORDER_STATUS',
    link: '/admin/orders',
    data: { orderId: order._id.toString(), oldStatus, newStatus: 'PAID_TO_SHIPPER' },
  });

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
  confirmReceivedOrder,
  confirmPaidToShipper,
  cancelOrder,
  deleteOrder,
  deleteOrderAdmin,
};
