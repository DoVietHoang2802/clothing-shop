const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middlewares/auth');
const { getProductReviews, createReview, updateReview, deleteReview, getAverageRating } = require('../controllers/reviewController');

// @route   GET /api/reviews/product/:productId
// @desc    Lấy reviews của sản phẩm
// @access  Public
router.get('/product/:productId', getProductReviews);

// @route   GET /api/reviews/product/:productId/average
// @desc    Lấy đánh giá trung bình của sản phẩm
// @access  Public
router.get('/product/:productId/average', getAverageRating);

// @route   POST /api/reviews
// @desc    Tạo review mới
// @access  Private/USER
router.post('/', verifyToken, authorizeRoles('USER'), createReview);

// @route   PUT /api/reviews/:id
// @desc    Cập nhật review
// @access  Private/USER
router.put('/:id', verifyToken, authorizeRoles('USER'), updateReview);

// @route   DELETE /api/reviews/:id
// @desc    Xóa review
// @access  Private/USER
router.delete('/:id', verifyToken, authorizeRoles('USER'), deleteReview);

module.exports = router;
