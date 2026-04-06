import api from './api';

export const couponService = {
  // Xác thực và áp dụng coupon
  validateCoupon: async (code, orderTotal) => {
    try {
      const response = await api.post('/coupons/validate', {
        code,
        orderTotal,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Admin: Lấy danh sách coupon
  getAllCoupons: async (page = 1, limit = 12) => {
    try {
      const response = await api.get('/coupons', {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Admin: Lấy chi tiết coupon
  getCoupon: async (couponId) => {
    try {
      const response = await api.get(`/coupons/${couponId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Admin: Tạo coupon mới
  createCoupon: async (couponData) => {
    try {
      const response = await api.post('/coupons', couponData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Admin: Cập nhật coupon
  updateCoupon: async (couponId, couponData) => {
    try {
      const response = await api.put(`/coupons/${couponId}`, couponData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Admin: Xóa coupon
  deleteCoupon: async (couponId) => {
    try {
      const response = await api.delete(`/coupons/${couponId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default couponService;
