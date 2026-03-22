import api from './api';

const productService = {
  getAllProducts: (params = {}) => {
    // params: { category, search, minPrice, maxPrice, page, limit, sortBy, lowStock, outOfStock }
    const queryParams = new URLSearchParams();

    if (params.category) queryParams.append('category', params.category);
    if (params.search) queryParams.append('search', params.search);
    if (params.minPrice !== undefined) queryParams.append('minPrice', params.minPrice);
    if (params.maxPrice !== undefined) queryParams.append('maxPrice', params.maxPrice);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.lowStock) queryParams.append('lowStock', params.lowStock);
    if (params.outOfStock) queryParams.append('outOfStock', params.outOfStock);

    const url = `/products${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return api.get(url);
  },

  getProductById: (id) => {
    return api.get(`/products/${id}`);
  },

  createProduct: (productData) => {
    return api.post('/products', productData);
  },

  updateProduct: (id, productData) => {
    return api.put(`/products/${id}`, productData);
  },

  deleteProduct: (id) => {
    return api.delete(`/products/${id}`);
  },
};

export default productService;
