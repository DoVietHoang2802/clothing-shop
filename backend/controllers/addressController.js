/**
 * Address Controller - Quản lý địa chỉ giao hàng
 */

const mongoose = require('mongoose');
const Address = require('../models/Address');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Lấy danh sách địa chỉ của user
// @route   GET /api/addresses
// @access  Private
const getAddresses = asyncHandler(async (req, res) => {
  const addresses = await Address.find({ user: req.user.id })
    .sort({ isDefault: -1, createdAt: -1 });

  res.status(200).json({
    success: true,
    message: 'Lấy danh sách địa chỉ thành công',
    data: addresses,
  });
});

// @desc    Lấy chi tiết một địa chỉ
// @route   GET /api/addresses/:id
// @access  Private
const getAddress = asyncHandler(async (req, res) => {
  const address = await Address.findById(req.params.id);

  if (!address) {
    return res.status(404).json({
      success: false,
      message: 'Địa chỉ không tìm thấy',
      data: null,
    });
  }

  // Kiểm tra address thuộc về user hiện tại
  if (address.user.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Bạn không có quyền truy cập địa chỉ này',
      data: null,
    });
  }

  res.status(200).json({
    success: true,
    message: 'Lấy thông tin địa chỉ thành công',
    data: address,
  });
});

// @desc    Tạo địa chỉ mới
// @route   POST /api/addresses
// @access  Private
const createAddress = asyncHandler(async (req, res) => {
  const { fullName, phone, address, ward, district, city, isDefault, label } = req.body;

  if (!fullName || !phone || !address) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng điền đầy đủ thông tin',
      data: null,
    });
  }

  // Nếu là địa chỉ mặc định, bỏ default các địa chỉ khác
  if (isDefault) {
    await Address.updateMany(
      { user: req.user.id },
      { isDefault: false }
    );
  }

  const newAddress = await Address.create({
    user: req.user.id,
    fullName,
    phone,
    address,
    ward: ward || '',
    district: district || '',
    city: city || '',
    isDefault: isDefault || false,
    label: label || 'home',
  });

  res.status(201).json({
    success: true,
    message: 'Thêm địa chỉ thành công',
    data: newAddress,
  });
});

// @desc    Cập nhật địa chỉ
// @route   PUT /api/addresses/:id
// @access  Private
const updateAddress = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { fullName, phone, address, ward, district, city, isDefault, label } = req.body;

  let addressDoc = await Address.findById(id);

  if (!addressDoc) {
    return res.status(404).json({
      success: false,
      message: 'Địa chỉ không tìm thấy',
      data: null,
    });
  }

  // Kiểm tra address thuộc về user hiện tại
  if (addressDoc.user.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Bạn không có quyền cập nhật địa chỉ này',
      data: null,
    });
  }

  // Nếu set là default, bỏ default các địa chỉ khác
  if (isDefault) {
    await Address.updateMany(
      { user: req.user.id, _id: { $ne: id } },
      { isDefault: false }
    );
  }

  // Cập nhật
  addressDoc.fullName = fullName || addressDoc.fullName;
  addressDoc.phone = phone || addressDoc.phone;
  addressDoc.address = address || addressDoc.address;
  addressDoc.ward = ward !== undefined ? ward : addressDoc.ward;
  addressDoc.district = district !== undefined ? district : addressDoc.district;
  addressDoc.city = city !== undefined ? city : addressDoc.city;
  addressDoc.isDefault = isDefault !== undefined ? isDefault : addressDoc.isDefault;
  addressDoc.label = label || addressDoc.label;

  await addressDoc.save();

  res.status(200).json({
    success: true,
    message: 'Cập nhật địa chỉ thành công',
    data: addressDoc,
  });
});

// @desc    Xóa địa chỉ
// @route   DELETE /api/addresses/:id
// @access  Private
const deleteAddress = asyncHandler(async (req, res) => {
  const address = await Address.findById(req.params.id);

  if (!address) {
    return res.status(404).json({
      success: false,
      message: 'Địa chỉ không tìm thấy',
      data: null,
    });
  }

  // Kiểm tra address thuộc về user hiện tại
  if (address.user.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Bạn không có quyền xóa địa chỉ này',
      data: null,
    });
  }

  await Address.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Xóa địa chỉ thành công',
    data: null,
  });
});

// @desc    Đặt địa chỉ mặc định
// @route   PUT /api/addresses/:id/default
// @access  Private
const setDefaultAddress = asyncHandler(async (req, res) => {
  const address = await Address.findById(req.params.id);

  if (!address) {
    return res.status(404).json({
      success: false,
      message: 'Địa chỉ không tìm thấy',
      data: null,
    });
  }

  // Kiểm tra address thuộc về user hiện tại
  if (address.user.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Bạn không có quyền cập nhật địa chỉ này',
      data: null,
    });
  }

  // Bỏ default các địa chỉ khác
  await Address.updateMany(
    { user: req.user.id },
    { isDefault: false }
  );

  // Set địa chỉ này là default
  address.isDefault = true;
  await address.save();

  res.status(200).json({
    success: true,
    message: 'Đặt địa chỉ mặc định thành công',
    data: address,
  });
});

module.exports = {
  getAddresses,
  getAddress,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
