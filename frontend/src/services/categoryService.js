import api from './api';

const categoryService = {
  getAllCategories: () => {
    return api.get('/categories');
  },

  createCategory: (categoryData) => {
    return api.post('/categories', categoryData);
  },

  updateCategory: (id, categoryData) => {
    return api.put(`/categories/${id}`, categoryData);
  },

  deleteCategory: (id) => {
    return api.delete(`/categories/${id}`);
  },
};

export default categoryService;
