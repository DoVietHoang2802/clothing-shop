// Middleware xử lý lỗi tập trung
const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Lỗi máy chủ nội bộ';

  console.error(`[ERROR] Status: ${status}, Message: ${message}`);

  res.status(status).json({
    success: false,
    message: message,
    data: null,
  });
};

module.exports = errorHandler;
