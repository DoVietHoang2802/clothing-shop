const express = require('express');
const {
  createWithdrawal,
  getMyWithdrawals,
  getBalance,
  getAllWithdrawals,
  updateWithdrawalStatus,
} = require('../controllers/withdrawalController');
const { verifyToken, authorizeRoles } = require('../middlewares/auth');

const router = express.Router();

// User routes
router.post('/', verifyToken, authorizeRoles('USER'), createWithdrawal);
router.get('/my', verifyToken, authorizeRoles('USER'), getMyWithdrawals);
router.get('/balance', verifyToken, authorizeRoles('USER'), getBalance);

// Admin routes
router.get('/', verifyToken, authorizeRoles('ADMIN'), getAllWithdrawals);
router.put('/:id/status', verifyToken, authorizeRoles('ADMIN'), updateWithdrawalStatus);

module.exports = router;
