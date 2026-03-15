const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Category = require('../models/Category');

const router = express.Router();

// @desc    Lấy thống kê dashboard
// @route   GET /api/admin/stats
// @access  Private/ADMIN
const getStats = asyncHandler(async (req, res, next) => {
  // Đếm số người dùng
  const totalUsers = await User.countDocuments();

  // Đếm số sản phẩm
  const totalProducts = await Product.countDocuments();

  // Đếm số danh mục
  const totalCategories = await Category.countDocuments();

  // Đếm số đơn hàng
  const totalOrders = await Order.countDocuments();

  // Tính tổng doanh thu (chỉ tính đơn hàng đã hoàn thành)
  const completedOrders = await Order.find({ status: 'COMPLETED' });
  const totalRevenue = completedOrders.reduce((sum, order) => sum + (order.finalPrice || order.totalPrice), 0);

  // Đếm đơn hàng theo trạng thái
  const pendingOrders = await Order.countDocuments({ status: 'PENDING' });
  const shippedOrders = await Order.countDocuments({ status: 'SHIPPED' });
  const completedOrderCount = await Order.countDocuments({ status: 'COMPLETED' });
  const cancelledOrders = await Order.countDocuments({ status: 'CANCELLED' });

  // Sản phẩm sắp hết hàng
  const lowStockProducts = await Product.countDocuments({ stock: { $lt: 10 } });

  // Người dùng mới trong tháng
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const newUsersThisMonth = await User.countDocuments({ createdAt: { $gte: startOfMonth } });

  res.status(200).json({
    success: true,
    message: 'Lấy thống kê thành công',
    data: {
      totalUsers,
      totalProducts,
      totalCategories,
      totalOrders,
      totalRevenue,
      pendingOrders,
      shippedOrders,
      completedOrderCount,
      cancelledOrders,
      lowStockProducts,
      newUsersThisMonth
    }
  });
});

module.exports = router;
