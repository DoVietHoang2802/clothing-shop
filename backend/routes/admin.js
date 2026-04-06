const express = require('express');
const { getStats, getChartData } = require('../controllers/adminController');
const { verifyToken, authorizeRoles } = require('../middlewares/auth');

const router = express.Router();

// @desc    Lấy thống kê dashboard
// @route   GET /api/admin/stats
// @access  Private/ADMIN
router.get('/stats', verifyToken, authorizeRoles('ADMIN'), getStats);

// @desc    Lấy dữ liệu biểu đồ
// @route   GET /api/admin/stats/chart
// @access  Private/ADMIN
router.get('/stats/chart', verifyToken, authorizeRoles('ADMIN'), getChartData);

module.exports = router;
