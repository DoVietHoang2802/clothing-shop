const Order = require('../models/Order');
const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Tạo đơn hàng mới
// @route   POST /api/orders
// @access  Private/USER
const createOrder = asyncHandler(async (req, res, next) => {
  const { items } = req.body;
  const userId = req.user.id;

  if (!items || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Giỏ hàng không được trống',
      data: null,
    });
  }

  let totalPrice = 0;
  const orderItems = [];
  const productsToUpdate = []; // Track products to update stock

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
      quantity: item.quantity,
      price: price,
    });

    // Track products for stock update
    productsToUpdate.push({
      productId: product._id,
      quantity: item.quantity,
    });
  }

  // Create order - nếu fail thì không giảm stock
  let order;
  try {
    order = await Order.create({
      user: userId,
      items: orderItems,
      totalPrice,
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

  const orders = await Order.find({ user: userId })
    .populate('user', 'name email')
    .populate('items.product', 'name price image');

  res.status(200).json({
    success: true,
    message: 'Lấy danh sách đơn hàng thành công',
    data: orders,
  });
});

// @desc    Lấy chi tiết một đơn hàng
// @route   GET /api/orders/:id
// @access  Private/USER,ADMIN
const getOrderById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

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
  const orders = await Order.find()
    .populate('user', 'name email')
    .populate('items.product', 'name price image');

  res.status(200).json({
    success: true,
    message: 'Lấy danh sách đơn hàng thành công',
    data: orders,
  });
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

  const validStatuses = ['PENDING', 'CONFIRMED', 'SHIPPED', 'COMPLETED', 'CANCELLED'];
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

  // Can only cancel PENDING orders
  if (order.status !== 'PENDING') {
    return res.status(400).json({
      success: false,
      message: `Không thể hủy đơn hàng có trạng thái: ${order.status}. Chỉ có thể hủy đơn hàng ở trạng thái PENDING`,
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

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
};
