import api from './api';

const orderService = {
  createOrder: (items) => {
    return api.post('/orders', { items });
  },

  getMyOrders: () => {
    return api.get('/orders/my');
  },

  getOrderById: (id) => {
    return api.get(`/orders/${id}`);
  },

  getAllOrders: () => {
    return api.get('/orders');
  },

  updateOrderStatus: (id, status) => {
    return api.put(`/orders/${id}/status`, { status });
  },

  cancelOrder: (id) => {
    return api.put(`/orders/${id}/cancel`);
  },
};

export default orderService;
