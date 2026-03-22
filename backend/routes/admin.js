const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Category = require('../models/Category');
const { verifyToken, authorizeRoles } = require('../middlewares/auth');

const router = express.Router();

// @desc    Lấy thống kê dashboard
// @route   GET /api/admin/stats
// @access  Private/ADMIN
router.get('/stats', verifyToken, authorizeRoles('ADMIN'), asyncHandler(async (req, res, next) => {
  const totalUsers = await User.countDocuments();
  const totalProducts = await Product.countDocuments();
  const totalCategories = await Category.countDocuments();
  const totalOrders = await Order.countDocuments();

  // Tính tổng doanh thu (chỉ tính đơn đã thanh toán)
  const paidOrders = await Order.find({ paymentStatus: 'PAID' });
  const totalRevenue = paidOrders.reduce((sum, order) => sum + (order.finalPrice || order.totalPrice), 0);

  const pendingOrders = await Order.countDocuments({ status: 'PENDING' });
  const shippedOrders = await Order.countDocuments({ status: 'SHIPPED' });
  const completedOrderCount = await Order.countDocuments({ status: 'COMPLETED' });
  const cancelledOrders = await Order.countDocuments({ status: 'CANCELLED' });
  const lowStockProducts = await Product.countDocuments({ stock: { $lt: 10 } });

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
}));

// @desc    Lấy dữ liệu biểu đồ
// @route   GET /api/admin/stats/chart
// @access  Private/ADMIN
router.get('/stats/chart', verifyToken, authorizeRoles('ADMIN'), asyncHandler(async (req, res, next) => {
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const monthNames = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];

  // Revenue by month (last 6 months)
  const revenueByMonth = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: sixMonthsAgo },
        status: { $in: ['COMPLETED', 'PAID_TO_SHIPPER'] },
      },
    },
    {
      $group: {
        _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
        revenue: { $sum: '$finalPrice' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  // Orders by status
  const ordersByStatus = await Order.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  // Top selling products
  const topProducts = await Order.aggregate([
    { $match: { status: { $in: ['COMPLETED', 'PAID_TO_SHIPPER'] } } },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.product',
        name: { $first: '$items.name' },
        totalSold: { $sum: '$items.quantity' },
        revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
      },
    },
    { $sort: { totalSold: -1 } },
    { $limit: 5 },
  ]);

  // Users registered by month
  const usersByMonth = await User.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    { $group: { _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, count: { $sum: 1 } } },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  // Format revenue data
  const revenueData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    const found = revenueByMonth.find(r => r._id.month === month && r._id.year === year);
    revenueData.push({ name: monthNames[month - 1], revenue: found ? found.revenue : 0, orders: found ? found.orders : 0 });
  }

  // Format users data
  const usersData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    const found = usersByMonth.find(u => u._id.month === month && u._id.year === year);
    usersData.push({ name: monthNames[month - 1], users: found ? found.count : 0 });
  }

  // Status labels
  const statusLabels = {
    PENDING: 'Chờ xác nhận', CONFIRMED: 'Đã xác nhận',
    SHIPPED: 'Đang giao', DELIVERING: 'Đang giao',
    ARRIVED: 'Đã đến nơi', PAID_TO_SHIPPER: 'Đã thanh toán',
    COMPLETED: 'Hoàn thành', CANCELLED: 'Đã hủy',
  };
  const statusColors = {
    PENDING: '#f39c12', CONFIRMED: '#3498db', SHIPPED: '#9b59b6',
    DELIVERING: '#9b59b6', ARRIVED: '#e67e22', PAID_TO_SHIPPER: '#1abc9c',
    COMPLETED: '#27ae60', CANCELLED: '#e74c3c',
  };

  const orderStatusData = ordersByStatus.map(s => ({
    name: statusLabels[s._id] || s._id,
    value: s.count,
    color: statusColors[s._id] || '#666',
  }));

  res.status(200).json({
    success: true,
    message: 'Lấy dữ liệu biểu đồ thành công',
    data: {
      revenueByMonth: revenueData,
      usersByMonth: usersData,
      ordersByStatus: orderStatusData,
      topProducts: topProducts.map(p => ({ name: p.name, sold: p.totalSold, revenue: p.revenue })),
    },
  });
}));

module.exports = router;
