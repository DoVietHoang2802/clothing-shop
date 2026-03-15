import api from './api';

const adminService = {
  getStats: () => {
    return api.get('/admin/stats');
  },
};

export default adminService;
