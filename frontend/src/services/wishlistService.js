import api from './api';

export const wishlistService = {
  // Lấy wishlist của user
  getWishlist: async (page = 1, limit = 12) => {
    try {
      const response = await api.get('/wishlist', {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Thêm sản phẩm vào wishlist
  addToWishlist: async (productId) => {
    try {
      const response = await api.post('/wishlist', {
        productId,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Xóa sản phẩm khỏi wishlist
  removeFromWishlist: async (productId) => {
    try {
      const response = await api.delete(`/wishlist/${productId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Kiểm tra sản phẩm có trong wishlist không
  checkInWishlist: async (productId) => {
    try {
      const response = await api.get(`/wishlist/check/${productId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default wishlistService;
