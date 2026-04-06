const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Lấy profile người dùng hiện tại
// @route   GET /api/users/profile
// @access  Private
const getProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('-password');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Người dùng không tìm thấy',
      data: null,
    });
  }

  res.status(200).json({
    success: true,
    message: 'Lấy profile thành công',
    data: user,
  });
});

// @desc    Cập nhật profile người dùng
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res, next) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng cung cấp tên và email',
      data: null,
    });
  }

  // Kiểm tra email đã được sử dụng bởi user khác chưa
  const existingUser = await User.findOne({
    email,
    _id: { $ne: req.user.id },
  });

  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'Email đã được sử dụng bởi người dùng khác',
      data: null,
    });
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { name, email },
    { new: true, runValidators: true }
  ).select('-password');

  res.status(200).json({
    success: true,
    message: 'Cập nhật profile thành công',
    data: user,
  });
});

// @desc    Lấy tất cả người dùng
// @route   GET /api/users
// @access  Private/ADMIN
const getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find().select('-password');

  res.status(200).json({
    success: true,
    message: 'Lấy danh sách người dùng thành công',
    data: users,
  });
});

// @desc    Lấy chi tiết người dùng
// @route   GET /api/users/:id
// @access  Private/ADMIN
// NOTE: This method is defined but not exported - no route uses it
const getUserById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findById(id).select('-password');
  if (!user) {
    return res.status(404).json({ success: false, message: 'Người dùng không tìm thấy', data: null });
  }
  res.status(200).json({ success: true, message: 'Lấy chi tiết người dùng thành công', data: user });
});

// @desc    Cập nhật role người dùng
// @route   PUT /api/users/:id/role
// @access  Private/ADMIN
const updateUserRole = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!role) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng cung cấp vai trò',
      data: null,
    });
  }

  if (!['USER', 'STAFF', 'ADMIN'].includes(role)) {
    return res.status(400).json({
      success: false,
      message: 'Vai trò không hợp lệ. Chỉ chấp nhận: USER, STAFF, ADMIN',
      data: null,
    });
  }

  const user = await User.findByIdAndUpdate(
    id,
    { role },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Người dùng không tìm thấy',
      data: null,
    });
  }

  res.status(200).json({
    success: true,
    message: 'Cập nhật vai trò người dùng thành công',
    data: user,
  });
});

// @desc    Xóa người dùng
// @route   DELETE /api/users/:id
// @access  Private/ADMIN
const deleteUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findByIdAndDelete(id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Người dùng không tìm thấy',
      data: null,
    });
  }

  res.status(200).json({
    success: true,
    message: 'Xóa người dùng thành công',
    data: user,
  });
});

module.exports = {
  getProfile,
  updateProfile,
  getAllUsers,
  updateUserRole,
  deleteUser,
};
