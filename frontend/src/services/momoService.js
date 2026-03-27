/**
 * MoMo Payment Service
 */

import api from './api';

const momoService = {
  // Tạo payment MoMo
  createPayment: async (orderId) => {
    const response = await api.post('/momo/create', { orderId });
    return response;
  },

  // Query transaction status
  queryTransaction: async (orderId) => {
    const response = await api.get(`/momo/query/${orderId}`);
    return response;
  },
};

export default momoService;
