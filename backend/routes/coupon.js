const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middlewares/auth');
const { getAllCoupons, getCoupon, validateCoupon, createCoupon, updateCoupon, deleteCoupon } = require('../controllers/couponController');

// @route   POST /api/coupons/validate
// @desc    Xác thực và áp dụng coupon
// @access  Public
router.post('/validate', validateCoupon);

// @route   GET /api/coupons
// @desc    Lấy danh sách coupon (admin only)
// @access  Private/ADMIN
router.get('/', verifyToken, authorizeRoles('ADMIN'), getAllCoupons);

// @route   GET /api/coupons/:id
// @desc    Lấy chi tiết coupon (admin only)
// @access  Private/ADMIN
router.get('/:id', verifyToken, authorizeRoles('ADMIN'), getCoupon);

// @route   POST /api/coupons
// @desc    Tạo coupon mới (admin only)
// @access  Private/ADMIN
router.post('/', verifyToken, authorizeRoles('ADMIN'), createCoupon);

// @route   PUT /api/coupons/:id
// @desc    Cập nhật coupon (admin only)
// @access  Private/ADMIN
router.put('/:id', verifyToken, authorizeRoles('ADMIN'), updateCoupon);

// @route   DELETE /api/coupons/:id
// @desc    Xóa coupon (admin only)
// @access  Private/ADMIN
router.delete('/:id', verifyToken, authorizeRoles('ADMIN'), deleteCoupon);

module.exports = router;
