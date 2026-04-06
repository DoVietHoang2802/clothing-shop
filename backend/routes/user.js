const express = require('express');
const { getProfile, updateProfile, getAllUsers, deleteUser, updateUserRole } = require('../controllers/userController');
const { verifyToken, authorizeRoles } = require('../middlewares/auth');

const router = express.Router();

// GET /api/users/profile - Lấy profile người dùng (Private)
router.get('/profile', verifyToken, getProfile);

// PUT /api/users/profile - Cập nhật profile người dùng (Private)
router.put('/profile', verifyToken, updateProfile);

// GET /api/users - Lấy tất cả người dùng (ADMIN only)
router.get('/', verifyToken, authorizeRoles('ADMIN'), getAllUsers);

// PUT /api/users/:id/role - Cập nhật vai trò người dùng (ADMIN only)
router.put('/:id/role', verifyToken, authorizeRoles('ADMIN'), updateUserRole);

// DELETE /api/users/:id - Xóa người dùng (ADMIN only)
router.delete('/:id', verifyToken, authorizeRoles('ADMIN'), deleteUser);

module.exports = router;
