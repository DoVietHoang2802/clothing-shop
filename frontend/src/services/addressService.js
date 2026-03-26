import api from './api';

const addressService = {
  // Lấy danh sách địa chỉ
  getAddresses: () => {
    return api.get('/addresses');
  },

  // Lấy chi tiết địa chỉ
  getAddress: (id) => {
    return api.get(`/addresses/${id}`);
  },

  // Tạo địa chỉ mới
  createAddress: (data) => {
    return api.post('/addresses', data);
  },

  // Cập nhật địa chỉ
  updateAddress: (id, data) => {
    return api.put(`/addresses/${id}`, data);
  },

  // Xóa địa chỉ
  deleteAddress: (id) => {
    return api.delete(`/addresses/${id}`);
  },

  // Đặt địa chỉ mặc định
  setDefaultAddress: (id) => {
    return api.put(`/addresses/${id}/default`);
  },
};

export default addressService;
