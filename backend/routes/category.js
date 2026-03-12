const express = require('express');
const {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { verifyToken, authorizeRoles } = require('../middlewares/auth');

const router = express.Router();

// GET /api/categories - Lấy tất cả danh mục (Public)
router.get('/', getAllCategories);

// POST /api/categories - Tạo danh mục mới (ADMIN only)
router.post('/', verifyToken, authorizeRoles('ADMIN'), createCategory);

// PUT /api/categories/:id - Cập nhật danh mục (ADMIN only)
router.put('/:id', verifyToken, authorizeRoles('ADMIN'), updateCategory);

// DELETE /api/categories/:id - Xóa danh mục (ADMIN only)
router.delete('/:id', verifyToken, authorizeRoles('ADMIN'), deleteCategory);

module.exports = router;
