import api from './api';

const paymentService = {
  // Tạo link thanh toán VNPay
  createVNPayPayment: (orderId) => {
    return api.post('/payment/vnpay/create', { orderId });
  },

  // Kiểm tra trạng thái thanh toán
  checkPaymentStatus: (orderId) => {
    return api.get(`/payment/vnpay/status/${orderId}`);
  },
};

export default paymentService;
