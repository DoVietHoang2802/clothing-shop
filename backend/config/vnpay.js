/**
 * VNPay Configuration
 * Sử dụng VNPay Sandbox cho môi trường test
 */

const vnpayConfig = {
  // Sandbox URL (test)
  vnp_Url: process.env.VNP_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
  vnp_ReturnUrl: process.env.VNP_RETURN_URL || 'http://localhost:5173/payment-result',
  // Production URL (khi deploy)
  // vnp_Url: 'https://pay.vnpay.vn/vpcpay.html',
  // vnp_ReturnUrl: 'https://your-domain.com/payment-result',

  // Mã TMN được cấp bởi VNPay
  vnp_TmnCode: process.env.VNP_TMN_CODE || 'YOUR_TMN_CODE',

  // Secret key được cấp bởi VNPay
  vnp_HashSecret: process.env.VNP_HASH_SECRET || 'YOUR_HASH_SECRET',

  // Version của VNPay API
  vnp_Version: '2.1.0',

  // Command - thanh toán
  vnp_Command: 'pay',

  // Loại hàng hóa
  vnp_OrderType: 'other',

  // Ngôn ngữ
  vnp_Locale: 'vn',

  // Currency - VND
  vnp_CurrCode: 'VND',
};

module.exports = vnpayConfig;
