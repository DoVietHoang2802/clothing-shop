/**
 * Withdrawal Controller - Giả lập rút tiền
 */

const Withdrawal = require('../models/Withdrawal');
const Order = require('../models/Order');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Tạo yêu cầu rút tiền
// @route   POST /api/withdrawals
// @access  Private/USER
const createWithdrawal = asyncHandler(async (req, res, next) => {
  const { amount, bankName, accountNumber, accountHolder } = req.body;
  const userId = req.user.id;

  if (!amount || amount < 10000) {
    return res.status(400).json({
      success: false,
      message: 'Số tiền rút tối thiểu là 10,000 VNĐ',
      data: null,
    });
  }

  if (!bankName || !accountNumber || !accountHolder) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng cung cấp đầy đủ thông tin ngân hàng',
      data: null,
    });
  }

  // Tính số dư khả dụng (đơn hàng đã thanh toán)
  const paidOrders = await Order.find({
    user: userId,
    paymentStatus: 'PAID'
  });

  const totalRevenue = paidOrders.reduce((sum, order) => sum + (order.finalPrice || order.totalPrice), 0);

  // Tính tổng tiền đã rút
  const withdrawnAmount = await Withdrawal.aggregate([
    { $match: { user: require('mongoose').Types.ObjectId(userId), status: { $in: ['APPROVED', 'COMPLETED'] } } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  const totalWithdrawn = withdrawnAmount[0]?.total || 0;
  const availableBalance = totalRevenue - totalWithdrawn;

  if (amount > availableBalance) {
    return res.status(400).json({
      success: false,
      message: `Số dư khả dụng không đủ. Số dư hiện tại: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(availableBalance)}`,
      data: null,
    });
  }

  // Tạo yêu cầu rút tiền (auto approve cho mock)
  const withdrawal = await Withdrawal.create({
    user: userId,
    amount,
    bankName,
    accountNumber,
    accountHolder,
    status: 'COMPLETED', // Auto approve cho mock
    note: 'Rút tiền thành công (giả lập)',
    processedAt: new Date(),
  });

  await withdrawal.populate('user', 'name email');

  res.status(201).json({
    success: true,
    message: 'Rút tiền thành công!',
    data: withdrawal,
  });
});

// @desc    Lấy danh sách yêu cầu rút tiền của user
// @route   GET /api/withdrawals/my
// @access  Private/USER
const getMyWithdrawals = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;

  const withdrawals = await Withdrawal.find({ user: userId })
    .populate('user', 'name email')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    message: 'Lấy danh sách rút tiền thành công',
    data: withdrawals,
  });
});

// @desc    Lấy số dư khả dụng
// @route   GET /api/withdrawals/balance
// @access  Private/USER
const getBalance = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;

  // Tính tổng doanh thu từ đơn hàng đã thanh toán
  const paidOrders = await Order.find({
    user: userId,
    paymentStatus: 'PAID'
  });

  const totalRevenue = paidOrders.reduce((sum, order) => sum + (order.finalPrice || order.totalPrice), 0);

  // Tính tổng tiền đã rút
  const withdrawnAmount = await Withdrawal.aggregate([
    { $match: { user: require('mongoose').Types.ObjectId(userId), status: { $in: ['APPROVED', 'COMPLETED'] } } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  const totalWithdrawn = withdrawnAmount[0]?.total || 0;
  const availableBalance = totalRevenue - totalWithdrawn;

  res.status(200).json({
    success: true,
    message: 'Lấy số dư thành công',
    data: {
      totalRevenue,
      totalWithdrawn,
      availableBalance,
    },
  });
});

// @desc    Lấy tất cả yêu cầu rút tiền (Admin)
// @route   GET /api/withdrawals
// @access  Private/ADMIN
const getAllWithdrawals = asyncHandler(async (req, res, next) => {
  const withdrawals = await Withdrawal.find()
    .populate('user', 'name email')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    message: 'Lấy danh sách rút tiền thành công',
    data: withdrawals,
  });
});

// @desc    Duyệt/yêu cầu rút tiền (Admin)
// @route   PUT /api/withdrawals/:id/status
// @access  Private/ADMIN
const updateWithdrawalStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { status, note } = req.body;

  const withdrawal = await Withdrawal.findById(id);

  if (!withdrawal) {
    return res.status(404).json({
      success: false,
      message: 'Yêu cầu rút tiền không tìm thấy',
      data: null,
    });
  }

  withdrawal.status = status;
  if (note) withdrawal.note = note;
  if (status === 'COMPLETED' || status === 'APPROVED') {
    withdrawal.processedAt = new Date();
  }

  await withdrawal.save();
  await withdrawal.populate('user', 'name email');

  res.status(200).json({
    success: true,
    message: 'Cập nhật trạng thái thành công',
    data: withdrawal,
  });
});

module.exports = {
  createWithdrawal,
  getMyWithdrawals,
  getBalance,
  getAllWithdrawals,
  updateWithdrawalStatus,
};
