/**
 * VNPay Utility Functions
 * Xử lý tạo payment URL và verify callback
 */

const crypto = require('crypto');
const vnpayConfig = require('./vnpay');

/**
 * Tạo URL thanh toán VNPay
 * @param {Object} params - Tham số thanh toán
 * @param {string} params.amount - Số tiền (VND)
 * @param {string} params.orderId - Mã đơn hàng
 * @param {string} params.orderDescription - Mô tả đơn hàng
 * @param {string} params.ipAddr - Địa chỉ IP của client
 * @returns {string} - URL thanh toán VNPay
 */
const createPaymentUrl = (params) => {
  const { amount, orderId, orderDescription, ipAddr } = params;

  const date = new Date();

  // Tạo các tham số
  const vnp_Params = {
    vnp_Version: vnpayConfig.vnp_Version,
    vnp_Command: vnpayConfig.vnp_Command,
    vnp_TmnCode: vnpayConfig.vnp_TmnCode,
    vnp_Amount: amount * 100, // VNPay yêu cầu * 100
    vnp_CurrCode: vnpayConfig.vnp_CurrCode,
    vnp_Locale: vnpayConfig.vnp_Locale,
    vnp_OrderType: vnpayConfig.vnp_OrderType,
    vnp_ReturnUrl: vnpayConfig.vnp_ReturnUrl,
    vnp_OrderInfo: orderDescription,
    vnp_OrderId: orderId,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: formatDate(date),
    vnp_ExpireDate: formatDate(new Date(date.getTime() + 15 * 60 * 1000)), // Hết hạn sau 15 phút
  };

  // Sắp xếp theo alphabet
  const sortedParams = sortObject(vnp_Params);

  // Tạo chuỗi query
  const queryString = Object.keys(sortedParams)
    .map(key => `${key}=${encodeURIComponent(sortedParams[key])}`)
    .join('&');

  // Tạo secure hash
  const hmac = crypto.createHmac('sha512', vnpayConfig.vnp_HashSecret);
  const signed = hmac.update(Buffer.from(queryString, 'utf-8')).digest('hex');

  // Tạo URL đầy đủ
  const paymentUrl = `${vnpayConfig.vnp_Url}?${queryString}&vnp_SecureHash=${signed}`;

  return paymentUrl;
};

/**
 * Verify callback từ VNPay
 * @param {Object} vnp_Params - Tham số từ VNPay callback
 * @returns {boolean} - Kết quả verify
 */
const verifyCallback = (vnp_Params) => {
  const secureHash = vnp_Params.vnp_SecureHash;

  // Remove secure hash from params để verify
  delete vnp_Params.vnp_SecureHash;
  delete vnp_Params.vnp_SecureHashType;

  // Sắp xếp theo alphabet
  const sortedParams = sortObject(vnp_Params);

  // Tạo chuỗi query không có secure hash
  const queryString = Object.keys(sortedParams)
    .map(key => `${key}=${encodeURIComponent(sortedParams[key])}`)
    .join('&');

  // Tạo hash để so sánh
  const hmac = crypto.createHmac('sha512', vnpayConfig.vnp_HashSecret);
  const signed = hmac.update(Buffer.from(queryString, 'utf-8')).digest('hex');

  return secureHash === signed;
};

/**
 * Format date to VNPay format (yyyyMMddHHmmss)
 */
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}${month}${day}${hours}${minutes}${seconds}`;
};

/**
 * Sort object by key (alphabetical)
 */
const sortObject = (obj) => {
  const sorted = {};
  const keys = Object.keys(obj).sort();

  keys.forEach(key => {
    sorted[key] = obj[key];
  });

  return sorted;
};

/**
 * Get response code message
 */
const getResponseMessage = (code) => {
  const codes = {
    '00': 'Giao dịch thành công',
    '07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, gian lận)',
    '09': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng',
    '10': 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
    '11': 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán',
    '12': 'Giao dịch không thành công do: Thẻ/Tài khoản bị khóa',
    '13': 'Giao dịch không thành công do: Nhập sai mật khẩu xác thực giao dịch (OTP)',
    '24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
    '51': 'Giao dịch không thành công do: Tài khoản không đủ số dư để thực hiện giao dịch',
    '65': 'Giao dịch không thành công do: Tài khoản đã vượt quá hạn mức giao dịch trong ngày',
    '75': 'Ngân hàng thanh toán đang bảo trì',
    '79': 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định',
    '99': 'Lỗi khác',
  };

  return codes[code] || 'Lỗi không xác định';
};

module.exports = {
  createPaymentUrl,
  verifyCallback,
  getResponseMessage,
  formatDate,
};
