const express = require('express');
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
} = require('../controllers/productController');
const { verifyToken, authorizeRoles } = require('../middlewares/auth');
const upload = require('../config/upload');

const router = express.Router();

// GET /api/products - Lấy tất cả sản phẩm (Public)
router.get('/', getAllProducts);

// POST /api/products/upload - Upload ảnh (ADMIN, STAFF) - phải để trước /:id
router.post('/upload', verifyToken, authorizeRoles('ADMIN', 'STAFF'), upload.single('image'), uploadProductImage);

// GET /api/products/:id - Lấy một sản phẩm (Public)
router.get('/:id', getProductById);

// POST /api/products - Tạo sản phẩm mới (ADMIN, STAFF)
router.post('/', verifyToken, authorizeRoles('ADMIN', 'STAFF'), createProduct);

// PUT /api/products/:id - Cập nhật sản phẩm (ADMIN, STAFF)
router.put('/:id', verifyToken, authorizeRoles('ADMIN', 'STAFF'), updateProduct);

// DELETE /api/products/:id - Xóa sản phẩm (ADMIN only)
router.delete('/:id', verifyToken, authorizeRoles('ADMIN'), deleteProduct);

module.exports = router;
