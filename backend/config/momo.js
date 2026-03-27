/**
 * MoMo Payment Config - UAT Environment
 * Test without merchant account registration
 */

module.exports = {
  // UAT (User Acceptance Testing) - Không cần tài khoản doanh nghiệp
  endpoint: 'https://test-payment.momo.vn',
  partnerCode: 'MOMO',
  accessKey: 'F8BBA842ECF85',
  secretKey: 'K951B6PE1waDMi640xX08PD3vg6EkVlz',

  // Redirect URLs (sẽ được cập nhật động theo environment)
  redirectUrl: process.env.MOMO_REDIRECT_URL || 'http://localhost:5173/payment-result',
  ipnUrl: process.env.MOMO_IPN_URL || 'https://clothing-shop-api-8wae.onrender.com/api/momo/ipn',
};
