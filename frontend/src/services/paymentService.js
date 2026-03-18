import api from './api';

const paymentService = {
  // Tạo link thanh toán Mock (giả lập VNPay)
  createMockPayment: (orderId) => {
    return api.post('/payment/vnpay/create', { orderId });
  },

  // Xác nhận thanh toán mock
  confirmMockPayment: (orderId) => {
    return api.post('/payment/mock/confirm', { orderId });
  },

  // Hủy thanh toán mock (hủy đơn + restore stock)
  cancelMockPayment: (orderId) => {
    return api.post('/payment/mock/cancel', { orderId });
  },

  // Kiểm tra trạng thái thanh toán
  checkPaymentStatus: (orderId) => {
    return api.get(`/payment/vnpay/status/${orderId}`);
  },
};

export default paymentService;
