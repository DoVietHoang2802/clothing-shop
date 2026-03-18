import api from './api';

const withdrawalService = {
  // Tạo yêu cầu rút tiền
  createWithdrawal: (data) => {
    return api.post('/withdrawals', data);
  },

  // Lấy danh sách rút tiền của user
  getMyWithdrawals: () => {
    return api.get('/withdrawals/my');
  },

  // Lấy số dư khả dụng
  getBalance: () => {
    return api.get('/withdrawals/balance');
  },

  // Lấy tất cả yêu cầu rút tiền (Admin)
  getAllWithdrawals: () => {
    return api.get('/withdrawals');
  },

  // Cập nhật trạng thái rút tiền (Admin)
  updateWithdrawalStatus: (id, data) => {
    return api.put(`/withdrawals/${id}/status`, data);
  },
};

export default withdrawalService;
