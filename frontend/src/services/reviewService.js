import api from './api';

export const reviewService = {
  // Lấy reviews của sản phẩm
  getProductReviews: async (productId, page = 1, limit = 5) => {
    try {
      const response = await api.get(`/reviews/product/${productId}`, {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Lấy đánh giá trung bình của sản phẩm
  getAverageRating: async (productId) => {
    try {
      const response = await api.get(`/reviews/product/${productId}/average`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Tạo review mới
  createReview: async (productId, rating, comment) => {
    try {
      const response = await api.post('/reviews', {
        productId,
        rating,
        comment,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Cập nhật review
  updateReview: async (reviewId, rating, comment) => {
    try {
      const response = await api.put(`/reviews/${reviewId}`, {
        rating,
        comment,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Xóa review
  deleteReview: async (reviewId) => {
    try {
      const response = await api.delete(`/reviews/${reviewId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default reviewService;
