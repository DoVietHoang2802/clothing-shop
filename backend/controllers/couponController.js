const Coupon = require('../models/Coupon');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Lấy danh sách coupon (admin only)
// @route   GET /api/coupons
// @access  Private/ADMIN
const getAllCoupons = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 12 } = req.query;

  const coupons = await Coupon.find()
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Coupon.countDocuments();

  res.status(200).json({
    success: true,
    message: 'Lấy danh sách coupon thành công',
    data: coupons,
    pagination: {
      currentPage: page,
      pageSize: limit,
      total: total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

// @desc    Lấy chi tiết coupon (admin only)
// @route   GET /api/coupons/:id
// @access  Private/ADMIN
const getCoupon = asyncHandler(async (req, res, next) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy coupon',
      data: null,
    });
  }

  res.status(200).json({
    success: true,
    message: 'Lấy chi tiết coupon thành công',
    data: coupon,
  });
});

// @desc    Xác thực và áp dụng coupon
// @route   POST /api/coupons/validate
// @access  Public
const validateCoupon = asyncHandler(async (req, res, next) => {
  const { code, orderTotal } = req.body;

  if (!code) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng cung cấp mã coupon',
      data: null,
    });
  }

  if (orderTotal === undefined || orderTotal === null) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng cung cấp tổng giá trị đơn hàng',
      data: null,
    });
  }

  const coupon = await Coupon.findOne({ code: code.toUpperCase() });

  // Kiểm tra coupon tồn tại
  if (!coupon) {
    return res.status(404).json({
      success: false,
      message: 'Mã coupon không hợp lệ',
      data: null,
    });
  }

  // Kiểm tra coupon có hiệu lực
  if (!coupon.isActive) {
    return res.status(400).json({
      success: false,
      message: 'Mã coupon đã vô hiệu hóa',
      data: null,
    });
  }

  // Kiểm tra coupon hết hạn
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    return res.status(400).json({
      success: false,
      message: 'Mã coupon đã hết hạn',
      data: null,
    });
  }

  // Kiểm tra số lần sử dụng
  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
    return res.status(400).json({
      success: false,
      message: 'Mã coupon đã được sử dụng hết',
      data: null,
    });
  }

  const numericOrderTotal = Number(orderTotal);
  if (Number.isNaN(numericOrderTotal) || numericOrderTotal < 0) {
    return res.status(400).json({
      success: false,
      message: 'Tổng giá trị đơn hàng không hợp lệ',
      data: null,
    });
  }

  // Kiểm tra giá trị đơn hàng tối thiểu
  if (coupon.minOrderValue && numericOrderTotal < coupon.minOrderValue) {
    return res.status(400).json({
      success: false,
      message: `Giá trị đơn hàng phải từ ${coupon.minOrderValue.toLocaleString('vi-VN')} ₫`,
      data: null,
    });
  }

  // Tính toán discount
  let discountAmount = 0;
  if (coupon.discountType === 'PERCENTAGE') {
    discountAmount = (numericOrderTotal * coupon.discountValue) / 100;
    // Nếu có maxDiscount thì không được vượt quá
    if (coupon.maxDiscount) {
      discountAmount = Math.min(discountAmount, coupon.maxDiscount);
    }
  } else if (coupon.discountType === 'FIXED') {
    discountAmount = coupon.discountValue;
  }

  res.status(200).json({
    success: true,
    message: 'Mã coupon hợp lệ',
    data: {
      coupon: coupon.toObject(),
      discountAmount: Math.floor(discountAmount),
      finalTotal: Math.floor(orderTotal - discountAmount),
    },
  });
});

// @desc    Tạo coupon mới (admin only)
// @route   POST /api/coupons
// @access  Private/ADMIN
const createCoupon = asyncHandler(async (req, res, next) => {
  const { code, discountType, discountValue, minOrderValue, maxDiscount, usageLimit, expiresAt } = req.body;

  // Validate input
  if (!code || !discountType || !discountValue) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng cung cấp code, discountType và discountValue',
      data: null,
    });
  }

  if (!['PERCENTAGE', 'FIXED'].includes(discountType)) {
    return res.status(400).json({
      success: false,
      message: 'discountType phải là PERCENTAGE hoặc FIXED',
      data: null,
    });
  }

  if (discountType === 'PERCENTAGE' && (discountValue < 0 || discountValue > 100)) {
    return res.status(400).json({
      success: false,
      message: 'Phần trăm giảm giá phải từ 0 đến 100',
      data: null,
    });
  }

  if (discountValue < 0) {
    return res.status(400).json({
      success: false,
      message: 'Giá trị giảm giá không được âm',
      data: null,
    });
  }

  const coupon = await Coupon.create({
    code: code.toUpperCase(),
    discountType,
    discountValue,
    minOrderValue: minOrderValue || 0,
    maxDiscount: maxDiscount || null,
    usageLimit: usageLimit || null,
    expiresAt: expiresAt || null,
    isActive: true,
  });

  res.status(201).json({
    success: true,
    message: 'Tạo coupon thành công',
    data: coupon,
  });
});

// @desc    Cập nhật coupon (admin only)
// @route   PUT /api/coupons/:id
// @access  Private/ADMIN
const updateCoupon = asyncHandler(async (req, res, next) => {
  let coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy coupon',
      data: null,
    });
  }

  const { code, discountType, discountValue, minOrderValue, maxDiscount, usageLimit, expiresAt, isActive } = req.body;

  if (code) {
    // Check if code already exists
    const existing = await Coupon.findOne({ code: code.toUpperCase(), _id: { $ne: req.params.id } });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Mã coupon đã tồn tại',
        data: null,
      });
    }
    coupon.code = code.toUpperCase();
  }

  if (discountType) {
    if (!['PERCENTAGE', 'FIXED'].includes(discountType)) {
      return res.status(400).json({
        success: false,
        message: 'discountType phải là PERCENTAGE hoặc FIXED',
        data: null,
      });
    }
    coupon.discountType = discountType;
  }

  if (discountValue !== undefined) {
    if (coupon.discountType === 'PERCENTAGE' && (discountValue < 0 || discountValue > 100)) {
      return res.status(400).json({
        success: false,
        message: 'Phần trăm giảm giá phải từ 0 đến 100',
        data: null,
      });
    }
    if (discountValue < 0) {
      return res.status(400).json({
        success: false,
        message: 'Giá trị giảm giá không được âm',
        data: null,
      });
    }
    coupon.discountValue = discountValue;
  }

  if (minOrderValue !== undefined) coupon.minOrderValue = minOrderValue;
  if (maxDiscount !== undefined) coupon.maxDiscount = maxDiscount;
  if (usageLimit !== undefined) coupon.usageLimit = usageLimit;
  if (expiresAt !== undefined) coupon.expiresAt = expiresAt;
  if (isActive !== undefined) coupon.isActive = isActive;

  coupon = await coupon.save();

  res.status(200).json({
    success: true,
    message: 'Cập nhật coupon thành công',
    data: coupon,
  });
});

// @desc    Xóa coupon (admin only)
// @route   DELETE /api/coupons/:id
// @access  Private/ADMIN
const deleteCoupon = asyncHandler(async (req, res, next) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);

  if (!coupon) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy coupon',
      data: null,
    });
  }

  res.status(200).json({
    success: true,
    message: 'Xóa coupon thành công',
    data: null,
  });
});

module.exports = {
  getAllCoupons,
  getCoupon,
  validateCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
};
