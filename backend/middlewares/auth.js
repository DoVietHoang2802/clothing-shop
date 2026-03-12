const jwt = require('jsonwebtoken');

// Middleware xác thực JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  console.log('=== VERIFY TOKEN ===');
  console.log('Authorization header:', req.headers.authorization);
  console.log('Token extracted:', token ? 'Có' : 'Không có');
  console.log('URL:', req.path);

  if (!token) {
    console.log('❌ Token không được cung cấp');
    return res.status(401).json({
      success: false,
      message: 'Token không được cung cấp',
      data: null,
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token hợp lệ, user ID:', decoded.id);
    req.user = decoded;
    next();
  } catch (error) {
    console.log('❌ Token không hợp lệ:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Token không hợp lệ',
      data: null,
    });
  }
};

// Middleware phân quyền theo role
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Chưa xác thực',
        data: null,
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền thực hiện hành động này',
        data: null,
      });
    }

    next();
  };
};

module.exports = {
  verifyToken,
  authorizeRoles,
};
