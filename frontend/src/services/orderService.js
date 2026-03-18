import api from './api';

const orderService = {
  createOrder: (items, couponCode = null, shippingAddress = null, paymentMethod = 'COD') => {
    return api.post('/orders', { items, couponCode, shippingAddress, paymentMethod });
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

  deleteOrder: (id) => {
    return api.delete(`/orders/${id}`);
  },

  deleteOrderAdmin: (id) => {
    return api.delete(`/orders/admin/${id}`);
  },
};

export default orderService;
