const express = require('express');
const { register, login, googleAuth, refreshToken, changePassword } = require('../controllers/authController');
const { verifyToken } = require('../middlewares/auth');

const router = express.Router();

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/google
router.post('/google', googleAuth);

// POST /api/auth/refresh-token
router.post('/refresh-token', refreshToken);

// POST /api/auth/change-password
router.post('/change-password', verifyToken, changePassword);

module.exports = router;
