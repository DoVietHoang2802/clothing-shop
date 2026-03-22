const Review = require('../models/Review');
const Product = require('../models/Product');
const mongoose = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Lấy review của sản phẩm
// @route   GET /api/reviews/product/:productId
// @access  Public
const getProductReviews = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  const { page = 1, limit = 5 } = req.query;

  const reviews = await Review.find({ product: productId })
    .populate('user', 'name')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Review.countDocuments({ product: productId });

  res.status(200).json({
    success: true,
    message: 'Lấy review thành công',
    data: reviews,
    pagination: {
      currentPage: page,
      pageSize: limit,
      total: total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

// @desc    Tạo review
// @route   POST /api/reviews
// @access  Private/USER
const createReview = asyncHandler(async (req, res, next) => {
  const { productId, rating, comment } = req.body;
  const userId = req.user.id;

  // Validation
  if (!productId || !rating || !comment) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng cung cấp productId, rating, comment',
      data: null,
    });
  }

  // Check product exists
  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Sản phẩm không tìm thấy',
      data: null,
    });
  }

  // Check if user already reviewed
  const existingReview = await Review.findOne({ product: productId, user: userId });
  if (existingReview) {
    return res.status(400).json({
      success: false,
      message: 'Bạn đã review sản phẩm này rồi',
      data: null,
    });
  }

  const review = await Review.create({
    product: productId,
    user: userId,
    rating: parseInt(rating),
    comment,
  });

  await review.populate('user', 'name');

  res.status(201).json({
    success: true,
    message: 'Tạo review thành công',
    data: review,
  });
});

// @desc    Cập nhật review
// @route   PUT /api/reviews/:id
// @access  Private/USER
const updateReview = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user.id;

  let review = await Review.findById(id);
  if (!review) {
    return res.status(404).json({
      success: false,
      message: 'Review không tìm thấy',
      data: null,
    });
  }

  // Check ownership
  if (review.user.toString() !== userId) {
    return res.status(403).json({
      success: false,
      message: 'Bạn không có quyền cập nhật review này',
      data: null,
    });
  }

  if (rating) review.rating = parseInt(rating);
  if (comment) review.comment = comment;

  review = await review.save();
  await review.populate('user', 'name');

  res.status(200).json({
    success: true,
    message: 'Cập nhật review thành công',
    data: review,
  });
});

// @desc    Xóa review
// @route   DELETE /api/reviews/:id
// @access  Private/USER
const deleteReview = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  const review = await Review.findById(id);
  if (!review) {
    return res.status(404).json({
      success: false,
      message: 'Review không tìm thấy',
      data: null,
    });
  }

  // Check ownership
  if (review.user.toString() !== userId) {
    return res.status(403).json({
      success: false,
      message: 'Bạn không có quyền xóa review này',
      data: null,
    });
  }

  await Review.deleteOne({ _id: id });

  res.status(200).json({
    success: true,
    message: 'Xóa review thành công',
    data: null,
  });
});

// @desc    Lấy rating trung bình của sản phẩm
// @route   GET /api/reviews/product/:productId/average
// @access  Public
const getAverageRating = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(200).json({
      success: true,
      message: 'Lấy rating trung bình thành công',
      data: { averageRating: 0, totalReviews: 0 },
    });
  }

  const result = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId) } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  const data = result.length > 0 ? result[0] : { averageRating: 0, totalReviews: 0 };

  res.status(200).json({
    success: true,
    message: 'Lấy rating trung bình thành công',
    data,
  });
});

module.exports = {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  getAverageRating,
};
