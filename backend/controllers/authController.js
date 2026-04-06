const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const admin = require('../config/firebase');

// @desc    Đăng ký người dùng mới
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng cung cấp name, email, password',
      data: null,
    });
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({
      success: false,
      message: 'Email đã tồn tại',
      data: null,
    });
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.status(201).json({
    success: true,
    message: 'Đăng ký thành công',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    },
  });
});

// @desc    Đăng nhập
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng cung cấp email và password',
      data: null,
    });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Email hoặc mật khẩu không chính xác',
      data: null,
    });
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Email hoặc mật khẩu không chính xác',
      data: null,
    });
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.status(200).json({
    success: true,
    message: 'Đăng nhập thành công',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    },
  });
});

// @desc    Đăng nhập với Google OAuth
// @route   POST /api/auth/google
// @access  Public
const googleAuth = asyncHandler(async (req, res, next) => {
  const { googleToken } = req.body;

  if (!googleToken) {
    return res.status(400).json({
      success: false,
      message: 'Google token là bắt buộc',
      data: null,
    });
  }

  try {
    // Verify Google token using Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(googleToken);

    const { uid, email, name, picture } = decodedToken;

    // Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user from Google data
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        provider: 'google',
        providerId: uid,
        avatar: picture || null,
      });
    } else if (user.provider === 'local') {
      // Link Google account to existing local user
      user.provider = 'google';
      user.providerId = uid;
      user.avatar = picture || user.avatar;
      await user.save();
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Đăng nhập với Google thành công',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    return res.status(401).json({
      success: false,
      message: 'Google token không hợp lệ hoặc đã hết hạn',
      data: null,
    });
  }
});

// @desc    Làm mới token
// @route   POST /api/auth/refresh-token
// @access  Public
const refreshToken = asyncHandler(async (req, res, next) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: 'Token là bắt buộc',
      data: null,
    });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({
      success: false,
      message: 'JWT_SECRET chưa được cấu hình trên server',
      data: null,
    });
  }

  try {
    // Verify token với ignoreExpiration để đảm bảo chữ ký hợp lệ,
    // chỉ bỏ qua việc hết hạn
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      ignoreExpiration: true,
    });

    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ',
        data: null,
      });
    }

    // Lấy user từ database
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Người dùng không tìm thấy',
        data: null,
      });
    }

    // Tạo token mới
    const newToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Làm mới token thành công',
      data: {
        token: newToken,
      },
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token không hợp lệ',
      data: null,
    });
  }
});

// @desc    Đổi mật khẩu
// @route   POST /api/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  const userId = req.user.id;

  // Validation
  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng cung cấp mật khẩu hiện tại, mật khẩu mới và xác nhận mật khẩu',
      data: null,
    });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: 'Mật khẩu mới không khớp',
      data: null,
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Mật khẩu mới phải có ít nhất 6 ký tự',
      data: null,
    });
  }

  if (currentPassword === newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Mật khẩu mới không được trùng với mật khẩu hiện tại',
      data: null,
    });
  }

  // Get user
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Người dùng không tìm thấy',
      data: null,
    });
  }

  // OAuth users don't have password
  if (user.provider !== 'local') {
    return res.status(400).json({
      success: false,
      message: 'Tài khoản Google không có mật khẩu. Vui lòng sử dụng đăng nhập Google.',
      data: null,
    });
  }

  // Check current password
  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Mật khẩu hiện tại không chính xác',
      data: null,
    });
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Đổi mật khẩu thành công',
    data: null,
  });
});

// @desc    Quên mật khẩu - gửi email reset
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng cung cấp email',
      data: null,
    });
  }

  const user = await User.findOne({ email });

  // Không tiết lộ email có tồn tại hay không (security)
  if (!user || user.provider !== 'local') {
    return res.status(200).json({
      success: true,
      message: 'Nếu email tồn tại trong hệ thống, bạn sẽ nhận được liên kết đặt lại mật khẩu.',
      data: null,
    });
  }

  // Tạo reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

  // Lưu token vào database (hash trước khi lưu)
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 phút
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Nếu email tồn tại trong hệ thống, bạn sẽ nhận được liên kết đặt lại mật khẩu.',
    data: {
      // ⚠️ DEV MODE: Trả token về để test. Production nên gửi email thật.
      resetToken: resetToken,
      resetUrl: resetUrl,
      expiresIn: '15 phút',
    },
  });
});

// @desc    Reset mật khẩu với token
// @route   POST /api/auth/reset-password/:token
// @access  Public
const resetPassword = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  const { newPassword, confirmPassword } = req.body;

  if (!newPassword || !confirmPassword) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng cung cấp mật khẩu mới và xác nhận mật khẩu',
      data: null,
    });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: 'Mật khẩu mới không khớp',
      data: null,
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Mật khẩu mới phải có ít nhất 6 ký tự',
      data: null,
    });
  }

  // Hash token để so sánh với database
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // Tìm user với token và kiểm tra hết hạn
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'Token không hợp lệ hoặc đã hết hạn',
      data: null,
    });
  }

  // Cập nhật mật khẩu mới
  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Đặt lại mật khẩu thành công. Bạn có thể đăng nhập với mật khẩu mới.',
    data: null,
  });
});

module.exports = {
  register,
  login,
  googleAuth,
  refreshToken,
  changePassword,
  forgotPassword,
  resetPassword,
};
