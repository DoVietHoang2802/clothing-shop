const Wishlist = require('../models/Wishlist');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Lấy wishlist của user
// @route   GET /api/wishlist
// @access  Private/USER
const getWishlist = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const { page = 1, limit = 12 } = req.query;

  const wishlist = await Wishlist.find({ user: userId })
    .populate('product')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Wishlist.countDocuments({ user: userId });

  res.status(200).json({
    success: true,
    message: 'Lấy wishlist thành công',
    data: wishlist,
    pagination: {
      currentPage: page,
      pageSize: limit,
      total: total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

// @desc    Thêm sản phẩm vào wishlist
// @route   POST /api/wishlist
// @access  Private/USER
const addToWishlist = asyncHandler(async (req, res, next) => {
  const { productId } = req.body;
  const userId = req.user.id;

  if (!productId) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng cung cấp productId',
      data: null,
    });
  }

  // Check if already in wishlist
  const existing = await Wishlist.findOne({ user: userId, product: productId });
  if (existing) {
    return res.status(400).json({
      success: false,
      message: 'Sản phẩm đã có trong wishlist',
      data: null,
    });
  }

  const wishlistItem = await Wishlist.create({
    user: userId,
    product: productId,
  });

  await wishlistItem.populate('product');

  res.status(201).json({
    success: true,
    message: 'Thêm vào wishlist thành công',
    data: wishlistItem,
  });
});

// @desc    Xóa sản phẩm khỏi wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private/USER
const removeFromWishlist = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  const userId = req.user.id;

  const result = await Wishlist.deleteOne({ user: userId, product: productId });

  if (result.deletedCount === 0) {
    return res.status(404).json({
      success: false,
      message: 'Sản phẩm không có trong wishlist',
      data: null,
    });
  }

  res.status(200).json({
    success: true,
    message: 'Xóa khỏi wishlist thành công',
    data: null,
  });
});

// @desc    Kiểm tra sản phẩm có trong wishlist không
// @route   GET /api/wishlist/check/:productId
// @access  Private/USER
const checkInWishlist = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  const userId = req.user.id;

  const wishlistItem = await Wishlist.findOne({ user: userId, product: productId });

  res.status(200).json({
    success: true,
    message: 'Kiểm tra wishlist thành công',
    data: { inWishlist: !!wishlistItem },
  });
});

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkInWishlist,
};
