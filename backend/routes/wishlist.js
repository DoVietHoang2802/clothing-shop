const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middlewares/auth');
const { getWishlist, addToWishlist, removeFromWishlist, checkInWishlist } = require('../controllers/wishlistController');

// @route   GET /api/wishlist
// @desc    Lấy wishlist của user
// @access  Private/USER,STAFF,ADMIN
router.get('/', verifyToken, authorizeRoles('USER', 'STAFF', 'ADMIN'), getWishlist);

// @route   POST /api/wishlist
// @desc    Thêm sản phẩm vào wishlist
// @access  Private/USER,STAFF,ADMIN
router.post('/', verifyToken, authorizeRoles('USER', 'STAFF', 'ADMIN'), addToWishlist);

// @route   DELETE /api/wishlist/:productId
// @desc    Xóa sản phẩm khỏi wishlist
// @access  Private/USER,STAFF,ADMIN
router.delete('/:productId', verifyToken, authorizeRoles('USER', 'STAFF', 'ADMIN'), removeFromWishlist);

// @route   GET /api/wishlist/check/:productId
// @desc    Kiểm tra sản phẩm có trong wishlist không
// @access  Private/USER,STAFF,ADMIN
router.get('/check/:productId', verifyToken, authorizeRoles('USER', 'STAFF', 'ADMIN'), checkInWishlist);

module.exports = router;
